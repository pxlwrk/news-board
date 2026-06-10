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
import { GermanyTileMap } from "@/components/GermanyTileMap";
import { AttackVectorChart } from "@/components/AttackVectorChart";
import { SectorTargetChart } from "@/components/SectorTargetChart";
import { CVESeverityDonut } from "@/components/CVESeverityDonut";
import { KEVTimeline } from "@/components/KEVTimeline";

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

  return (
    <div className="flex flex-col h-screen bg-[#06060e] overflow-hidden">

      {/* ── Status bar ─────────────────────────────────────────────── */}
      <StatusBar
        lastFetched={feedData?.lastFetched ?? null}
        loading={anyLoading}
        onRefresh={refreshAll}
        errorCount={(feedData?.errors?.length ?? 0) + (extKpis?.errors?.length ?? 0)}
        usingDemoData={feedData?.usingDemoData}
      />

      {/* ── KPI row ────────────────────────────────────────────────── */}
      <div className="flex gap-3 px-4 pt-2 pb-2 shrink-0">
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

      {/* ── Visual analysis section ─────────────────────────────────── */}
      <div className="grid grid-cols-[auto_1fr_1fr] gap-3 px-4 pb-2 shrink-0" style={{ height: "230px" }}>

        {/* Germany Tile Map */}
        <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 px-3 py-2.5 overflow-hidden" style={{ width: "340px" }}>
          <GermanyTileMap feedItems={allFeedItems} />
        </div>

        {/* Center: Attack vectors + CVE donut */}
        <div className="grid grid-rows-2 gap-2">
          <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 px-3 py-2 overflow-hidden">
            <AttackVectorChart feedItems={allFeedItems} />
          </div>
          <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 px-3 py-2 overflow-hidden">
            <CVESeverityDonut
              critical={nvd?.criticalToday ?? 0}
              high={nvd?.highToday ?? 0}
              loading={kpiLoading}
            />
          </div>
        </div>

        {/* Right: KRITIS sectors + KEV timeline */}
        <div className="grid grid-rows-2 gap-2">
          <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 px-3 py-2 overflow-hidden">
            <SectorTargetChart feedItems={allFeedItems} />
          </div>
          <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 px-3 py-2 overflow-hidden">
            <KEVTimeline
              total={kev?.total ?? 0}
              newThisWeek={kev?.newThisWeek ?? 0}
              loading={kpiLoading}
            />
          </div>
        </div>
      </div>

      {/* ── Divider ────────────────────────────────────────────────── */}
      <div className="mx-4 border-t border-slate-800/60 shrink-0" />

      {/* ── Feed columns (7: 6 news + social) ──────────────────────── */}
      <div className="flex-1 min-h-0 grid grid-cols-7 gap-3 p-4 pt-2">
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
      <div className="px-4 py-1 border-t border-slate-800/40 bg-slate-950/60 flex items-center justify-between shrink-0">
        <span className="text-[10px] text-slate-700">
          News: BSI WID · CERT-Bund · CERT-EU · CVEFeed · Heise · BleepingComputer · Krebs · Golem · Netzpolitik · Bundesregierung · EUR-Lex · Rat der EU · MIT TR · t3n &nbsp;|&nbsp;
          KPIs: CISA KEV · NIST NVD &nbsp;|&nbsp;
          Social: Mastodon infosec.exchange · social.bund.de · Bluesky
        </span>
        <span className="text-[10px] text-slate-700">
          News 5min · KPIs 15min · Social 3min · Karte: KRITIS-Dichte + Medienanalyse · INTERN
        </span>
      </div>
    </div>
  );
}
