"use client";
import { useMemo } from "react";
import { FeedItem } from "@/lib/feeds";

const STATES = [
  { id: "SH",  label: "SH",  name: "Schleswig-Holstein",  kw: /schleswig|holstein|kiel|flensburg/i,                           base: 0.35, cx: 178, cy: 38,  path: "M 130 8 L 212 5 L 226 28 L 245 52 L 208 68 L 182 75 L 160 70 L 130 52 Z" },
  { id: "HH",  label: "HH",  name: "Hamburg",             kw: /hamburg\b|hansestadt/i,                                        base: 0.55, cx: 187, cy: 76,  path: "M 179 70 L 194 70 L 194 82 L 179 82 Z" },
  { id: "MV",  label: "MV",  name: "Mecklenburg-Vorp.",   kw: /mecklenburg|vorpommern|rostock|schwerin/i,                     base: 0.30, cx: 258, cy: 30,  path: "M 130 8 L 130 52 L 160 70 L 182 75 L 208 68 L 245 52 L 265 62 L 375 58 L 375 8 Z" },
  { id: "NI",  label: "NI",  name: "Niedersachsen",       kw: /niedersachsen|hannover|braunschweig|osnabrück/i,               base: 0.45, cx: 138, cy: 128, path: "M 28 75 L 130 52 L 160 70 L 179 70 L 194 82 L 245 75 L 246 182 L 168 188 L 95 175 L 45 155 Z" },
  { id: "HB",  label: "HB",  name: "Bremen",              kw: /\bbremen\b/i,                                                  base: 0.50, cx: 120, cy: 127, path: "M 113 120 L 128 120 L 128 134 L 113 134 Z" },
  { id: "BB",  label: "BB",  name: "Brandenburg",         kw: /\bbrandenburg\b|potsdam/i,                                     base: 0.40, cx: 305, cy: 145, path: "M 246 75 L 375 72 L 375 218 L 290 222 L 250 208 L 246 182 Z" },
  { id: "BE",  label: "BE",  name: "Berlin",              kw: /\bberlin\b|bvg\b|senat\b/i,                                   base: 0.75, cx: 279, cy: 152, path: "M 270 142 L 288 142 L 288 162 L 270 162 Z" },
  { id: "NRW", label: "NRW", name: "Nordrhein-Westfalen", kw: /nordrhein|westfalen|\bnrw\b|köln|düsseldorf|dortmund/i,        base: 0.70, cx: 95,  cy: 212, path: "M 28 155 L 95 175 L 168 188 L 162 258 L 102 268 L 38 248 L 22 200 Z" },
  { id: "SA",  label: "ST",  name: "Sachsen-Anhalt",      kw: /sachsen.anhalt|magdeburg|halle\b/i,                            base: 0.38, cx: 248, cy: 218, path: "M 246 182 L 250 208 L 290 222 L 292 248 L 245 252 L 212 238 L 202 215 L 207 185 Z" },
  { id: "HE",  label: "HE",  name: "Hessen",              kw: /\bhessen\b|frankfurt|wiesbaden|darmstadt/i,                    base: 0.60, cx: 183, cy: 282, path: "M 162 258 L 202 252 L 215 265 L 220 298 L 195 312 L 160 308 L 140 280 Z" },
  { id: "TH",  label: "TH",  name: "Thüringen",           kw: /thüringen|erfurt|jena|weimar/i,                               base: 0.35, cx: 248, cy: 262, path: "M 212 238 L 245 252 L 292 248 L 290 280 L 250 288 L 212 282 L 205 262 Z" },
  { id: "SN",  label: "SN",  name: "Sachsen",             kw: /\bsachsen\b|dresden|leipzig|chemnitz/i,                       base: 0.45, cx: 330, cy: 262, path: "M 290 222 L 375 218 L 375 305 L 288 308 L 290 280 L 292 248 Z" },
  { id: "RP",  label: "RP",  name: "Rheinland-Pfalz",     kw: /rheinland|pfalz|mainz|koblenz|trier/i,                        base: 0.42, cx: 72,  cy: 290, path: "M 38 248 L 102 268 L 118 302 L 95 338 L 38 318 L 24 278 Z" },
  { id: "SAR", label: "SL",  name: "Saarland",            kw: /\bsaarland\b|saarbrücken/i,                                   base: 0.38, cx: 107, cy: 331, path: "M 95 322 L 118 320 L 116 340 L 95 340 Z" },
  { id: "BW",  label: "BW",  name: "Baden-Württemberg",   kw: /\bbaden\b|württemberg|stuttgart|freiburg|karlsruhe/i,         base: 0.55, cx: 152, cy: 352, path: "M 118 302 L 160 308 L 195 312 L 210 352 L 168 400 L 118 395 L 95 348 L 95 340 L 116 340 Z" },
  { id: "BY",  label: "BY",  name: "Bayern",              kw: /\bbayern\b|münchen|nürnberg|augsburg|regensburg/i,            base: 0.60, cx: 285, cy: 355, path: "M 212 282 L 250 288 L 290 280 L 288 308 L 375 305 L 372 418 L 270 428 L 168 405 L 168 400 L 210 352 L 210 315 L 200 302 Z" },
] as const;

function scoreColor(s: number) {
  if (s < 0.30) return "#0a1628";
  if (s < 0.45) return "#1e3a5f";
  if (s < 0.58) return "#1d4ed8";
  if (s < 0.70) return "#b45309";
  if (s < 0.82) return "#c2410c";
  return "#b91c1c";
}

function strokeColor(s: number) {
  return s >= 0.70 ? "#f97316" : "#1e293b";
}

export function GermanyMap({ feedItems }: { feedItems: FeedItem[] }) {
  const scored = useMemo(
    () =>
      [...STATES]
        .map((st) => {
          const hits = feedItems.filter((i) =>
            st.kw.test(i.title + " " + i.description)
          ).length;
          return { ...st, score: Math.min(st.base + hits * 0.065, 1) };
        })
        .sort((a, b) => b.score - a.score),
    [feedItems]
  );

  const top3 = scored.slice(0, 3);
  const small = new Set(["HH", "HB", "BE", "SAR"]);

  return (
    <div className="flex gap-2 h-full overflow-hidden">
      {/* Map */}
      <svg viewBox="0 0 380 438" className="h-full w-auto shrink-0" style={{ maxWidth: "200px" }}>
        <defs>
          <filter id="st-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {scored.map((st) => (
          <g key={st.id}>
            <path
              d={st.path}
              fill={scoreColor(st.score)}
              stroke={strokeColor(st.score)}
              strokeWidth={st.score >= 0.70 ? 1.5 : 0.7}
              style={st.score >= 0.70 ? { filter: "url(#st-glow)" } : undefined}
            />
            {!small.has(st.id) && (
              <text
                x={st.cx} y={st.cy}
                textAnchor="middle" dominantBaseline="middle"
                fill={st.score >= 0.55 ? "#f1f5f9" : "#64748b"}
                fontSize={st.id === "BY" || st.id === "NI" || st.id === "NRW" ? 9 : 7}
                fontFamily="monospace" fontWeight="700"
              >
                {st.label}
              </text>
            )}
            {st.score >= 0.68 && (
              <circle cx={st.cx} cy={st.cy - 10} r="3" fill="#ef4444">
                <animate attributeName="r" values="2;5;2" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        ))}
      </svg>

      {/* Sidebar */}
      <div className="flex flex-col justify-between shrink-0 min-w-0 flex-1">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
            🗺 KRITIS-Lage DE
          </div>
          <div className="flex flex-col gap-1">
            {[
              { l: "Kritisch", c: "#b91c1c" },
              { l: "Hoch",     c: "#c2410c" },
              { l: "Erhöht",   c: "#b45309" },
              { l: "Mittel",   c: "#1d4ed8" },
              { l: "Niedrig",  c: "#1e3a5f" },
            ].map((e) => (
              <div key={e.l} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2 rounded-sm shrink-0" style={{ background: e.c }} />
                <span className="text-[8px] text-slate-500">{e.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[8px] text-slate-600 mb-1">Top Bedrohung:</div>
          {top3.map((st, i) => (
            <div key={st.id} className="flex items-center gap-1 mb-1">
              <span className="text-[8px] text-slate-600 w-3">{i + 1}.</span>
              <span className="text-[8px] font-mono text-slate-300 w-6">{st.id}</span>
              <div className="flex-1 h-1.5 bg-slate-900 rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-700"
                  style={{ width: `${st.score * 100}%`, background: scoreColor(st.score) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
