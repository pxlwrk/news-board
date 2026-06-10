"use client";
import { FeedItem } from "@/lib/feeds";

type Level = 0 | 1 | 2 | 3;

const LEVELS = [
  { label: "NIEDRIG",  color: "#10b981", fill: "#065f46" },
  { label: "MITTEL",   color: "#f59e0b", fill: "#78350f" },
  { label: "HOCH",     color: "#f97316", fill: "#7c2d12" },
  { label: "KRITISCH", color: "#ef4444", fill: "#7f1d1d" },
] as const;

const CRITICAL_KW = /kritisch|critical|0.day|zero.day|emergency|notfall|exploit|ransomware|breach|kompromittiert/i;
const HIGH_KW     = /schwerwiegend|high|gefährlich|angriff|attack|vulnerability|cve-|patch|dringend|urgent/i;
const MED_KW      = /medium|warning|warnung|sicherheitslücke|update|mittel/i;

function assess(items: FeedItem[]): Level {
  const text = items.slice(0, 8).map((i) => i.title + " " + i.description).join(" ");
  if (CRITICAL_KW.test(text)) return 3;
  if (HIGH_KW.test(text))     return 2;
  if (MED_KW.test(text))      return 1;
  return 0;
}

// Arc from angle startDeg to endDeg on circle r, cx=50, cy=50
function arcPath(startDeg: number, endDeg: number, r: number): string {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const x1 = 50 + r * Math.cos(toRad(startDeg));
  const y1 = 50 + r * Math.sin(toRad(startDeg));
  const x2 = 50 + r * Math.cos(toRad(endDeg));
  const y2 = 50 + r * Math.sin(toRad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export function ThreatGauge({ securityItems, compact }: { securityItems: FeedItem[]; compact?: boolean }) {
  const level = assess(securityItems);
  const lv = LEVELS[level];

  // Gauge spans -135° to +135° (270° total), split into 4 segments
  const START = -135;
  const TOTAL = 270;
  const SEG   = TOTAL / 4;

  // Needle angle
  const needleDeg = START + level * SEG + SEG / 2;
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const nx = 50 + 28 * Math.cos(toRad(needleDeg));
  const ny = 50 + 28 * Math.sin(toRad(needleDeg));

  return (
    <div className={`flex flex-col items-center justify-center ${compact ? "px-3 py-2 min-w-[120px]" : "px-4 py-3 min-w-[140px]"} rounded-lg border border-slate-700/50 bg-slate-900/40 h-full`}>
      <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-500 mb-0.5">Bedrohungslage</div>
      <svg viewBox="0 0 100 65" className={compact ? "w-20 h-[3.2rem]" : "w-28 h-[4.5rem]"} overflow="visible">
        {/* Background arcs */}
        {LEVELS.map((l, i) => (
          <path
            key={i}
            d={arcPath(START + i * SEG, START + (i + 1) * SEG, 34)}
            fill="none"
            stroke={i === level ? l.color : l.fill}
            strokeWidth="8"
            strokeLinecap="butt"
            opacity={i === level ? 1 : 0.4}
          />
        ))}
        {/* Needle */}
        <line x1="50" y1="50" x2={nx} y2={ny}
          stroke={lv.color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="50" r="3.5" fill={lv.color} />
        <circle cx="50" cy="50" r="1.5" fill="#0f172a" />
      </svg>
      <div className={`${compact ? "text-xs" : "text-sm"} font-bold tracking-widest mt-0.5`} style={{ color: lv.color }}>
        {lv.label}
        {level === 3 && (
          <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
        )}
      </div>
    </div>
  );
}
