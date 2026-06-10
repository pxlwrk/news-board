"use client";
import { CloudflareData } from "@/app/api/kpis/route";

interface Props {
  data: CloudflareData | null;
  loading?: boolean;
}

function RpkiDonut({ valid, invalid }: { valid: number; invalid: number }) {
  const unknown = Math.max(0, 100 - valid - invalid);
  const segs = [
    { value: valid,   color: "#34d399", label: "Valid" },
    { value: invalid, color: "#ef4444", label: "Invalid" },
    { value: unknown, color: "#1e293b", label: "Unknown" },
  ];
  const cx = 30, cy = 30, r = 22, strokeW = 10;
  let offset = -90; // start at top
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-2 shrink-0">
      <svg viewBox="0 0 60 60" width={60} height={60}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0f172a" strokeWidth={strokeW} />
        {segs.map((s, i) => {
          if (s.value <= 0) return null;
          const dash = (s.value / 100) * circ;
          const gap  = circ - dash;
          const rotate = offset;
          offset += (s.value / 100) * 360;
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={strokeW}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={0}
              transform={`rotate(${rotate} ${cx} ${cy})`}
              style={{ filter: s.value > 5 ? `drop-shadow(0 0 3px ${s.color}60)` : undefined }}
            />
          );
        })}
        <text x={cx} y={cy - 3} textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="700" fontFamily="monospace">{valid}%</text>
        <text x={cx} y={cy + 7} textAnchor="middle" fill="#64748b" fontSize="6" fontFamily="sans-serif">RPKI</text>
      </svg>
      <div className="flex flex-col gap-1">
        {segs.slice(0, 2).map((s) => (
          <div key={s.label} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-[8px] text-slate-500 w-10">{s.label}</span>
            <span className="text-[9px] font-mono font-bold" style={{ color: s.color }}>{s.value}%</span>
          </div>
        ))}
        <div className="text-[7px] text-slate-700 mt-0.5">Cloudflare Radar</div>
      </div>
    </div>
  );
}

function DdosTrend({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const max = Math.max(...values.map(Math.abs), 1);
  const H = 36, W = 80;
  const barW = Math.floor((W - (values.length - 1) * 2) / values.length);

  return (
    <div className="flex flex-col gap-1 flex-1 min-w-0">
      <span className="text-[8px] text-slate-600">DDoS L3 · 24h</span>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="shrink-0">
        {/* Baseline */}
        <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#1e293b" strokeWidth="0.5" />
        {values.map((v, i) => {
          const norm = v / max;
          const isUp = norm >= 0;
          const barH = Math.max(Math.abs(norm) * (H / 2 - 2), 1);
          const x = i * (barW + 2);
          const y = isUp ? H / 2 - barH : H / 2;
          const color = norm > 0.3 ? "#ef4444" : norm > 0 ? "#f97316" : "#3b82f6";
          return (
            <rect
              key={i}
              x={x} y={y} width={barW} height={barH}
              fill={color}
              opacity={0.7 + (i / values.length) * 0.3}
              rx="0.5"
            />
          );
        })}
      </svg>
      <div className="flex justify-between">
        <span className="text-[7px] text-slate-700">-24h</span>
        <span className="text-[7px] text-slate-500">jetzt</span>
      </div>
    </div>
  );
}

export function CloudflareWidget({ data, loading }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
        ☁️ Cloudflare Radar · BGP/DDoS
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-slate-700 text-xs">Lädt…</span>
        </div>
      ) : !data ? (
        <div className="flex-1 flex items-center justify-center flex-col gap-1">
          <span className="text-slate-700 text-xs">Kein API-Token</span>
          <span className="text-slate-800 text-[9px]">CLOUDFLARE_RADAR_TOKEN</span>
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-1">
          <RpkiDonut valid={data.rpkiValidPct} invalid={data.rpkiInvalidPct} />
          <DdosTrend values={data.ddosTrend} />
        </div>
      )}
    </div>
  );
}
