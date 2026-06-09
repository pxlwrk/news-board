"use client";
import { FeedCategory, FeedItem, CATEGORY_CONFIG } from "@/lib/feeds";

interface ActivityChartProps {
  categories: Record<string, { items: FeedItem[] }>;
}

const ORDER: FeedCategory[] = [
  "security_critical", "security_news", "government_it",
  "eu_policy", "tech_trends", "ai_innovation",
];

export function ActivityChart({ categories }: ActivityChartProps) {
  const counts = ORDER.map((cat) => ({
    cat,
    cfg: CATEGORY_CONFIG[cat],
    count: categories[cat]?.items?.length ?? 0,
  }));
  const max = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className="flex flex-col justify-between px-4 py-3 rounded-lg border border-slate-700/50 bg-slate-900/40 h-full">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
        Meldungen je Kategorie
      </div>
      <div className="flex items-end gap-1.5 h-10 flex-1">
        {counts.map(({ cat, cfg, count }) => (
          <div key={cat} className="flex flex-col items-center gap-0.5 flex-1">
            <span className="text-[9px] tabular-nums text-slate-500">{count}</span>
            <div
              className="w-full rounded-sm transition-all duration-500"
              style={{
                height: `${Math.max((count / max) * 36, count > 0 ? 4 : 0)}px`,
                backgroundColor: cfg.color.replace("text-", "").includes("red")
                  ? "#ef4444" : cfg.color.replace("text-", "").includes("orange")
                  ? "#f97316" : cfg.color.replace("text-", "").includes("blue")
                  ? "#60a5fa" : cfg.color.replace("text-", "").includes("amber")
                  ? "#fbbf24" : cfg.color.replace("text-", "").includes("purple")
                  ? "#a78bfa" : "#34d399",
                opacity: 0.75,
              }}
            />
            <span className="text-[10px]">{cfg.icon}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
