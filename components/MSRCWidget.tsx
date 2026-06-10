"use client";
import type { MSRCRelease } from "@/lib/kpi-types";

interface Props {
  data: MSRCRelease | null;
  loading?: boolean;
}

export function MSRCWidget({ data, loading }: Props) {
  const total = data ? data.critical + data.important + data.moderate : 0;
  const bars = data
    ? [
        { label: "Critical",  value: data.critical,  color: "#ef4444" },
        { label: "Important", value: data.important, color: "#f97316" },
        { label: "Moderate",  value: data.moderate,  color: "#eab308" },
      ]
    : [];
  const maxVal = Math.max(...bars.map((b) => b.value), 1);

  function fmtDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "2-digit" });
    } catch { return iso; }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          🪟 MSRC · Patch Tuesday
        </span>
        {data && (
          <span className="text-[9px] text-slate-600">{fmtDate(data.releaseDate)}</span>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-slate-700 text-xs">Lädt…</span>
        </div>
      ) : !data ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-slate-700 text-xs">Keine Daten</span>
        </div>
      ) : (
        <div className="flex gap-3 flex-1 items-center">
          {/* Big number */}
          <div className="flex flex-col items-center shrink-0">
            <span className="text-3xl font-black font-mono text-slate-100 leading-none">
              {total}
            </span>
            <span className="text-[8px] text-slate-600 mt-0.5">CVEs total</span>
            <span className="text-[8px] text-slate-700 mt-1 text-center max-w-14 truncate">
              {data.id}
            </span>
          </div>

          {/* Severity bars */}
          <div className="flex flex-col gap-2 flex-1">
            {bars.map((b) => (
              <div key={b.label} className="flex items-center gap-2">
                <span className="text-[9px] w-14 shrink-0" style={{ color: b.color }}>
                  {b.label}
                </span>
                <div className="flex-1 h-3 bg-slate-900 rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm transition-all duration-700"
                    style={{
                      width: `${(b.value / maxVal) * 100}%`,
                      background: `linear-gradient(90deg, ${b.color}cc, ${b.color}44)`,
                      minWidth: b.value > 0 ? "4px" : "0",
                      boxShadow: b.value > 0 ? `0 0 6px ${b.color}40` : "none",
                    }}
                  />
                </div>
                <span
                  className="text-[10px] font-mono w-5 text-right shrink-0 font-bold"
                  style={{ color: b.value > 0 ? b.color : "#475569" }}
                >
                  {b.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
