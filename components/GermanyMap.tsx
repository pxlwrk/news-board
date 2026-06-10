"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { FeedItem } from "@/lib/feeds";

const GEO_URL =
  "https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/main/2_bundeslaender/4_niedrig.geo.json";

const STATE_META: Record<string, { kw: RegExp; base: number }> = {
  "Baden-Württemberg":      { kw: /\bbaden\b|württemberg|stuttgart|karlsruhe|freiburg/i,  base: 0.55 },
  "Bayern":                 { kw: /\bbayern\b|münchen|nürnberg|augsburg/i,                base: 0.60 },
  "Berlin":                 { kw: /\bberlin\b|bvg\b|berliner senat/i,                    base: 0.75 },
  "Brandenburg":            { kw: /\bbrandenburg\b|potsdam/i,                             base: 0.40 },
  "Bremen":                 { kw: /\bbremen\b/i,                                          base: 0.50 },
  "Hamburg":                { kw: /\bhamburg\b|hansestadt/i,                              base: 0.55 },
  "Hessen":                 { kw: /\bhessen\b|frankfurt|wiesbaden/i,                      base: 0.60 },
  "Mecklenburg-Vorpommern": { kw: /mecklenburg|vorpommern|rostock|schwerin/i,             base: 0.30 },
  "Niedersachsen":          { kw: /niedersachsen|hannover|braunschweig/i,                 base: 0.45 },
  "Nordrhein-Westfalen":    { kw: /nordrhein|westfalen|\bnrw\b|köln|düsseldorf/i,         base: 0.70 },
  "Rheinland-Pfalz":        { kw: /rheinland|pfalz|mainz|koblenz/i,                      base: 0.42 },
  "Saarland":               { kw: /\bsaarland\b|saarbrücken/i,                            base: 0.38 },
  "Sachsen":                { kw: /\bsachsen\b|dresden|leipzig/i,                         base: 0.45 },
  "Sachsen-Anhalt":         { kw: /sachsen.anhalt|magdeburg|halle\b/i,                    base: 0.38 },
  "Schleswig-Holstein":     { kw: /schleswig|holstein|kiel/i,                             base: 0.35 },
  "Thüringen":              { kw: /thüringen|erfurt|jena/i,                               base: 0.35 },
};

const colorScale = d3
  .scaleSequential(d3.interpolateRgbBasis(["#0a1628", "#0f2d5c", "#1d4ed8", "#b45309", "#c2410c", "#b91c1c"]))
  .domain([0, 1]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeoFeature = any;

const W = 220, H = 280;

export function GermanyMap({ feedItems }: { feedItems: FeedItem[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geo, setGeo] = useState<{ features: GeoFeature[] } | null>(null);
  const [error, setError] = useState(false);

  const scores = useMemo(() => {
    const r: Record<string, number> = {};
    for (const [name, meta] of Object.entries(STATE_META)) {
      const hits = feedItems.filter((i) => meta.kw.test(i.title + " " + i.description)).length;
      r[name] = Math.min(meta.base + hits * 0.07, 1);
    }
    return r;
  }, [feedItems]);

  useEffect(() => {
    d3.json(GEO_URL)
      .then((data) => setGeo(data as { features: GeoFeature[] }))
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (!geo || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = d3
      .geoMercator()
      .center([10.45, 51.15])
      .scale(1540)
      .translate([W / 2, H / 2]);
    const path = d3.geoPath().projection(projection);

    const defs = svg.append("defs");
    defs.append("filter").attr("id", "map-glow")
      .call((f) => {
        f.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
        f.append("feMerge").call((m) => {
          m.append("feMergeNode").attr("in", "blur");
          m.append("feMergeNode").attr("in", "SourceGraphic");
        });
      });

    const g = svg.append("g");

    g.selectAll("path")
      .data(geo.features)
      .join("path")
      .attr("d", path)
      .attr("fill", (d: GeoFeature) => {
        const score = scores[d.properties.name] ?? 0.3;
        return colorScale(score);
      })
      .attr("stroke", (d: GeoFeature) => {
        const score = scores[d.properties.name] ?? 0.3;
        return score >= 0.62 ? "#f97316" : "#1e293b";
      })
      .attr("stroke-width", (d: GeoFeature) => {
        const score = scores[d.properties.name] ?? 0.3;
        return score >= 0.62 ? 1.2 : 0.6;
      })
      .style("filter", (d: GeoFeature) => {
        const score = scores[d.properties.name] ?? 0.3;
        return score >= 0.65 ? "url(#map-glow)" : null;
      });

    // Labels for states (skip tiny city-states)
    const skip = new Set(["Bremen", "Hamburg", "Berlin"]);
    g.selectAll("text")
      .data(geo.features.filter((f: GeoFeature) => !skip.has(f.properties.name)))
      .join("text")
      .attr("transform", (d: GeoFeature) => {
        const c = path.centroid(d);
        return `translate(${c[0]},${c[1]})`;
      })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", (d: GeoFeature) => {
        const score = scores[d.properties.name] ?? 0.3;
        return score >= 0.55 ? "#f1f5f9" : "#94a3b8";
      })
      .attr("font-size", "7.5")
      .attr("font-family", "monospace")
      .attr("font-weight", "600")
      .attr("pointer-events", "none")
      .text((d: GeoFeature) => {
        const id: string = d.properties.id ?? "";
        return id.replace("DE-", "");
      });

    // Pulse circles on high-threat states
    geo.features
      .filter((f: GeoFeature) => (scores[f.properties.name] ?? 0) >= 0.65)
      .forEach((f: GeoFeature) => {
        const c = path.centroid(f);
        if (!c[0]) return;
        const circle = g
          .append("circle")
          .attr("cx", c[0])
          .attr("cy", c[1] - 10)
          .attr("r", 2.5)
          .attr("fill", "#ef4444")
          .attr("opacity", 0.9);
        const pulse = () =>
          circle
            .transition().duration(1000).attr("r", 5.5).attr("opacity", 0.1)
            .transition().duration(1000).attr("r", 2.5).attr("opacity", 0.9)
            .on("end", pulse);
        pulse();
      });
  }, [geo, scores]);

  // Sorted top 3 states by threat
  const top3 = useMemo(
    () =>
      Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, score]) => ({ name, score, abbr: name.slice(0, 2).toUpperCase() })),
    [scores]
  );

  return (
    <div className="flex gap-2 h-full overflow-hidden">
      {error ? (
        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs">Kartendaten nicht verfügbar</div>
      ) : !geo ? (
        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs animate-pulse">Karte lädt…</div>
      ) : (
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="h-full w-auto shrink-0" />
      )}

      {/* Sidebar */}
      <div className="flex flex-col justify-between text-[8px] shrink-0 py-1 min-w-0">
        <div>
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2">🗺 KRITIS-Lage</p>
          <div className="flex flex-col gap-1">
            {[
              { l: "Kritisch", c: "#b91c1c" },
              { l: "Hoch",     c: "#c2410c" },
              { l: "Erhöht",   c: "#b45309" },
              { l: "Mittel",   c: "#1d4ed8" },
              { l: "Niedrig",  c: "#0f2d5c" },
            ].map((e) => (
              <div key={e.l} className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-sm shrink-0" style={{ background: e.c }} />
                <span className="text-slate-500">{e.l}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-slate-600 mb-1.5">Top Bedrohung:</p>
          {top3.map((s, i) => (
            <div key={s.name} className="flex items-center gap-1 mb-1">
              <span className="text-slate-600 w-3">{i + 1}.</span>
              <span className="font-mono text-slate-300 w-8 truncate">{s.abbr}</span>
              <div className="w-14 h-1.5 bg-slate-900 rounded overflow-hidden">
                <div className="h-full rounded" style={{ width: `${s.score * 100}%`, background: colorScale(s.score) }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
