import { NextResponse } from "next/server";
import type { GHAdvisory, MSRCRelease, CloudflareData, SicherheitstachoData } from "@/lib/kpi-types";

export type { GHAdvisory, MSRCRelease, CloudflareData, SicherheitstachoData };

interface KPIsResponse {
  cisaKev: { total: number; newThisWeek: number; newToday: number; lastAdded: string } | null;
  nvd: { criticalToday: number; highToday: number } | null;
  github: { recent: GHAdvisory[]; criticalCount: number; highCount: number } | null;
  msrc: MSRCRelease | null;
  cloudflare: CloudflareData | null;
  sicherheitstacho: SicherheitstachoData | null;
  fetchedAt: string;
  errors: string[];
}

// ── Fetchers ───────────────────────────────────────────────────────────────

async function fetchCisaKev() {
  const res = await fetch(
    "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
    { signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as {
    count: number;
    vulnerabilities: { dateAdded: string; cveID: string; vendorProject: string }[];
  };
  const now = Date.now(), week = 7 * 864e5, day = 864e5;
  const sorted = [...data.vulnerabilities].sort(
    (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
  );
  return {
    total: data.count,
    newThisWeek: data.vulnerabilities.filter(v => now - new Date(v.dateAdded).getTime() < week).length,
    newToday:    data.vulnerabilities.filter(v => now - new Date(v.dateAdded).getTime() < day).length,
    lastAdded: sorted[0] ? `${sorted[0].cveID} (${sorted[0].vendorProject})` : "—",
  };
}

async function fetchNvd() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = today.toISOString().replace(".000Z", ".000");
  const [cr, hr] = await Promise.all([
    fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${start}&cvssV3Severity=CRITICAL&resultsPerPage=1`, { signal: AbortSignal.timeout(9000) }),
    fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${start}&cvssV3Severity=HIGH&resultsPerPage=1`,     { signal: AbortSignal.timeout(9000) }),
  ]);
  return {
    criticalToday: cr.ok ? ((await cr.json()) as { totalResults: number }).totalResults : 0,
    highToday:     hr.ok ? ((await hr.json()) as { totalResults: number }).totalResults : 0,
  };
}

async function fetchGitHub(): Promise<{ recent: GHAdvisory[]; criticalCount: number; highCount: number }> {
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const ghToken = process.env.GITHUB_TOKEN ?? process.env.GITHUB_APIKEY;
  if (ghToken) headers["Authorization"] = `Bearer ${ghToken}`;

  const res = await fetch(
    "https://api.github.com/advisories?type=reviewed&per_page=25&direction=desc",
    { headers, signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const raw = await res.json() as Array<{
    ghsa_id: string; cve_id: string | null; summary: string; severity: string;
    published_at: string; cvss?: { score: number };
    vulnerabilities?: Array<{ package?: { ecosystem: string; name: string } }>;
  }>;

  const relevant = raw.filter(a => ["critical", "high"].includes(a.severity ?? ""));
  return {
    recent: relevant.slice(0, 10).map(a => ({
      id: a.ghsa_id,
      cveId: a.cve_id,
      summary: (a.summary ?? "").slice(0, 90),
      severity: a.severity,
      publishedAt: a.published_at,
      cvssScore: a.cvss?.score ?? null,
      ecosystem: a.vulnerabilities?.[0]?.package?.ecosystem ?? "—",
      packageName: a.vulnerabilities?.[0]?.package?.name ?? "—",
    })),
    criticalCount: relevant.filter(a => a.severity === "critical").length,
    highCount:     relevant.filter(a => a.severity === "high").length,
  };
}

async function fetchMSRC(): Promise<MSRCRelease> {
  // 1. Get list of update packages
  const listRes = await fetch("https://api.msrc.microsoft.com/cvrf/v2.0/updates", {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!listRes.ok) throw new Error(`MSRC list HTTP ${listRes.status}`);

  const list = await listRes.json() as {
    value: Array<{ ID: string; DocumentTitle: string; CurrentReleaseDate: string; CvrfUrl: string }>;
  };
  const latest = list.value?.[0];
  if (!latest) throw new Error("No MSRC updates");

  // 2. Try to fetch CVRF for CVE counts
  try {
    const cvrf = await fetch(latest.CvrfUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (cvrf.ok) {
      const doc = await cvrf.json() as {
        Vulnerability?: Array<{ Threats?: Array<{ Type: number; Description?: { Value: string } }> }>;
      };
      let critical = 0, important = 0, moderate = 0;
      for (const v of doc.Vulnerability ?? []) {
        for (const t of v.Threats ?? []) {
          if (t.Type === 3) {
            if      (t.Description?.Value === "Critical")  critical++;
            else if (t.Description?.Value === "Important") important++;
            else if (t.Description?.Value === "Moderate")  moderate++;
          }
        }
      }
      return {
        id: latest.ID,
        title: latest.DocumentTitle ?? latest.ID,
        releaseDate: latest.CurrentReleaseDate,
        totalCVEs: critical + important + moderate,
        critical, important, moderate,
      };
    }
  } catch { /* fall through to metadata-only */ }

  return { id: latest.ID, title: latest.DocumentTitle ?? latest.ID, releaseDate: latest.CurrentReleaseDate, totalCVEs: 0, critical: 0, important: 0, moderate: 0 };
}

async function fetchCloudflare(): Promise<CloudflareData> {
  const token = process.env.CLOUDFLARE_RADAR_TOKEN;
  if (!token) throw new Error("CLOUDFLARE_RADAR_TOKEN not set");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [rpkiRes, ddosRes] = await Promise.all([
    fetch("https://api.cloudflare.com/client/v4/radar/bgp/routes/stats?format=json", { headers, signal: AbortSignal.timeout(8000) }),
    fetch("https://api.cloudflare.com/client/v4/radar/attacks/layer3/timeseries?aggInterval=1h&dateRange=24h&name=attacks&format=json", { headers, signal: AbortSignal.timeout(8000) }),
  ]);

  let rpkiValidPct = 0, rpkiInvalidPct = 0;
  if (rpkiRes.ok) {
    const d = await rpkiRes.json() as { result?: { stats?: { rpkiValid?: number; rpkiInvalid?: number; total?: number } } };
    const s = d.result?.stats;
    if (s?.total) { rpkiValidPct = Math.round((s.rpkiValid ?? 0) / s.total * 100); rpkiInvalidPct = Math.round((s.rpkiInvalid ?? 0) / s.total * 100); }
  }

  const ddosTrend: number[] = [];
  if (ddosRes.ok) {
    const d = await ddosRes.json() as { result?: { attacks?: { timestamps: string[]; values: string[] } } };
    const vals = d.result?.attacks?.values ?? [];
    ddosTrend.push(...vals.slice(-12).map(v => parseFloat(v) || 0));
  }

  return { rpkiValidPct, rpkiInvalidPct, ddosTrend };
}

async function fetchSicherheitstacho(): Promise<SicherheitstachoData> {
  const res = await fetch("https://sicherheitstacho.eu/api/1/sensor?type=attack&period=1hour", {
    headers: { "Accept": "application/json", "User-Agent": "CTO-Dashboard/1.0" },
    signal: AbortSignal.timeout(7000),
  });
  if (!res.ok) throw new Error(`ST HTTP ${res.status}`);
  const data = await res.json() as {
    count?: number; total?: number;
    topPort?: number; topProtocol?: string; topCountry?: string;
    attacks?: Array<{ port?: number; protocol?: string; sourceCountry?: string }>;
  };

  // Handle both array and summary response formats
  if (Array.isArray(data)) {
    const arr = data as Array<{ port?: number; protocol?: string; sourceCountry?: string }>;
    const portMap: Record<string, number> = {}, protoMap: Record<string, number> = {}, ctryMap: Record<string, number> = {};
    for (const a of arr) {
      if (a.port)          portMap[a.port]  = (portMap[a.port]  || 0) + 1;
      if (a.protocol)      protoMap[a.protocol] = (protoMap[a.protocol] || 0) + 1;
      if (a.sourceCountry) ctryMap[a.sourceCountry] = (ctryMap[a.sourceCountry] || 0) + 1;
    }
    const topPort    = parseInt(Object.entries(portMap).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? "22");
    const topProto   = Object.entries(protoMap).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? "TCP";
    const topCountry = Object.entries(ctryMap).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? "CN";
    return { attacksLastHour: arr.length, topPort, topProtocol: topProto, topSourceCountry: topCountry };
  }

  return {
    attacksLastHour: data.count ?? data.total ?? 0,
    topPort: data.topPort ?? 22,
    topProtocol: data.topProtocol ?? "TCP",
    topSourceCountry: data.topCountry ?? "—",
  };
}

// ── Handler ────────────────────────────────────────────────────────────────

export async function GET() {
  const errors: string[] = [];
  const [kev, nvd, github, msrc, cloudflare, sicherheitstacho] = await Promise.all([
    fetchCisaKev()       .catch(e => { errors.push(`CISA KEV: ${e.message}`);        return null; }),
    fetchNvd()           .catch(e => { errors.push(`NVD: ${e.message}`);             return null; }),
    fetchGitHub()        .catch(e => { errors.push(`GitHub: ${e.message}`);          return null; }),
    fetchMSRC()          .catch(e => { errors.push(`MSRC: ${e.message}`);            return null; }),
    fetchCloudflare()    .catch(e => { errors.push(`Cloudflare: ${e.message}`);      return null; }),
    fetchSicherheitstacho().catch(e => { errors.push(`Sicherheitstacho: ${e.message}`); return null; }),
  ]);

  const result: KPIsResponse = { cisaKev: kev, nvd, github, msrc, cloudflare, sicherheitstacho, fetchedAt: new Date().toISOString(), errors };
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
