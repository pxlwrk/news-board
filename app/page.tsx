"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { FeedCategory, FeedItem, CATEGORY_CONFIG } from "@/lib/feeds";
import { SocialPost } from "@/lib/social";
import { FeedColumn } from "@/components/FeedColumn";
import { SocialColumn } from "@/components/SocialColumn";
import { StatusBar } from "@/components/StatusBar";
import { KPICard } from "@/components/KPICard";
import { ThreatGauge } from "@/components/ThreatGauge";
import { ActivityChart } from "@/components/ActivityChart";
import { GermanyMap } from "@/components/GermanyMap";
import { WorldAttackMap } from "@/components/WorldAttackMap";
import { ThreatRadarChart } from "@/components/ThreatRadarChart";
import { NetworkTopologyWidget } from "@/components/NetworkTopologyWidget";
import { AttackVectorChart } from "@/components/AttackVectorChart";
import { SectorTargetChart } from "@/components/SectorTargetChart";
import { CVESeverityDonut } from "@/components/CVESeverityDonut";
import { KEVTimeline } from "@/components/KEVTimeline";
import { RotatingPanel } from "@/components/RotatingPanel";
import { GitHubAdvisoryWidget } from "@/components/GitHubAdvisoryWidget";
import { MSRCWidget } from "@/components/MSRCWidget";
import { CloudflareWidget } from "@/components/CloudflareWidget";
import { HoneypotWidget } from "@/components/HoneypotWidget";
import type { GHAdvisory, MSRCRelease, CloudflareData, SicherheitstachoData } from "@/lib/kpi-types";

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
  fetchedAt: string;
  errors: string[];
}

interface SocialData {
  posts: SocialPost[];
  usingDemoData?: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────

const NEWS_COLUMNS: FeedCategory[] = [
  "security_critical", "security_news", "government_it",
  "eu_policy", "tech_trends", "ai_innovation",
];

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

  const kev  = extKpis?.cisaKev;
  const nvd  = extKpis?.nvd;
  const fkpi = feedData?.kpis;
  const anyLoading = feedLoading || kpiLoading || socialLoading;

  // Center-top: Attack vectors → World attack map → GitHub advisories
  const centerPanels = [
    <AttackVectorChart key="av" feedItems={allFeedItems} />,
    <WorldAttackMap
      key="world"
      topCountry={extKpis?.sicherheitstacho?.topSourceCountry ?? undefined}
      attacksPerHour={extKpis?.sicherheitstacho?.attacksLastHour}
      loading={kpiLoading}
    />,
    <GitHubAdvisoryWidget
      key="gh"
      advisories={extKpis?.github?.recent ?? []}
      criticalCount={extKpis?.github?.criticalCount ?? 0}
      highCount={extKpis?.github?.highCount ?? 0}
      loading={kpiLoading}
    />,
  ];

  // Center-bottom: CVE donut → Threat radar
  const centerBottomPanels = [
    <CVESeverityDonut key="cve" critical={nvd?.criticalToday ?? 0} high={nvd?.highToday ?? 0} loading={kpiLoading} />,
    <ThreatRadarChart key="radar" feedItems={allFeedItems} />,
  ];

  // Right-top: KRITIS sectors → MSRC Patch Tuesday
  const rightPanels = [
    <SectorTargetChart key="st" feedItems={allFeedItems} />,
    <MSRCWidget key="msrc" data={extKpis?.msrc ?? null} loading={kpiLoading} />,
  ];

  // Right-bottom: KEV timeline → Honeypot → Cloudflare → Network topology
  const bottomRightPanels = [
    <KEVTimeline key="kev" total={kev?.total ?? 0} newThisWeek={kev?.newThisWeek ?? 0} loading={kpiLoading} />,
    <NetworkTopologyWidget key="nettopo" feedItems={allFeedItems} />,
    <HoneypotWidget key="hp" data={extKpis?.sicherheitstacho ?? null} loading={kpiLoading} />,
    <CloudflareWidget key="cf" data={extKpis?.cloudflare ?? null} loading={kpiLoading} />,
  ];

  return (
    <div
      className="bg-[#06060e] overflow-hidden"
      style={{ display: "grid", height: "100vh", gridTemplateRows: "auto auto 300px 1px 1fr auto" }}
    >

      {/* ── Status bar ─────────────────────────────────────────────── */}
      <StatusBar
        lastFetched={feedData?.lastFetched ?? null}
        loading={anyLoading}
        onRefresh={refreshAll}
        errorCount={(feedData?.errors?.length ?? 0) + (extKpis?.errors?.length ?? 0)}
        usingDemoData={feedData?.usingDemoData}
      />

      {/* ── KPI row ────────────────────────────────────────────────── */}
      <div className="flex gap-3 px-4 pt-2 pb-2">
        <ThreatGauge securityItems={secItems} />
        <div className="grid grid-cols-6 gap-3 flex-1">
          <KPICard
            label="KEV aktiv ausgenutzt"
            value={kpiLoading ? "—" : kev ? kev.total.toLocaleString("de") : "n/v"}
            sublabel={kev ? `+${kev.newThisWeek} diese Woche` : "CISA KEV"}
            color="red"
            highlight={(kev?.newToday ?? 0) > 0}
          />
          <KPICard
            label="NVD Critical (heute)"
            value={kpiLoading ? "—" : nvd ? nvd.criticalToday : "n/v"}
            sublabel={nvd ? `+${nvd.highToday} HIGH` : "NIST NVD"}
            color="orange"
            highlight={(nvd?.criticalToday ?? 0) > 5}
          />
          <KPICard
            label="Krit. Warnungen (24h)"
            value={feedLoading ? "—" : fkpi?.criticalAdvisories ?? "—"}
            sublabel="BSI · CERT-Bund · CERT-EU"
            color="red"
            highlight={(fkpi?.criticalAdvisories ?? 0) > 0}
          />
          <KPICard
            label="EU Regulierung (7d)"
            value={feedLoading ? "—" : fkpi?.euRegulatory7d ?? "—"}
            sublabel="EUR-Lex · Rat EU · EP"
            color="amber"
          />
          <KPICard
            label="Meldungen gesamt"
            value={feedLoading ? "—" : fkpi?.totalItems ?? "—"}
            sublabel={feedData?.usingDemoData ? "Demo-Modus" : `${fkpi?.sourcesOk ?? 0}/${fkpi?.sourcesTotal ?? 0} Quellen`}
            color="slate"
          />
          <ActivityChart categories={feedData?.categories ?? {}} />
        </div>
      </div>

      {/* ── Visual analysis section (300px grid row) ───────────────── */}
      <div className="grid grid-cols-[290px_1fr_1fr] gap-3 px-4 pb-2 overflow-hidden">

        {/* Germany SVG map */}
        <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 px-3 py-2.5 overflow-hidden min-h-0">
          <GermanyMap feedItems={allFeedItems} />
        </div>

        {/* Center: Attack vectors → World attack map → GitHub Advisory | CVE donut → Threat radar */}
        <div className="grid grid-rows-2 gap-2 min-h-0">
          <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 px-3 py-2 overflow-hidden min-h-0">
            <RotatingPanel panels={centerPanels} intervalMs={13000} />
          </div>
          <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 px-3 py-2 overflow-hidden min-h-0">
            <RotatingPanel panels={centerBottomPanels} intervalMs={15000} />
          </div>
        </div>

        {/* Right: KRITIS sectors → MSRC | KEV → Network topology → Honeypot → Cloudflare */}
        <div className="grid grid-rows-2 gap-2 min-h-0">
          <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 px-3 py-2 overflow-hidden min-h-0">
            <RotatingPanel panels={rightPanels} intervalMs={17000} />
          </div>
          <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 px-3 py-2 overflow-hidden min-h-0">
            <RotatingPanel panels={bottomRightPanels} intervalMs={11000} />
          </div>
        </div>
      </div>

      {/* ── Divider ────────────────────────────────────────────────── */}
      <div className="mx-4 border-t border-slate-800/60" />

      {/* ── Feed columns (7: 6 news + social) ──────────────────────── */}
      <div className="grid grid-cols-7 gap-3 p-4 pt-2 overflow-hidden min-h-0">
        {NEWS_COLUMNS.map((category) => (
          <FeedColumn
            key={category}
            category={category}
            items={feedData?.categories?.[category]?.items ?? []}
            loading={feedLoading}
          />
        ))}
        <SocialColumn
          posts={socialData?.posts ?? []}
          loading={socialLoading}
          usingDemoData={socialData?.usingDemoData}
        />
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div className="px-4 py-1 border-t border-slate-800/40 bg-slate-950/60 flex items-center justify-between">
        <span className="text-[10px] text-slate-700">
          News: BSI WID · CERT-Bund · CERT-EU · CVEFeed · Heise · BleepingComputer · Krebs · Golem · Netzpolitik · Bundesregierung · EUR-Lex · Rat der EU · MIT TR · t3n &nbsp;|&nbsp;
          KPIs: CISA KEV · NIST NVD · GitHub Advisory · MSRC · Cloudflare Radar · DT Sicherheitstacho &nbsp;|&nbsp;
          Social: Mastodon infosec.exchange · social.bund.de · Bluesky
        </span>
        <span className="text-[10px] text-slate-700">
          News 5min · KPIs 15min · Social 3min · Panels rotieren 12-16s · INTERN
        </span>
      </div>
    </div>
  );
}
