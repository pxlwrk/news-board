"use client";
import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FeedCategory, FeedItem, CATEGORY_CONFIG } from "@/lib/feeds";

const CAT_COLORS: Record<string, string> = {
  security_critical: "#ef4444",
  security_news:     "#f97316",
  government_it:     "#3b82f6",
  eu_policy:         "#f59e0b",
  tech_trends:       "#a855f7",
  ai_innovation:     "#10b981",
};

interface Props {
  categories: Record<string, { category: FeedCategory; items: FeedItem[] }>;
}

export function ActivityChart({ categories }: Props) {
  const data = Object.entries(categories).map(([key, cat]) => ({
    label: CATEGORY_CONFIG[key as FeedCategory]?.label ?? key,
    value: cat.items.length,
    color: CAT_COLORS[key] ?? "#64748b",
  }));

  return (
    <div className="flex flex-col h-full rounded-lg border border-slate-800/50 bg-slate-950/40 px-2 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-600 mb-1 shrink-0">Artikel</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 2, right: 2, left: -10, bottom: 0 }}>
            <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={18} isAnimationActive={false}>
              {data.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.7} />)}
            </Bar>
            <Tooltip
              content={() => null}
              cursor={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
