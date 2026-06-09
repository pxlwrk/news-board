import { NextResponse } from "next/server";

interface ExternalKPIs {
  cisaKev: {
    total: number;
    newThisWeek: number;
    newToday: number;
    lastAdded: string;
  } | null;
  nvd: {
    criticalToday: number;
    highToday: number;
  } | null;
  urlhaus: {
    urlsOnline: number;
    urlsAdded24h: number;
  } | null;
  fetchedAt: string;
  errors: string[];
}

async function fetchCisaKev() {
  const res = await fetch(
    "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
    { signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) throw new Error(`CISA KEV HTTP ${res.status}`);
  const data = await res.json() as {
    count: number;
    vulnerabilities: { dateAdded: string; cveID: string; vendorProject: string }[];
  };

  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  const day = 24 * 60 * 60 * 1000;

  const newThisWeek = data.vulnerabilities.filter(
    (v) => now - new Date(v.dateAdded).getTime() < week
  ).length;
  const newToday = data.vulnerabilities.filter(
    (v) => now - new Date(v.dateAdded).getTime() < day
  ).length;

  // Most recently added entry
  const sorted = [...data.vulnerabilities].sort(
    (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
  );

  return {
    total: data.count,
    newThisWeek,
    newToday,
    lastAdded: sorted[0]
      ? `${sorted[0].cveID} (${sorted[0].vendorProject})`
      : "—",
  };
}

async function fetchNvd() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = today.toISOString().replace(".000Z", ".000");

  // Two parallel requests: critical + high
  const [critRes, highRes] = await Promise.all([
    fetch(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${startDate}&cvssV3Severity=CRITICAL&resultsPerPage=1`,
      { signal: AbortSignal.timeout(9000) }
    ),
    fetch(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${startDate}&cvssV3Severity=HIGH&resultsPerPage=1`,
      { signal: AbortSignal.timeout(9000) }
    ),
  ]);

  const critData = critRes.ok ? await critRes.json() as { totalResults: number } : null;
  const highData = highRes.ok ? await highRes.json() as { totalResults: number } : null;

  return {
    criticalToday: critData?.totalResults ?? 0,
    highToday: highData?.totalResults ?? 0,
  };
}

async function fetchUrlhaus() {
  const res = await fetch("https://urlhaus-api.abuse.ch/v1/stats/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    signal: AbortSignal.timeout(7000),
  });
  if (!res.ok) throw new Error(`URLhaus HTTP ${res.status}`);
  const data = await res.json() as {
    query_status: string;
    urls_online: number;
    urls_added_last_24h?: number;
  };
  return {
    urlsOnline: data.urls_online ?? 0,
    urlsAdded24h: data.urls_added_last_24h ?? 0,
  };
}

export async function GET() {
  const errors: string[] = [];

  const [kev, nvd, urlhaus] = await Promise.all([
    fetchCisaKev().catch((e) => { errors.push(`CISA KEV: ${e.message}`); return null; }),
    fetchNvd().catch((e) => { errors.push(`NVD: ${e.message}`); return null; }),
    fetchUrlhaus().catch((e) => { errors.push(`URLhaus: ${e.message}`); return null; }),
  ]);

  const result: ExternalKPIs = {
    cisaKev: kev,
    nvd,
    urlhaus,
    fetchedAt: new Date().toISOString(),
    errors,
  };

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
