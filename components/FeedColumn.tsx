"use client";
import { useEffect, useRef, useState } from "react";
import { FeedCategory, FeedItem, CATEGORY_CONFIG } from "@/lib/feeds";
import { NewsCard } from "./NewsCard";

interface FeedColumnProps {
  category: FeedCategory;
  items: FeedItem[];
  loading?: boolean;
  failedSources?: string[];
}

function SkeletonRow({ idx }: { idx: number }) {
  return (
    <div className={`flex items-center gap-2 px-2.5 py-2 animate-pulse ${idx % 2 === 0 ? "bg-slate-900/20" : ""}`}>
      <div className="w-4 h-2 bg-slate-800 rounded shrink-0" />
      <div className="flex-1 space-y-1">
        <div className="h-1.5 w-16 bg-slate-800 rounded" />
        <div className="h-2 w-full bg-slate-800 rounded" />
        <div className="h-2 w-3/4 bg-slate-800 rounded" />
      </div>
      <div className="w-5 h-2 bg-slate-800 rounded shrink-0" />
    </div>
  );
}

export function FeedColumn({ category, items, loading, failedSources }: FeedColumnProps) {
  const config = CATEGORY_CONFIG[category];
  const innerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState("0px");

  // Compute how far we need to scroll so the animation knows the distance
  useEffect(() => {
    if (!innerRef.current || !outerRef.current) return;
    const inner = innerRef.current.scrollHeight;
    const outer = outerRef.current.clientHeight;
    if (inner > outer) {
      setScrollOffset(`-${inner - outer}px`);
    } else {
      setScrollOffset("0px");
    }
  }, [items]);

  return (
    <div className="flex flex-col h-full min-h-0 rounded-lg border border-slate-800/50 bg-slate-950/30 overflow-hidden">
      {/* Column Header */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${config.borderColor} ${config.bgColor} shrink-0`}>
        <div className="flex items-center gap-1.5">
          <span className="text-sm leading-none">{config.icon}</span>
          <h2 className={`text-[11px] font-bold uppercase tracking-wider ${config.color}`}>
            {config.label}
          </h2>
        </div>
        {!loading && items.length > 0 && (
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${config.bgColor} ${config.color}`}>
            {items.length}
          </span>
        )}
      </div>

      {/* Failed-source warning strip */}
      {failedSources && failedSources.length > 0 && (
        <div className="px-3 py-0.5 bg-amber-950/40 border-b border-amber-900/30 flex items-center gap-1 shrink-0">
          <span className="text-[9px] text-amber-500 shrink-0">⚠</span>
          <span className="text-[8px] text-amber-600 truncate">{failedSources.join(", ")}</span>
        </div>
      )}

      {/* Feed Items — auto-scrolling container */}
      <div ref={outerRef} className="flex-1 overflow-hidden relative">
        {loading ? (
          <div>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} idx={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-700 py-8">
            <span className="text-2xl mb-2">📭</span>
            <span className="text-[10px]">Keine Einträge</span>
          </div>
        ) : (
          <div
            ref={innerRef}
            className="auto-scroll-inner"
            style={{ "--scroll-offset": scrollOffset } as React.CSSProperties}
          >
            {items.map((item, idx) => (
              <NewsCard key={item.id} item={item} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
