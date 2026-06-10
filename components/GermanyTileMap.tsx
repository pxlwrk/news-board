"use client";
import { useMemo } from "react";
import { FeedItem } from "@/lib/feeds";

// ── State definitions ────────────────────────────────────────────────────
const STATES = [
  // row, col, abbr, fullName, baseThreat (0–1, KRITIS-weighted)
  { r: 0, c: 1, abbr: "SH",  name: "Schleswig-Holstein",  base: 0.40, kw: /schleswig.holstein|kiel|lübeck|flensburg/i },
  { r: 0, c: 3, abbr: "MV",  name: "Mecklenburg-Vorp.",   base: 0.34, kw: /mecklenburg|rostock|schwerin|greifswald/i },
  { r: 1, c: 0, abbr: "HB",  name: "Bremen",              base: 0.51, kw: /\bbremen\b/i },
  { r: 1, c: 1, abbr: "HH",  name: "Hamburg",             base: 0.77, kw: /\bhamburg\b|hafen.*nord/i },
  { r: 1, c: 2, abbr: "BB",  name: "Brandenburg",         base: 0.39, kw: /\bbrandenburg\b|potsdam/i },
  { r: 2, c: 0, abbr: "NI",  name: "Niedersachsen",       base: 0.63, kw: /niedersachsen|hannover|braunschweig|wolfsburg|osnabrück/i },
  { r: 2, c: 2, abbr: "BE",  name: "Berlin",              base: 0.89, kw: /\bberlin\b/i },
  { r: 3, c: 0, abbr: "NRW", name: "Nordrhein-Westfalen", base: 0.95, kw: /\bnrw\b|nordrhein|westfalen|köln|düsseldorf|dortmund|essen|bochum|duisburg|ruhrgebiet/i },
  { r: 3, c: 1, abbr: "SA",  name: "Sachsen-Anhalt",      base: 0.42, kw: /sachsen.anhalt|magdeburg|halle/i },
  { r: 4, c: 0, abbr: "RP",  name: "Rheinland-Pfalz",     base: 0.51, kw: /rheinland.pfalz|mainz|ludwigshafen|koblenz|trier/i },
  { r: 4, c: 1, abbr: "HE",  name: "Hessen",              base: 0.85, kw: /\bhessen\b|frankfurt|wiesbaden|kassel|darmstadt/i },
  { r: 4, c: 2, abbr: "TH",  name: "Thüringen",           base: 0.40, kw: /\bthüringen\b|erfurt|jena|gera/i },
  { r: 4, c: 3, abbr: "SN",  name: "Sachsen",             base: 0.59, kw: /\bsachsen\b(?!.anhalt)|dresden|leipzig|chemnitz/i },
  { r: 5, c: 0, abbr: "SAR", name: "Saarland",            base: 0.34, kw: /saarland|saarbrücken/i },
  { r: 5, c: 1, abbr: "BW",  name: "Baden-Württemberg",   base: 0.87, kw: /baden.württemberg|stuttgart|mannheim|karlsruhe|freiburg|heidelberg/i },
  { r: 5, c: 3, abbr: "BY",  name: "Bayern",              base: 0.91, kw: /\bbayern\b|münchen|nürnberg|augsburg|regensburg|ingolstadt/i },
] as const;

// ── Color helpers ────────────────────────────────────────────────────────
function threatColor(t: number): { bg: string; text: string; glow: string } {
  if (t >= 0.80) return { bg: "#5c0a0a", text: "#fca5a5", glow: "0 0 12px #ef444460" };
  if (t >= 0.65) return { bg: "#7c2d12", text: "#fdba74", glow: "0 0 8px #f9731640" };
  if (t >= 0.50) return { bg: "#3d2c00", text: "#fcd34d", glow: "0 0 6px #f59e0b30" };
  if (t >= 0.35) return { bg: "#0f2a1f", text: "#6ee7b7", glow: "none" };
  return { bg: "#0c1a2e", text: "#93c5fd", glow: "none" };
}

function threatLabel(t: number): string {
  if (t >= 0.80) return "KRIT";
  if (t >= 0.65) return "HOCH";
  if (t >= 0.50) return "MITTEL";
  return "LOW";
}

// ── Component ────────────────────────────────────────────────────────────
interface GermanyTileMapProps {
  feedItems: FeedItem[];
}

export function GermanyTileMap({ feedItems }: GermanyTileMapProps) {
  const scores = useMemo(() => {
    const recent = feedItems.filter(
      (i) => Date.now() - new Date(i.pubDate).getTime() < 48 * 60 * 60 * 1000
    );
    return STATES.map((s) => {
      const matches = recent.filter(
        (i) => s.kw.test(i.title + " " + i.description)
      ).length;
      // Blend base score with news-derived bonus (cap at 1.0)
      const score = Math.min(s.base + matches * 0.07, 1.0);
      return { ...s, score };
    });
  }, [feedItems]);

  const COLS = 4;
  const ROWS = 6;
  const CW = 50; // cell width
  const CH = 36; // cell height
  const GAP = 3;
  const svgW = COLS * (CW + GAP) - GAP;
  const svgH = ROWS * (CH + GAP) - GAP;

  const cellX = (c: number) => c * (CW + GAP);
  const cellY = (r: number) => r * (CH + GAP);

  return (
    <div className="flex flex-col h-full">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
        🗺 Deutschland · Bedrohungsintensität je Bundesland
      </div>

      <div className="flex gap-4 flex-1 min-h-0 items-start">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width={svgW}
          height={svgH}
          className="shrink-0"
        >
          {scores.map((s) => {
            const c = threatColor(s.score);
            const x = cellX(s.c);
            const y = cellY(s.r);
            const pulse = s.score >= 0.75;
            return (
              <g key={s.abbr}>
                {pulse && (
                  <rect
                    x={x - 2} y={y - 2}
                    width={CW + 4} height={CH + 4}
                    rx="5" ry="5"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.6;0;0.6"
                      dur={`${1.8 + (s.c + s.r) * 0.3}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-width"
                      values="1;3;1"
                      dur={`${1.8 + (s.c + s.r) * 0.3}s`}
                      repeatCount="indefinite"
                    />
                  </rect>
                )}
                <rect
                  x={x} y={y}
                  width={CW} height={CH}
                  rx="4" ry="4"
                  fill={c.bg}
                  style={{ filter: c.glow !== "none" ? `drop-shadow(${c.glow})` : undefined }}
                />
                <text
                  x={x + CW / 2} y={y + CH / 2 - 3}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={c.text}
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  {s.abbr}
                </text>
                <text
                  x={x + CW / 2} y={y + CH - 7}
                  textAnchor="middle"
                  fill={c.text}
                  fontSize="7"
                  opacity="0.8"
                  fontFamily="sans-serif"
                >
                  {Math.round(s.score * 100)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-col gap-1.5 text-[9px] shrink-0 mt-1">
          {[
            { label: "Kritisch", color: "#fca5a5", bg: "#5c0a0a" },
            { label: "Hoch",     color: "#fdba74", bg: "#7c2d12" },
            { label: "Mittel",   color: "#fcd34d", bg: "#3d2c00" },
            { label: "Niedrig",  color: "#6ee7b7", bg: "#0f2a1f" },
            { label: "Gering",   color: "#93c5fd", bg: "#0c1a2e" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-2.5 rounded-sm shrink-0"
                style={{ background: l.bg, border: `1px solid ${l.color}40` }}
              />
              <span className="text-slate-500">{l.label}</span>
            </div>
          ))}
          <div className="mt-2 pt-1.5 border-t border-slate-800 text-slate-600 text-[8px] leading-tight">
            Basis: KRITIS-Dichte<br />
            + Medienmeldungen 48h
          </div>
        </div>

        {/* Top threats list */}
        <div className="flex flex-col gap-1 text-[9px] flex-1 min-w-0 mt-1">
          <div className="text-slate-600 uppercase tracking-wider mb-0.5 font-semibold">Top Risiko</div>
          {[...scores]
            .sort((a, b) => b.score - a.score)
            .slice(0, 6)
            .map((s) => {
              const c = threatColor(s.score);
              return (
                <div key={s.abbr} className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: c.text }}
                  />
                  <span className="text-slate-400 truncate">{s.name}</span>
                  <span
                    className="ml-auto font-mono tabular-nums shrink-0"
                    style={{ color: c.text }}
                  >
                    {Math.round(s.score * 100)}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
