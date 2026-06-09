"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { FeedCategory, FeedItem, CATEGORY_CONFIG } from "@/lib/feeds";
import { FeedColumn } from "@/components/FeedColumn";
import { StatusBar } from "@/components/StatusBar";
import { KPICard } from "@/components/KPICard";
import { ThreatGauge } from "@/components/ThreatGauge";
import { ActivityChart } from "@/components/ActivityChart";

interface KPIs {
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
  kpis: KPIs;
}

const COLUMN_ORDER: FeedCategory[] = [
  "security_critical",
  "security_news",
  "government_it",
  "eu_policy",
  "tech_trends",
  "ai_innovation",
];

const REFRESH_MS = 5 * 60 * 1000;

export default function Dashboard() {
  const [data, setData] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchFeeds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feeds", { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeeds();
    timer.current = setInterval(fetchFeeds, REFRESH_MS);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [fetchFeeds]);

  const secItems: FeedItem[] = [
    ...(data?.categories?.security_critical?.items ?? []),
    ...(data?.categories?.security_news?.items ?? []),
  ];
  const kpis = data?.kpis;
  const critAlerts = kpis?.criticalAdvisories ?? 0;

  return (
    <div className="flex flex-col h-screen bg-[#06060e] overflow-hidden">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <StatusBar
        lastFetched={data?.lastFetched ?? null}
        loading={loading}
        onRefresh={fetchFeeds}
        errorCount={data?.errors?.length ?? 0}
        usingDemoData={data?.usingDemoData}
      />

      {/* ── KPI + Gauge row ──────────────────────────────────────── */}
      <div className="flex gap-3 px-4 pt-3 pb-2 shrink-0">
        {/* Threat Gauge */}
        <ThreatGauge securityItems={secItems} />

        {/* KPI Cards */}
        <div className="grid grid-cols-6 gap-3 flex-1">
          <KPICard
            label="Krit. Warnungen (24h)"
            value={loading ? "—" : critAlerts}
            sublabel="BSI · CERT-Bund · CERT-EU"
            color="red"
            highlight={critAlerts > 0}
          />
          <KPICard
            label="Security News (24h)"
            value={loading ? "—" : kpis?.securityNews24h ?? "—"}
            sublabel="Heise · BleepingComputer · Krebs"
            color="orange"
          />
          <KPICard
            label="EU Regulierung (7d)"
            value={loading ? "—" : kpis?.euRegulatory7d ?? "—"}
            sublabel="EUR-Lex · Rat der EU · EP"
            color="amber"
          />
          <KPICard
            label="Verwaltungs-IT (7d)"
            value={loading ? "—" : kpis?.govIt7d ?? "—"}
            sublabel="Bundesregierung · Netzpolitik"
            color="blue"
          />
          <KPICard
            label="Meldungen gesamt"
            value={loading ? "—" : kpis?.totalItems ?? "—"}
            sublabel="Gefiltert · Enterprise-relevant"
            color="slate"
          />
          {/* Activity Chart in last KPI slot */}
          <ActivityChart categories={data?.categories ?? {}} />
        </div>
      </div>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <div className="mx-4 border-t border-slate-800/60 shrink-0" />

      {/* ── Feed Columns ─────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 grid grid-cols-6 gap-3 p-4 pt-3">
        {COLUMN_ORDER.map((category) => (
          <FeedColumn
            key={category}
            category={category}
            items={data?.categories?.[category]?.items ?? []}
            loading={loading}
          />
        ))}
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="px-4 py-1.5 border-t border-slate-800/40 bg-slate-950/60 flex items-center justify-between shrink-0">
        <span className="text-[10px] text-slate-700">
          {loading ? "Feeds werden geladen…" : data?.usingDemoData
            ? "Demo-Modus · Live-Feeds nach Deployment verfügbar"
            : `${kpis?.sourcesOk ?? 0}/${kpis?.sourcesTotal ?? 0} Quellen aktiv · BSI WID · CERT-Bund · CERT-EU · CVEFeed · Heise · BleepingComputer · Krebs · Golem · Netzpolitik · Bundesregierung · EUR-Lex · Rat der EU · MIT TR · t3n`
          }
        </span>
        <div className="flex items-center gap-3">
          {!data?.usingDemoData && (
            <div className="flex items-center gap-1.5">
              {COLUMN_ORDER.map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                const count = data?.categories?.[cat]?.items?.length ?? 0;
                return (
                  <span key={cat} className={`text-[10px] ${cfg.color}`}>
                    {cfg.icon} {count}
                  </span>
                );
              })}
            </div>
          )}
          <span className="text-[10px] text-slate-700">Auto-Refresh 5 min · INTERN</span>
        </div>
      </div>
    </div>
  );
}
