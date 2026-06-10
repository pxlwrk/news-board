"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FeedCategory, FeedItem, CATEGORY_CONFIG, FEED_SOURCES } from "@/lib/feeds";
import { SocialPost } from "@/lib/social";
import { FeedColumn } from "@/components/FeedColumn";
import { SocialColumn } from "@/components/SocialColumn";
import { StatusBar } from "@/components/StatusBar";
import { KPICard } from "@/components/KPICard";
import { ThreatGauge } from "@/components/ThreatGauge";
import { GermanyMap } from "@/components/GermanyMap";
import { WorldAttackMap } from "@/components/WorldAttackMap";
import { ThreatRadarChart } from "@/components/ThreatRadarChart";
import { AttackVectorChart } from "@/components/AttackVectorChart";
import { SectorTargetChart } from "@/components/SectorTargetChart";
import { CVESeverityDonut } from "@/components/CVESeverityDonut";
import { KEVTimeline } from "@/components/KEVTimeline";
import { RotatingPanel } from "@/components/RotatingPanel";
import { GitHubAdvisoryWidget } from "@/components/GitHubAdvisoryWidget";
import { MSRCWidget } from "@/components/MSRCWidget";
import { CloudflareWidget } from "@/components/CloudflareWidget";
import { HoneypotWidget } from "@/components/HoneypotWidget";
import { ISCSansWidget } from "@/components/ISCSansWidget";
import { ThreatFoxWidget } from "@/components/ThreatFoxWidget";
import type { GHAdvisory, MSRCRelease, CloudflareData, SicherheitstachoData, ISCSansData, ThreatFoxData } from "@/lib/kpi-types";

// ── Types ──────────────────────────────────────────────────────────────────

interface FeedKPIs {
  criticalAdvisories: number;
  securityNews24h: number;
  euRegulatory7d: number;
  govIt7d: number;
  totalItems: number;
  sourcesOk: number;
  sourcesTotal: number;
}

interface FeedData {
  categories: Record<string, { category: FeedCategory; items: FeedItem[] }>;
  lastFetched: string;
  errors: string[];
  usingDemoData?: boolean;
  kpis: FeedKPIs;
}

interface ExternalKPIs {
  cisaKev: { total: number; newThisWeek: number; newToday: number; lastAdded: string } | null;
  nvd: { criticalToday: number; highToday: number } | null;
  github: { recent: GHAdvisory[]; criticalCount: number; highCount: number } | null;
  msrc: MSRCRelease | null;
  cloudflare: CloudflareData | null;
  sicherheitstacho: SicherheitstachoData | null;
  iscSans: ISCSansData | null;
  threatfox: ThreatFoxData | null;
  fetchedAt: string;
  errors: string[];
}

interface SocialData {
  posts: SocialPost[];
  usingDemoData?: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────

const FEED_REFRESH_MS   = 5  * 60 * 1000;
const KPI_REFRESH_MS    = 15 * 60 * 1000;
const SOCIAL_REFRESH_MS = 3  * 60 * 1000;

// ── Component ──────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [feedData,   setFeedData]   = useState<FeedData | null>(null);
  const [extKpis,    setExtKpis]    = useState<ExternalKPIs | null>(null);
  const [socialData, setSocialData] = useState<SocialData | null>(null);

  const [feedLoading,   setFeedLoading]   = useState(true);
  const [kpiLoading,    setKpiLoading]    = useState(true);
  const [socialLoading, setSocialLoading] = useState(true);

  const feedTimer   = useRef<ReturnType<typeof setInterval> | null>(null);
  const kpiTimer    = useRef<ReturnType<typeof setInterval> | null>(null);
  const socialTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchFeeds = useCallback(async () => {
    setFeedLoading(true);
    try { const r = await fetch("/api/feeds", { cache: "no-store" }); if (r.ok) setFeedData(await r.json()); }
    finally { setFeedLoading(false); }
  }, []);

  const fetchKpis = useCallback(async () => {
    setKpiLoading(true);
    try { const r = await fetch("/api/kpis", { cache: "no-store" }); if (r.ok) setExtKpis(await r.json()); }
    finally { setKpiLoading(false); }
  }, []);

  const fetchSocial = useCallback(async () => {
    setSocialLoading(true);
    try { const r = await fetch("/api/social", { cache: "no-store" }); if (r.ok) setSocialData(await r.json()); }
    finally { setSocialLoading(false); }
  }, []);

  const refreshAll = useCallback(() => {
    fetchFeeds(); fetchKpis(); fetchSocial();
  }, [fetchFeeds, fetchKpis, fetchSocial]);

  useEffect(() => {
    refreshAll();
    feedTimer.current   = setInterval(fetchFeeds,  FEED_REFRESH_MS);
    kpiTimer.current    = setInterval(fetchKpis,   KPI_REFRESH_MS);
    socialTimer.current = setInterval(fetchSocial, SOCIAL_REFRESH_MS);
    return () => [feedTimer, kpiTimer, socialTimer].forEach((t) => { if (t.current) clearInterval(t.current); });
  }, [refreshAll, fetchFeeds, fetchKpis, fetchSocial]);

  // Derive all feed items for visual analysis
  const allFeedItems: FeedItem[] = Object.values(feedData?.categories ?? {}).flatMap((c) => c.items);
  const secItems: FeedItem[] = [
    ...(feedData?.categories?.security_critical?.items ?? []),
    ...(feedData?.categories?.security_news?.items ?? []),
  ];

  const failedByCategory = useMemo<Record<string, string[]>>(() => {
    const failed = new Set(feedData?.errors ?? []);
    const map: Record<string, string[]> = {};
    for (const src of FEED_SOURCES) {
      if (failed.has(src.name)) {
        (map[src.category] ??= []).push(src.name);
      }
    }
    return map;
  }, [feedData?.errors]);

  const kev  = extKpis?.cisaKev;
  const nvd  = extKpis?.nvd;
  const fkpi = feedData?.kpis;
  const anyLoading = feedLoading || kpiLoading || socialLoading;

  // Left charts column 1: Attack vectors ↔ Sector targets
  const chartCol1 = [
    <AttackVectorChart key="av" feedItems={allFeedItems} />,
    <SectorTargetChart key="st" feedItems={allFeedItems} />,
  ];

  // Left charts column 2: Threat radar ↔ CVE donut
  const chartCol2 = [
    <ThreatRadarChart key="radar" feedItems={allFeedItems} />,
    <CVESeverityDonut key="cve" critical={nvd?.criticalToday ?? 0} high={nvd?.highToday ?? 0} loading={kpiLoading} />,
  ];

  // Left charts column 3: MSRC, KEV, Honeypot, Cloudflare, ISC/SANS, ThreatFox, GitHub advisories
  const chartCol3 = [
    <MSRCWidget key="msrc" data={extKpis?.msrc ?? null} loading={kpiLoading} />,
    <ISCSansWidget key="isc" data={extKpis?.iscSans ?? null} loading={kpiLoading} />,
    <ThreatFoxWidget key="tf" data={extKpis?.threatfox ?? null} loading={kpiLoading} />,
    <KEVTimeline key="kev" total={kev?.total ?? 0} newThisWeek={kev?.newThisWeek ?? 0} loading={kpiLoading} />,
    <HoneypotWidget key="hp" data={extKpis?.sicherheitstacho ?? null} loading={kpiLoading} />,
    <CloudflareWidget key="cf" data={extKpis?.cloudflare ?? null} loading={kpiLoading} />,
    <GitHubAdvisoryWidget key="gh" advisories={extKpis?.github?.recent ?? []} criticalCount={extKpis?.github?.criticalCount ?? 0} highCount={extKpis?.github?.highCount ?? 0} loading={kpiLoading} />,
  ];

  // Right: feed groups (3 columns each, rotating every 35s)
  const feedGroups = [
    <div key="fg1" className="grid grid-cols-3 gap-2 h-full">
      <FeedColumn category="security_critical" items={feedData?.categories?.security_critical?.items ?? []} loading={feedLoading} failedSources={failedByCategory["security_critical"]} />
      <FeedColumn category="security_news"     items={feedData?.categories?.security_news?.items ?? []}     loading={feedLoading} failedSources={failedByCategory["security_news"]} />
      <FeedColumn category="government_it"     items={feedData?.categories?.government_it?.items ?? []}     loading={feedLoading} failedSources={failedByCategory["government_it"]} />
    </div>,
    <div key="fg2" className="grid grid-cols-3 gap-2 h-full">
      <FeedColumn category="eu_policy"     items={feedData?.categories?.eu_policy?.items ?? []}     loading={feedLoading} failedSources={failedByCategory["eu_policy"]} />
      <FeedColumn category="tech_trends"   items={feedData?.categories?.tech_trends?.items ?? []}   loading={feedLoading} failedSources={failedByCategory["tech_trends"]} />
      <FeedColumn category="ai_innovation" items={feedData?.categories?.ai_innovation?.items ?? []} loading={feedLoading} failedSources={failedByCategory["ai_innovation"]} />
    </div>,
    <div key="fg3" className="grid grid-cols-3 gap-2 h-full">
      <FeedColumn category="security_critical" items={feedData?.categories?.security_critical?.items ?? []} loading={feedLoading} failedSources={failedByCategory["security_critical"]} />
      <SocialColumn posts={socialData?.posts ?? []} loading={socialLoading} usingDemoData={socialData?.usingDemoData} />
      <FeedColumn category="eu_policy" items={feedData?.categories?.eu_policy?.items ?? []} loading={feedLoading} failedSources={failedByCategory["eu_policy"]} />
    </div>,
  ];

  return (
    <div
      className="bg-[#06060e] overflow-hidden"
      style={{ display: "grid", height: "100vh", gridTemplateRows: "auto auto 1fr auto" }}
    >

      {/* ── Status bar ─────────────────────────────────────────────── */}
      <StatusBar
        lastFetched={feedData?.lastFetched ?? null}
        loading={anyLoading}
        onRefresh={refreshAll}
        errorCount={(feedData?.errors?.length ?? 0) + (extKpis?.errors?.length ?? 0)}
        usingDemoData={feedData?.usingDemoData}
      />

      {/* ── KPI row (compact) ──────────────────────────────────────── */}
      <div className="flex gap-2 px-4 pt-1.5 pb-1.5">
        <ThreatGauge securityItems={secItems} compact />
        <div className="grid grid-cols-4 gap-2 flex-1">
          <KPICard compact
            label="KEV ausgenutzt"
            value={kpiLoading ? "—" : kev ? kev.total.toLocaleString("de") : "n/v"}
            sublabel={kev ? `+${kev.newThisWeek} diese Woche` : "CISA KEV"}
            color="red"
            highlight={(kev?.newToday ?? 0) > 0}
          />
          <KPICard compact
            label="NVD Critical heute"
            value={kpiLoading ? "—" : nvd ? nvd.criticalToday : "n/v"}
            sublabel={nvd ? `+${nvd.highToday} HIGH` : "NIST NVD"}
            color="orange"
            highlight={(nvd?.criticalToday ?? 0) > 5}
          />
          <KPICard compact
            label="Krit. Warnungen 24h"
            value={feedLoading ? "—" : fkpi?.criticalAdvisories ?? "—"}
            sublabel="BSI · CERT-Bund · CERT-EU"
            color="red"
            highlight={(fkpi?.criticalAdvisories ?? 0) > 0}
          />
          <KPICard compact
            label="ISC Infocon"
            value={kpiLoading ? "—" : (() => {
              const l = extKpis?.iscSans?.infocon;
              return l === "green" ? "NORMAL" : l === "yellow" ? "ERHÖHT" : l === "orange" ? "HOCH" : l === "red" ? "KRITISCH" : "n/v";
            })()}
            sublabel="SANS Internet Storm Center"
            color={(() => {
              const l = extKpis?.iscSans?.infocon;
              return l === "red" ? "red" : l === "orange" ? "orange" : l === "yellow" ? "amber" : "emerald";
            })()}
            highlight={["orange", "red"].includes(extKpis?.iscSans?.infocon ?? "")}
          />
        </div>
      </div>

      {/* ── Main content: left visuals | right feeds ───────────────── */}
      <div className="grid grid-cols-[3fr_2fr] gap-3 px-4 pb-2 overflow-hidden min-h-0">

        {/* ── Left: maps + chart panels ──────────────────────────── */}
        <div className="flex flex-col gap-2 overflow-hidden">

          {/* Maps row */}
          <div className="flex gap-2 shrink-0" style={{ height: "260px" }}>
            <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 overflow-hidden" style={{ width: "260px" }}>
              <GermanyMap feedItems={allFeedItems} />
            </div>
            <div className="flex-1 rounded-lg border border-slate-800/50 bg-slate-950/40 px-3 py-2 overflow-hidden">
              <WorldAttackMap
                topCountry={extKpis?.sicherheitstacho?.topSourceCountry ?? undefined}
                attacksPerHour={extKpis?.sicherheitstacho?.attacksLastHour}
                loading={kpiLoading}
              />
            </div>
          </div>

          {/* Chart panels (3 columns, fixed height) */}
          <div className="grid grid-cols-3 gap-2 shrink-0" style={{ height: "260px" }}>
            <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 px-3 py-2 overflow-hidden">
              <RotatingPanel panels={chartCol1} intervalMs={20000} />
            </div>
            <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 px-3 py-2 overflow-hidden">
              <RotatingPanel panels={chartCol2} intervalMs={18000} />
            </div>
            <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 px-3 py-2 overflow-hidden">
              <RotatingPanel panels={chartCol3} intervalMs={13000} />
            </div>
          </div>
        </div>

        {/* ── Right: rotating feed groups ────────────────────────── */}
        <div className="overflow-hidden min-h-0">
          <RotatingPanel panels={feedGroups} intervalMs={35000} />
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div className="px-4 py-1 border-t border-slate-800/40 bg-slate-950/60 flex items-center justify-between">
        <span className="text-[9px] text-slate-700">
          BSI WID · CERT-Bund · CERT-EU · CVEFeed · Heise · BleepingComputer · Krebs · Golem · Netzpolitik · Bundesregierung · EUR-Lex · MIT TR · t3n &nbsp;|&nbsp;
          CISA KEV · NIST NVD · GitHub Advisory · MSRC · Cloudflare Radar · DT Sicherheitstacho &nbsp;|&nbsp;
          Mastodon infosec.exchange · social.bund.de · Bluesky
        </span>
        <span className="text-[9px] text-slate-700 shrink-0 ml-4">Feeds 35s · Charts 13-20s · INTERN</span>
      </div>
    </div>
  );
}
