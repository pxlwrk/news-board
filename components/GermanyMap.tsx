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
    <div className="relative h-full w-full">
      {error ? (
        <div className="flex items-center justify-center h-full text-slate-700 text-xs">Kartendaten nicht verfügbar</div>
      ) : !geo ? (
        <div className="flex items-center justify-center h-full text-slate-700 text-xs animate-pulse">Karte lädt…</div>
      ) : (
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet" />
      )}

      {/* Overlay: title top-left, top-3 + legend bottom-left */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-1.5">
        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider drop-shadow">🗺 KRITIS-Lage</p>

        <div className="flex flex-col gap-1">
          {/* Top-3 threats */}
          {top3.map((s, i) => (
            <div key={s.name} className="flex items-center gap-1">
              <span className="text-slate-500 text-[8px] w-3 shrink-0">{i + 1}.</span>
              <span className="font-mono text-[9px] text-slate-300 w-6 shrink-0">{s.abbr}</span>
              <div className="w-12 h-1.5 bg-slate-900/80 rounded overflow-hidden">
                <div className="h-full rounded" style={{ width: `${s.score * 100}%`, background: colorScale(s.score) }} />
              </div>
            </div>
          ))}
          {/* Compact colour legend */}
          <div className="flex items-center gap-1 mt-0.5">
            {[
              { c: "#0f2d5c" }, { c: "#1d4ed8" }, { c: "#b45309" }, { c: "#c2410c" }, { c: "#b91c1c" },
            ].map((e, i) => (
              <span key={i} className="w-4 h-1.5 rounded-sm" style={{ background: e.c }} />
            ))}
            <span className="text-[7px] text-slate-600 ml-0.5">niedrig → kritisch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
