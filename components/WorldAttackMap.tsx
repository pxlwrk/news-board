"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";

// world-atlas countries-110m.json
// eslint-disable-next-line @typescript-eslint/no-require-imports
const worldTopo = require("world-atlas/countries-110m.json") as Topology;

const DE: [number, number] = [10.45, 51.17];

const SOURCES: { cc: string; pos: [number, number]; active: boolean }[] = [
  { cc: "CN", pos: [104.2,  35.9],  active: true  },
  { cc: "RU", pos: [55.0,   55.0],  active: true  },
  { cc: "US", pos: [-95.7,  37.1],  active: true  },
  { cc: "KR", pos: [127.8,  35.9],  active: false },
  { cc: "IN", pos: [78.96,  20.6],  active: false },
  { cc: "TR", pos: [35.24,  38.9],  active: true  },
  { cc: "UA", pos: [31.17,  48.4],  active: true  },
  { cc: "BR", pos: [-51.9, -14.2],  active: false },
  { cc: "NL", pos: [5.29,   52.1],  active: false },
];

const W = 460, H = 230;

interface Props {
  topCountry?: string;
  attacksPerHour?: number;
  loading?: boolean;
}

export function WorldAttackMap({ topCountry, attacksPerHour, loading }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = d3
      .geoNaturalEarth1()
      .scale(W / 6.3)
      .translate([W / 2, H / 2]);
    const path = d3.geoPath().projection(projection);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topo = worldTopo as any;
    const countries = feature(topo, topo.objects.countries);
    const land      = feature(topo, topo.objects.land);

    // Defs
    const defs = svg.append("defs");
    defs.append("filter").attr("id", "wam-glow")
      .call((f) => {
        f.append("feGaussianBlur").attr("stdDeviation", "2").attr("result", "b");
        f.append("feMerge").call((m) => {
          m.append("feMergeNode").attr("in", "b");
          m.append("feMergeNode").attr("in", "SourceGraphic");
        });
      });

    // CSS animation keyframes
    svg.append("defs").append("style").text(`
      .arc-active { animation: wam-flow 2.4s linear infinite; }
      .arc-top    { animation: wam-flow 1.6s linear infinite; }
      @keyframes wam-flow { to { stroke-dashoffset: -70; } }
    `);

    // Ocean
    svg.append("path")
      .datum({ type: "Sphere" } as d3.GeoPermissibleObjects)
      .attr("d", path)
      .attr("fill", "#060d1c")
      .attr("stroke", "#0f2040")
      .attr("stroke-width", 0.5);

    // Graticule
    svg.append("path")
      .datum(d3.geoGraticule()())
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#0a1a30")
      .attr("stroke-width", 0.3);

    // Land
    svg.append("path")
      .datum(land as d3.GeoPermissibleObjects)
      .attr("d", path)
      .attr("fill", "#0d1f38")
      .attr("stroke", "#1e3a5f")
      .attr("stroke-width", 0.4);

    // Countries (slightly lighter border)
    svg.selectAll(".ctry")
      .data((countries as d3.GeoPermissibleObjects & { features: d3.GeoPermissibleObjects[] }).features)
      .join("path")
      .attr("class", "ctry")
      .attr("d", path)
      .attr("fill", "transparent")
      .attr("stroke", "#122040")
      .attr("stroke-width", 0.3);

    // Attack arcs
    SOURCES.forEach((src, i) => {
      const isTop = src.cc === topCountry;
      const arcData: GeoJSON.Feature<GeoJSON.LineString> = {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: [src.pos, DE] },
      };
      svg.append("path")
        .datum(arcData as d3.GeoPermissibleObjects)
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", isTop ? "#ef4444" : src.active ? "#3b82f6" : "#1e3a5f")
        .attr("stroke-width", isTop ? 1.8 : src.active ? 0.9 : 0.5)
        .attr("stroke-dasharray", isTop ? "7 3" : "5 5")
        .attr("opacity", isTop ? 1 : src.active ? 0.6 : 0.25)
        .attr("class", isTop ? "arc-top" : src.active ? "arc-active" : "")
        .style("stroke-dashoffset", `${i * -8}`)
        .style("filter", isTop ? "url(#wam-glow)" : "none");
    });

    // Germany target
    const dePos = projection(DE)!;
    svg.append("circle").attr("cx", dePos[0]).attr("cy", dePos[1]).attr("r", 18).attr("fill", "#ef444412");
    const deRing = svg.append("circle").attr("cx", dePos[0]).attr("cy", dePos[1]).attr("r", 5)
      .attr("fill", "#ef4444").attr("stroke", "#fca5a5").attr("stroke-width", 1.2);
    const pulseDE = () =>
      deRing.transition().duration(900).attr("r", 8).attr("opacity", 0.2)
        .transition().duration(900).attr("r", 5).attr("opacity", 1)
        .on("end", pulseDE);
    pulseDE();
    svg.append("text").attr("x", dePos[0]).attr("y", dePos[1] + 14)
      .attr("text-anchor", "middle").attr("fill", "#fca5a5").attr("font-size", "7").attr("font-family", "monospace").attr("font-weight", "700").text("DE");

    // Source dots
    SOURCES.forEach((src) => {
      const pos = projection(src.pos)!;
      if (!pos) return;
      const isTop = src.cc === topCountry;
      if (isTop) {
        const ring = svg.append("circle").attr("cx", pos[0]).attr("cy", pos[1]).attr("r", 4)
          .attr("fill", "none").attr("stroke", "#ef4444").attr("stroke-width", 0.8).attr("opacity", 0.5);
        const pp = () =>
          ring.transition().duration(1200).attr("r", 10).attr("opacity", 0)
            .transition().duration(0).attr("r", 4).attr("opacity", 0.5)
            .on("end", pp);
        pp();
      }
      svg.append("circle").attr("cx", pos[0]).attr("cy", pos[1])
        .attr("r", isTop ? 4 : src.active ? 2.5 : 1.5)
        .attr("fill", isTop ? "#ef4444" : src.active ? "#f97316" : "#334155")
        .attr("stroke", isTop ? "#fca5a5" : "none").attr("stroke-width", 0.8);
      svg.append("text").attr("x", pos[0]).attr("y", pos[1] - 7)
        .attr("text-anchor", "middle").attr("fill", isTop ? "#fca5a5" : src.active ? "#64748b" : "#334155")
        .attr("font-size", "6").attr("font-family", "monospace").text(src.cc);
    });
  }, [topCountry]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-1 shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">🌐 Globale Angriffslage</p>
        {attacksPerHour != null && (
          <span className="text-[9px] font-mono text-orange-400">{attacksPerHour.toLocaleString("de")} /h</span>
        )}
      </div>
      {loading ? (
        <div className="flex-1 flex items-center justify-center"><span className="text-slate-700 text-xs">Lädt…</span></div>
      ) : (
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full flex-1" preserveAspectRatio="xMidYMid meet" />
      )}
    </div>
  );
}
