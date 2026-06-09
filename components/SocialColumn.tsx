"use client";
import { useEffect, useRef, useState } from "react";
import { SocialPost } from "@/lib/social";
import { SocialCard } from "./SocialCard";

interface SocialColumnProps {
  posts: SocialPost[];
  loading: boolean;
  usingDemoData?: boolean;
}

function SkeletonRow({ idx }: { idx: number }) {
  return (
    <div className={`flex flex-col gap-1.5 px-2.5 py-2 animate-pulse ${idx % 2 === 0 ? "bg-slate-900/20" : ""}`}>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
        <div className="w-12 h-2 bg-slate-800 rounded" />
        <div className="w-20 h-2 bg-slate-800 rounded" />
      </div>
      <div className="w-full h-2 bg-slate-800 rounded" />
      <div className="w-5/6 h-2 bg-slate-800 rounded" />
      <div className="w-3/4 h-2 bg-slate-800 rounded" />
    </div>
  );
}

export function SocialColumn({ posts, loading, usingDemoData }: SocialColumnProps) {
  const mastodon = posts.filter((p) => p.platform === "mastodon").length;
  const bluesky  = posts.filter((p) => p.platform === "bluesky").length;
  const innerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState("0px");

  useEffect(() => {
    if (!innerRef.current || !outerRef.current) return;
    const inner = innerRef.current.scrollHeight;
    const outer = outerRef.current.clientHeight;
    if (inner > outer) setScrollOffset(`-${inner - outer}px`);
    else setScrollOffset("0px");
  }, [posts]);

  return (
    <div className="flex flex-col h-full min-h-0 rounded-lg border border-violet-800/30 bg-slate-950/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-violet-800/30 bg-violet-950/25 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm leading-none">💬</span>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
            Social Stream
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {!loading && posts.length > 0 && (
            <>
              <span className="text-[9px] text-violet-600">M:{mastodon}</span>
              <span className="text-[9px] text-sky-600">BS:{bluesky}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-950/40 text-violet-400">
                {posts.length}
              </span>
            </>
          )}
          {usingDemoData && (
            <span className="text-[9px] text-slate-600 italic">demo</span>
          )}
        </div>
      </div>

      {/* Feed — auto-scroll */}
      <div ref={outerRef} className="flex-1 overflow-hidden">
        {loading ? (
          <div>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} idx={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-700 py-8">
            <span className="text-2xl mb-2">📡</span>
            <span className="text-[10px]">Keine Posts gefunden</span>
          </div>
        ) : (
          <div
            ref={innerRef}
            className="auto-scroll-inner"
            style={
              {
                "--scroll-offset": scrollOffset,
                "--scroll-duration": "50s",
              } as React.CSSProperties
            }
          >
            {posts.map((post, idx) => (
              <SocialCard key={post.id} post={post} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
