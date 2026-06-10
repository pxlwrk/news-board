"use client";
import type { ISCSansData } from "@/lib/kpi-types";

const LEVEL: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  green:  { label: "NORMAL",   color: "#10b981", bg: "#052e16", desc: "Kein erhöhtes Risiko" },
  yellow: { label: "ERHÖHT",   color: "#f59e0b", bg: "#2d1a00", desc: "Erhöhte Aktivität" },
  orange: { label: "HOCH",     color: "#f97316", bg: "#431407", desc: "Signifikante Bedrohung" },
  red:    { label: "KRITISCH", color: "#ef4444", bg: "#450a0a", desc: "Kritischer Vorfall" },
};

const PORT_LABELS: Record<number, string> = {
  22: "SSH", 23: "Telnet", 80: "HTTP", 443: "HTTPS", 445: "SMB",
  3389: "RDP", 8080: "HTTP-Alt", 1433: "MSSQL", 3306: "MySQL", 5900: "VNC",
  25: "SMTP", 53: "DNS", 110: "POP3", 143: "IMAP", 8443: "HTTPS-Alt",
};

interface Props { data: ISCSansData | null; loading?: boolean }

export function ISCSansWidget({ data, loading }: Props) {
  const level = LEVEL[data?.infocon ?? "green"] ?? LEVEL.green;
  const maxCount = Math.max(...(data?.topPorts.map(p => p.count) ?? [1]), 1);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          🌐 ISC/SANS Internet Storm Center
        </p>
        <span className="text-[8px] text-slate-600">isc.sans.edu</span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-slate-700 text-xs">Lädt…</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2 flex-1 min-h-0">
          {/* Infocon badge */}
          <div className="flex items-center gap-2 px-2 py-1.5 rounded" style={{ background: level.bg }}>
            <div className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: level.color }} />
            <div>
              <div className="text-[10px] font-black tracking-widest" style={{ color: level.color }}>
                INFOCON {level.label}
              </div>
              <div className="text-[8px] text-slate-500">{level.desc}</div>
            </div>
          </div>

          {/* Top ports */}
          {data?.topPorts && data.topPorts.length > 0 && (
            <div className="flex flex-col gap-1 flex-1 min-h-0">
              <p className="text-[8px] uppercase tracking-widest text-slate-600 shrink-0">Top angegriffene Ports heute</p>
              {data.topPorts.map(({ port, count }) => (
                <div key={port} className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-slate-400 w-10 shrink-0 text-right">{port}</span>
                  <span className="text-[8px] text-slate-600 w-12 shrink-0 truncate">
                    {PORT_LABELS[port] ?? "—"}
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-900 rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all"
                      style={{ width: `${(count / maxCount) * 100}%`, background: level.color, opacity: 0.7 }}
                    />
                  </div>
                  <span className="text-[8px] font-mono text-slate-500 w-10 shrink-0 text-right">
                    {count.toLocaleString("de")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
