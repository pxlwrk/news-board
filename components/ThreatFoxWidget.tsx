"use client";
import type { ThreatFoxData } from "@/lib/kpi-types";

const TYPE_LABELS: Record<string, string> = {
  "ip:port":   "IP:Port (C2)",
  "domain":    "Domain (C2)",
  "url":       "URL",
  "md5_hash":  "MD5-Hash",
  "sha256_hash":"SHA256-Hash",
};

interface Props { data: ThreatFoxData | null; loading?: boolean }

export function ThreatFoxWidget({ data, loading }: Props) {
  const maxCount = Math.max(...(data?.byType.map(t => t.count) ?? [1]), 1);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          🦊 Abuse.ch ThreatFox · IOCs
        </p>
        {data && (
          <span className="text-[9px] font-mono text-orange-400">{data.totalIOCs.toLocaleString("de")} IOCs</span>
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
        <div className="flex flex-col gap-2 flex-1 min-h-0">
          {/* Top malware badge */}
          <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-red-950/30 border border-red-900/30">
            <span className="text-[8px] text-slate-500 shrink-0">Top Malware-Familie</span>
            <span className="text-[10px] font-bold text-red-400 truncate">{data.topMalware}</span>
          </div>

          {/* IOC type distribution */}
          <div className="flex flex-col gap-1.5 flex-1 min-h-0">
            <p className="text-[8px] uppercase tracking-widest text-slate-600 shrink-0">IOC-Typen (letzte 7 Tage)</p>
            {data.byType.map(({ type, count }) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className="text-[9px] text-slate-400 w-20 shrink-0 truncate">
                  {TYPE_LABELS[type] ?? type}
                </span>
                <div className="flex-1 h-1.5 bg-slate-900 rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{ width: `${(count / maxCount) * 100}%`, background: "#f97316", opacity: 0.75 }}
                  />
                </div>
                <span className="text-[8px] font-mono text-slate-500 w-8 shrink-0 text-right">
                  {count.toLocaleString("de")}
                </span>
              </div>
            ))}
          </div>

          <div className="text-[7px] text-slate-700 shrink-0">Quelle: threatfox.abuse.ch</div>
        </div>
      )}
    </div>
  );
}
