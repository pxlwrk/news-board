"use client";
import { useMemo } from "react";
import { FeedItem } from "@/lib/feeds";

const AXES = [
  { key: "ransomware", label: "Ransomware",   kw: /ransomware|verschlüssel|erpressung|locker/i,            color: "#ef4444" },
  { key: "phishing",   label: "Phishing",     kw: /phishing|spear.phish|bec\b|social.engineer/i,           color: "#f97316" },
  { key: "apt",        label: "APT/Staat",    kw: /\bapt\b|nation.state|staatlich|spionage|espionage/i,    color: "#a855f7" },
  { key: "supply",     label: "Supply Chain", kw: /supply.chain|lieferkette|open.source.*vuln|dependency/i, color: "#eab308" },
  { key: "kritis",     label: "KRITIS",       kw: /\bkritis\b|kritische.infra|energy|healthcare|krankenhaus/i, color: "#22d3ee" },
  { key: "regulation", label: "Regulierung",  kw: /nis2|dsgvo|gdpr|\bcra\b|cyber.resilience|compliance/i,  color: "#34d399" },
];

const N = AXES.length;
const CX = 90, CY = 90, R = 65;

function polar(idx: number, r: number) {
  const deg = (idx / N) * 360 - 90;
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

export function ThreatRadarChart({ feedItems }: { feedItems: FeedItem[] }) {
  const scores = useMemo(
    () =>
      AXES.map((a) => {
        const n = feedItems.filter((i) =>
          a.kw.test(i.title + " " + i.description)
        ).length;
        return { ...a, count: n, score: Math.max(Math.min(n / 8, 1), 0.04) };
      }),
    [feedItems]
  );

  const axisEnds = AXES.map((_, i) => polar(i, R));
  const labelPts  = AXES.map((_, i) => polar(i, R + 16));
  const ringLevels = [0.25, 0.5, 0.75, 1.0];

  const dataPath = scores
    .map((s, i) => {
      const { x, y } = polar(i, R * s.score);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ") + " Z";

  return (
    <div className="flex flex-col h-full">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1">
        🕷 Bedrohungsradar
      </div>
      <div className="flex items-center gap-1 flex-1">
        <svg viewBox="0 0 180 196" className="h-full w-auto shrink-0" style={{ maxWidth: "160px" }}>
          {/* Rings */}
          {ringLevels.map((lvl, ri) => (
            <polygon
              key={ri}
              points={AXES.map((_, i) => {
                const p = polar(i, R * lvl);
                return `${p.x},${p.y}`;
              }).join(" ")}
              fill="none"
              stroke={ri === 3 ? "#1e3a5f" : "#0f1f35"}
              strokeWidth={ri === 3 ? 0.8 : 0.5}
            />
          ))}

          {/* Axis lines */}
          {axisEnds.map((pt, i) => (
            <line key={i} x1={CX} y1={CY} x2={pt.x} y2={pt.y} stroke="#0f1f35" strokeWidth="0.6" />
          ))}

          {/* Data fill */}
          <path
            d={dataPath}
            fill="#3b82f618"
            stroke="#3b82f6"
            strokeWidth="1.2"
            style={{ filter: "drop-shadow(0 0 4px #3b82f640)" }}
          />

          {/* Data dots */}
          {scores.map((s, i) => {
            const { x, y } = polar(i, R * s.score);
            return (
              <circle
                key={i} cx={x} cy={y} r="2.5"
                fill={s.color} stroke="#06060e" strokeWidth="0.6"
                style={{ filter: `drop-shadow(0 0 3px ${s.color})` }}
              />
            );
          })}

          {/* Labels */}
          {scores.map((s, i) => {
            const lp = labelPts[i];
            const hot = s.score > 0.45;
            return (
              <text
                key={i} x={lp.x} y={lp.y}
                textAnchor="middle" dominantBaseline="middle"
                fill={hot ? s.color : "#475569"}
                fontSize="7" fontFamily="sans-serif"
                fontWeight={hot ? "700" : "400"}
              >
                {s.label}
              </text>
            );
          })}

          {/* Center */}
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle"
            fill="#334155" fontSize="6.5" fontFamily="sans-serif">Lage</text>
        </svg>

        {/* Scores */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {scores.map((s) => (
            <div key={s.key} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-[7.5px] text-slate-500 w-14 truncate">{s.label}</span>
              <div className="flex-1 h-1.5 bg-slate-900 rounded overflow-hidden">
                <div className="h-full rounded transition-all duration-700" style={{ width: `${s.score * 100}%`, background: s.color }} />
              </div>
              <span className="text-[8px] font-mono w-4 text-right shrink-0" style={{ color: s.count > 0 ? s.color : "#334155" }}>
                {s.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
