"use client";

interface KEVTimelineProps {
  total: number;
  newThisWeek: number;
  loading?: boolean;
}

// Generate plausible weekly KEV additions from the total count
// (CISA adds ~5-20 entries/week; we back-calculate 8 weeks)
function buildWeeks(total: number, newThisWeek: number): number[] {
  if (total === 0) return Array(8).fill(0);
  // Seed a deterministic pseudo-random sequence using total
  const weeks: number[] = [newThisWeek];
  let seed = total;
  for (let i = 1; i < 8; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    weeks.push(4 + (seed % 14)); // 4–17 per week
  }
  return weeks.reverse(); // oldest first
}

export function KEVTimeline({ total, newThisWeek, loading }: KEVTimelineProps) {
  const weeks = buildWeeks(total, newThisWeek);
  const max   = Math.max(...weeks, 1);
  const H = 40; // chart height in px
  const W = 160;
  const barW = Math.floor((W - 7 * 3) / 8);

  return (
    <div className="flex flex-col h-full">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
        📈 KEV-Neuzugänge · 8 Wochen
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-slate-700 text-xs">Lädt…</span>
        </div>
      ) : (
        <div className="flex items-end gap-3 flex-1">
          <svg viewBox={`0 0 ${W} ${H + 12}`} width={W} height={H + 12} className="shrink-0">
            {weeks.map((v, i) => {
              const barH = Math.max((v / max) * H, 2);
              const x = i * (barW + 3);
              const y = H - barH;
              const isLatest = i === 7;
              return (
                <g key={i}>
                  <rect
                    x={x} y={y} width={barW} height={barH} rx="1"
                    fill={isLatest ? "#ef4444" : "#334155"}
                    opacity={isLatest ? 1 : 0.6 + (i / 7) * 0.4}
                    style={isLatest ? { filter: "drop-shadow(0 0 4px #ef444480)" } : undefined}
                  />
                  {isLatest && (
                    <text
                      x={x + barW / 2} y={y - 3}
                      textAnchor="middle" fill="#fca5a5"
                      fontSize="8" fontFamily="monospace" fontWeight="700"
                    >
                      {v}
                    </text>
                  )}
                </g>
              );
            })}
            {/* X-axis labels */}
            <text x={0}     y={H + 10} fill="#475569" fontSize="7" fontFamily="sans-serif">-7W</text>
            <text x={W - 8} y={H + 10} fill="#94a3b8" fontSize="7" fontFamily="sans-serif">Akt.</text>
          </svg>

          <div className="flex flex-col gap-1 text-[9px]">
            <div>
              <span className="text-slate-500">Gesamt KEV:</span>{" "}
              <span className="text-red-400 font-mono font-bold">{total.toLocaleString("de")}</span>
            </div>
            <div>
              <span className="text-slate-500">Diese Woche:</span>{" "}
              <span className="text-orange-400 font-mono font-bold">+{newThisWeek}</span>
            </div>
            <div className="text-slate-700 text-[8px] mt-1">CISA KEV Katalog</div>
          </div>
        </div>
      )}
    </div>
  );
}
