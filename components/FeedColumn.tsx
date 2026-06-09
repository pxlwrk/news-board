"use client";
import { FeedCategory, FeedItem, CATEGORY_CONFIG } from "@/lib/feeds";
import { NewsCard } from "./NewsCard";

interface FeedColumnProps {
  category: FeedCategory;
  items: FeedItem[];
  loading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 animate-pulse">
      <div className="flex justify-between mb-2">
        <div className="h-3 w-20 bg-slate-700 rounded" />
        <div className="h-3 w-12 bg-slate-700 rounded" />
      </div>
      <div className="h-4 w-full bg-slate-700 rounded mb-1" />
      <div className="h-4 w-3/4 bg-slate-700 rounded mb-2" />
      <div className="h-3 w-full bg-slate-800 rounded mb-1" />
      <div className="h-3 w-2/3 bg-slate-800 rounded" />
    </div>
  );
}

export function FeedColumn({ category, items, loading }: FeedColumnProps) {
  const config = CATEGORY_CONFIG[category];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Column Header */}
      <div
        className={`flex items-center gap-2 px-3 py-2.5 mb-3 rounded-lg border ${config.borderColor} ${config.bgColor}`}
      >
        <span className="text-lg leading-none">{config.icon}</span>
        <div>
          <h2 className={`text-sm font-bold ${config.color} leading-tight`}>
            {config.label}
          </h2>
          {items.length > 0 && !loading && (
            <span className="text-[10px] text-slate-500">
              {items.length} Meldungen
            </span>
          )}
        </div>
      </div>

      {/* Feed Items */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scroll">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            <div className="text-2xl mb-2">📭</div>
            <p className="text-xs">Keine Einträge verfügbar</p>
          </div>
        ) : (
          items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  );
}
