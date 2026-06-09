"use client";
import { useEffect, useState } from "react";

interface StatusBarProps {
  lastFetched: string | null;
  loading: boolean;
  onRefresh: () => void;
  errorCount: number;
  usingDemoData?: boolean;
}

export function StatusBar({ lastFetched, loading, onRefresh, errorCount, usingDemoData }: StatusBarProps) {
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
    try {
      return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "–";
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-600/20 border border-blue-600/30">
          <span className="text-blue-400 text-base">⚡</span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-100 leading-tight tracking-tight">
            CTO Intelligence Dashboard
          </h1>
          <p className="text-[10px] text-slate-500 leading-none">Bundesministerium · Lagebild IT &amp; Sicherheit</p>
        </div>
      </div>

      {/* Center: Status indicators */}
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="flex items-center gap-1.5 text-xs text-blue-400">
            <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Feeds werden geladen…
          </div>
        ) : usingDemoData ? (
          <div className="flex items-center gap-1.5 text-xs text-violet-400">
            <span className="inline-block w-1.5 h-1.5 bg-violet-400 rounded-full" />
            Demo-Modus · Beispieldaten aktiv
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-emerald-500">
            <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Live · Stand: {lastFetched ? formatLastFetched(lastFetched) : "–"} Uhr
          </div>
        )}
        {!usingDemoData && errorCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-500/80">
            <span>⚠</span>
            <span>{errorCount} Quelle{errorCount > 1 ? "n" : ""} nicht erreichbar</span>
          </div>
        )}
      </div>

      {/* Right: Clock + Refresh */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-lg font-mono font-bold text-slate-100 leading-tight tabular-nums">
            {formatTime(now)}
          </div>
          <div className="text-[10px] text-slate-500 leading-none">{formatDate(now)}</div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
            bg-slate-800 border border-slate-700 text-slate-300
            hover:bg-slate-700 hover:text-slate-100 hover:border-slate-600
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className={loading ? "animate-spin" : ""}>⟳</span>
          Aktualisieren
        </button>
      </div>
    </div>
  );
}
