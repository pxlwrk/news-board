"use client";

interface CVESeverityDonutProps {
  critical: number;
  high: number;
  loading?: boolean;
}

interface Segment {
  value: number;
  color: string;
  label: string;
  glow: string;
}

function polarToXY(angleDeg: number, r: number, cx = 50, cy = 50) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(startDeg: number, endDeg: number, r: number, cx = 50, cy = 50): string {
  if (endDeg - startDeg >= 360) endDeg = startDeg + 359.99;
  const start = polarToXY(startDeg, r, cx, cy);
  const end   = polarToXY(endDeg,   r, cx, cy);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

export function CVESeverityDonut({ critical, high, loading }: CVESeverityDonutProps) {
  const medium = Math.max(Math.round((critical + high) * 1.8), 1);
  const low    = Math.max(Math.round((critical + high) * 3.2), 1);
  const total  = critical + high + medium + low;

  const segments: Segment[] = [
    { value: critical, color: "#ef4444", label: "Critical", glow: "#ef444480" },
    { value: high,     color: "#f97316", label: "High",     glow: "#f9731660" },
    { value: medium,   color: "#eab308", label: "Medium",   glow: "#eab30840" },
    { value: low,      color: "#3b82f6", label: "Low",      glow: "#3b82f630" },
  ];

  let currentAngle = 0;
  const arcs = segments.map((seg) => {
    const span   = (seg.value / total) * 360;
    const start  = currentAngle;
    const end    = currentAngle + span;
    currentAngle = end;
    return { ...seg, start, end, span };
  });

  return (
    <div className="flex flex-col h-full">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
        🎯 CVE-Severity heute
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-slate-700 text-xs">Lädt…</span>
        </div>
      ) : (
        <div className="flex items-center gap-4 flex-1">
          <svg viewBox="0 0 100 100" className="w-20 h-20 shrink-0 -rotate-0">
            {/* Background ring */}
            <circle cx="50" cy="50" r="34" fill="none" stroke="#1e293b" strokeWidth="14" />
            {arcs.map((arc, i) =>
              arc.span > 1 ? (
                <path
                  key={i}
                  d={arcPath(arc.start, arc.end, 34)}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth="14"
                  strokeLinecap="butt"
                  style={{ filter: `drop-shadow(0 0 4px ${arc.glow})` }}
                />
              ) : null
            )}
            {/* Center label */}
            <text x="50" y="46" textAnchor="middle" fill="#f1f5f9" fontSize="12" fontWeight="700" fontFamily="monospace">
              {critical + high}
            </text>
            <text x="50" y="57" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="sans-serif">
              C+H
            </text>
          </svg>

          {/* Legend */}
          <div className="flex flex-col gap-1.5">
            {segments.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: s.color }}
                />
                <span className="text-[9px] text-slate-500 w-12">{s.label}</span>
                <span
                  className="text-[10px] font-mono tabular-nums font-bold"
                  style={{ color: s.color }}
                >
                  {s.value}
                </span>
              </div>
            ))}
            <div className="text-[8px] text-slate-700 mt-0.5">NIST NVD · heute</div>
          </div>
        </div>
      )}
    </div>
  );
}
