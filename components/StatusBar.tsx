"use client";
import { useEffect, useState } from "react";

interface StatusBarProps {
  lastFetched: string | null;
  loading: boolean;
  onRefresh: () => void;       // kept for programmatic use, not shown as button
  errorCount: number;
  usingDemoData?: boolean;
}

export function StatusBar({ lastFetched, loading, errorCount, usingDemoData }: StatusBarProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatDate = (d: Date) =>
    d.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  const formatLastFetched = (iso: string) => {
    try { return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }); }
    catch { return "–"; }
  };

  return (
    <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm shrink-0">
      {/* Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-600/20 border border-blue-600/30">
          <span className="text-blue-400 text-base">⚡</span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-100 leading-tight tracking-tight">
            CTO Intelligence Dashboard
          </h1>
          <p className="text-[10px] text-slate-500 leading-none">
            Bundesministerium · IT-Lagebild · ~2.500 Arbeitsplätze
          </p>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-5">
        {loading ? (
          <div className="flex items-center gap-1.5 text-xs text-blue-400">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse inline-block" />
            Aktualisierung läuft…
          </div>
        ) : usingDemoData ? (
          <div className="flex items-center gap-1.5 text-xs text-violet-400">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full inline-block" />
            Demo-Modus · Live-Feeds nach Deployment
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-emerald-500">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
            Live · Stand {lastFetched ? formatLastFetched(lastFetched) : "–"} Uhr
          </div>
        )}

        {!usingDemoData && errorCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-500/70">
            <span>⚠</span>
            <span>{errorCount} Quelle{errorCount > 1 ? "n" : ""} nicht erreichbar</span>
          </div>
        )}

        {/* Refresh intervals legend */}
        <div className="flex items-center gap-2 text-[10px] text-slate-700">
          <span>News 5 min</span>
          <span className="text-slate-800">·</span>
          <span>KPIs 15 min</span>
          <span className="text-slate-800">·</span>
          <span>Social 3 min</span>
        </div>
      </div>

      {/* Clock */}
      <div className="text-right">
        <div className="text-xl font-mono font-bold text-slate-100 leading-tight tabular-nums tracking-tight">
          {formatTime(now)}
        </div>
        <div className="text-[10px] text-slate-500 leading-none">{formatDate(now)}</div>
      </div>
    </div>
  );
}
