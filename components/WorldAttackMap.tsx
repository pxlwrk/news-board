"use client";

// Equirectangular-ish projection, viewBox 0 0 800 400
const DE = { x: 352, y: 113 };

const SOURCES = [
  { cc: "CN", x: 685, y: 178, active: true  },
  { cc: "RU", x: 568, y:  90, active: true  },
  { cc: "US", x: 162, y: 162, active: true  },
  { cc: "KR", x: 718, y: 168, active: false },
  { cc: "IN", x: 596, y: 198, active: false },
  { cc: "TR", x: 448, y: 140, active: true  },
  { cc: "UA", x: 418, y: 108, active: true  },
  { cc: "BR", x: 196, y: 295, active: false },
  { cc: "NL", x: 340, y: 106, active: false },
  { cc: "PL", x: 388, y: 106, active: false },
];

// Simplified continent blobs
const CONTINENTS = [
  "M 62 65 L 178 50 L 238 95 L 242 185 L 205 235 L 142 260 L 80 235 L 40 170 Z",
  "M 142 255 L 248 252 L 278 308 L 252 400 L 182 412 L 130 358 Z",
  "M 308 50 L 438 55 L 450 108 L 418 172 L 355 182 L 296 152 L 290 100 Z",
  "M 292 175 L 450 175 L 462 228 L 438 382 L 368 418 L 292 382 L 264 298 Z",
  "M 438 52 L 798 45 L 798 262 L 682 328 L 556 318 L 448 268 L 436 178 L 438 55 Z",
  "M 622 268 L 790 262 L 798 345 L 724 395 L 622 390 L 606 328 Z",
];

function arc(s: { x: number; y: number }): string {
  const mx = (s.x + DE.x) / 2;
  const my = Math.min(s.y, DE.y) - 72;
  return `M ${s.x} ${s.y} Q ${mx} ${my} ${DE.x} ${DE.y}`;
}

interface Props {
  topCountry?: string;
  attacksPerHour?: number;
  loading?: boolean;
}

export function WorldAttackMap({ topCountry, attacksPerHour, loading }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          🌐 Globale Angriffslage
        </span>
        {attacksPerHour != null && (
          <span className="text-[9px] font-mono text-orange-400">
            {attacksPerHour.toLocaleString("de")} /h
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-slate-700 text-xs">Lädt…</span>
        </div>
      ) : (
        <svg viewBox="0 0 800 400" className="w-full flex-1" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="de-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            <filter id="arc-glow">
              <feGaussianBlur stdDeviation="1.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <rect width="800" height="400" fill="#060912" />

          {CONTINENTS.map((d, i) => (
            <path key={i} d={d} fill="#0d1f38" stroke="#1e3552" strokeWidth="0.8" />
          ))}

          {/* Grid lines */}
          {[100, 200, 300].map((y) => (
            <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#0f1f35" strokeWidth="0.4" />
          ))}
          {[200, 400, 600].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="400" stroke="#0f1f35" strokeWidth="0.4" />
          ))}

          {/* Attack arcs */}
          {SOURCES.map((src, i) => {
            const isTop = src.cc === topCountry;
            const dur = `${2.2 + (i % 4) * 0.6}s`;
            const delay = `${(i * 0.55) % 3}s`;
            return (
              <path
                key={src.cc}
                d={arc(src)}
                fill="none"
                stroke={isTop ? "#ef4444" : src.active ? "#3b82f6" : "#1e3a5f"}
                strokeWidth={isTop ? 1.8 : src.active ? 0.9 : 0.5}
                strokeDasharray={isTop ? "8 3" : "5 5"}
                opacity={isTop ? 1 : src.active ? 0.65 : 0.3}
                style={{
                  animation: `wam-dash ${dur} linear ${delay} infinite`,
                  filter: isTop ? "url(#arc-glow)" : undefined,
                }}
              />
            );
          })}

          {/* Germany */}
          <circle cx={DE.x} cy={DE.y} r="20" fill="url(#de-glow)" />
          <circle cx={DE.x} cy={DE.y} r="5" fill="#ef4444" stroke="#fca5a5" strokeWidth="1.2">
            <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x={DE.x} y={DE.y + 18} textAnchor="middle" fill="#fca5a5" fontSize="8" fontFamily="monospace" fontWeight="700">DE</text>

          {/* Source dots */}
          {SOURCES.map((src) => {
            const isTop = src.cc === topCountry;
            return (
              <g key={src.cc}>
                {isTop && (
                  <circle cx={src.x} cy={src.y} r="5" fill="none" stroke="#ef4444" strokeWidth="1">
                    <animate attributeName="r" values="5;14;5" dur="1.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={src.x} cy={src.y}
                  r={isTop ? 4.5 : src.active ? 3 : 2}
                  fill={isTop ? "#ef4444" : src.active ? "#f97316" : "#334155"}
                  stroke={isTop ? "#fca5a5" : src.active ? "#fb923c" : "#475569"}
                  strokeWidth="0.6"
                />
                <text
                  x={src.x} y={src.y - 7}
                  textAnchor="middle"
                  fill={isTop ? "#fca5a5" : src.active ? "#94a3b8" : "#475569"}
                  fontSize="6.5" fontFamily="monospace"
                >
                  {src.cc}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      <style>{`
        @keyframes wam-dash { to { stroke-dashoffset: -60; } }
      `}</style>
    </div>
  );
}
