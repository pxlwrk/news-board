"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { FeedCategory, FeedItem, CATEGORY_CONFIG } from "@/lib/feeds";
import { FeedColumn } from "@/components/FeedColumn";
import { StatusBar } from "@/components/StatusBar";
import { ThreatLevel } from "@/components/ThreatLevel";

interface FeedData {
  categories: Record<string, { category: FeedCategory; items: FeedItem[]; lastFetched: string }>;
  lastFetched: string;
  errors: string[];
  usingDemoData?: boolean;
}

const COLUMN_ORDER: FeedCategory[] = [
  "security_critical",
  "security_news",
  "government_it",
  "eu_policy",
  "tech_trends",
  "ai_innovation",
];

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export default function Dashboard() {
  const [data, setData] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFeeds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feeds", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeeds();
    timerRef.current = setInterval(fetchFeeds, REFRESH_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchFeeds]);

  const securityItems: FeedItem[] = [
    ...(data?.categories?.security_critical?.items ?? []),
    ...(data?.categories?.security_news?.items ?? []),
  ];

  const totalItems = COLUMN_ORDER.reduce(
    (sum, cat) => sum + (data?.categories?.[cat]?.items?.length ?? 0),
    0
  );

  return (
    <div className="flex flex-col h-screen bg-[#06060e] overflow-hidden">
      {/* Top Status Bar */}
      <StatusBar
        lastFetched={data?.lastFetched ?? null}
        loading={loading}
        onRefresh={fetchFeeds}
        errorCount={data?.errors?.length ?? 0}
        usingDemoData={data?.usingDemoData}
      />

      {/* Secondary bar: Threat Level + Category Legend */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-slate-800/40 bg-slate-950/40">
        <ThreatLevel securityItems={securityItems} />
        <div className="flex items-center gap-4">
          {COLUMN_ORDER.map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            const count = data?.categories?.[cat]?.items?.length ?? 0;
            return (
              <div key={cat} className="flex items-center gap-1.5">
                <span className="text-xs">{cfg.icon}</span>
                <span className={`text-[11px] font-medium ${cfg.color}`}>{cfg.label}</span>
                {count > 0 && (
                  <span className="text-[10px] text-slate-600">({count})</span>
                )}
              </div>
            );
          })}
        </div>
        {totalItems > 0 && (
          <div className="text-[10px] text-slate-600 whitespace-nowrap">
            {totalItems} Meldungen gesamt
          </div>
        )}
      </div>

      {/* Main Dashboard Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-6 gap-3 p-4">
        {COLUMN_ORDER.map((category) => (
          <FeedColumn
            key={category}
            category={category}
            items={data?.categories?.[category]?.items ?? []}
            loading={loading}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-1.5 border-t border-slate-800/40 bg-slate-950/60 flex items-center justify-between">
        <span className="text-[10px] text-slate-600">
          Quellen: BSI WID · CERT-Bund · CERT-EU · CVEFeed.io · Heise Security · BleepingComputer · Krebs · Golem · Netzpolitik · Bundesregierung · EUR-Lex · Rat der EU · MIT Tech Review · t3n · Wired · The Verge
        </span>
        <span className="text-[10px] text-slate-700">
          Auto-Refresh alle 5 min · Klassifizierung: INTERN
        </span>
      </div>
    </div>
  );
}
