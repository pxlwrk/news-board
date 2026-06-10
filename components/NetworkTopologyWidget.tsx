"use client";
import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { FeedItem } from "@/lib/feeds";

const LAYERS = [
  { id: "internet",  label: "INTERNET",  sub: "Bedrohungszone",       kw: /ddos|botnet|port.scan|c2\b|c&c/i,                               color: "#ef4444" },
  { id: "perimeter", label: "PERIMETER", sub: "Firewall · WAF · IDS",  kw: /firewall|perimeter|intrusion|ddos/i,                            color: "#f97316" },
  { id: "dmz",       label: "DMZ",       sub: "Web · Mail · VPN",      kw: /phishing|email.*attack|web.*vuln|vpn/i,                         color: "#eab308" },
  { id: "internal",  label: "INTRANET",  sub: "AD · ERP · Fileserver", kw: /active.directory|lateral|credential|privilege|ransomware/i,     color: "#a855f7" },
  { id: "endpoints", label: "ENDPOINTS", sub: "2.500 Arbeitsplätze",   kw: /endpoint|workstation|malware|trojan|ransomware/i,               color: "#3b82f6" },
] as const;

const W = 230, H = 188;
const LH = 28, GAP = 11;

export function NetworkTopologyWidget({ feedItems }: { feedItems: FeedItem[] }) {
  const svgRef = useRef<SVGSVGElement>(null);

  const hits = useMemo(
    () => LAYERS.map((l) => feedItems.filter((i) => l.kw.test(i.title + " " + i.description)).length),
    [feedItems]
  );

  const maxHits = Math.max(...hits, 1);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    defs.append("style").text(`
      .flow-dot { animation: nw-flow 1.4s ease-in-out infinite; }
      @keyframes nw-flow { 0%,100% { opacity: 0.9; } 50% { opacity: 0.2; } }
    `);

    LAYERS.forEach((layer, i) => {
      const y = i * (LH + GAP);
      const n = hits[i];
      const isHot = n > 0;
      const intensity = n / maxHits;
      const g = svg.append("g").attr("transform", `translate(0,${y})`);

      // Glow behind box
      if (isHot) {
        g.append("rect").attr("x", 2).attr("y", 0).attr("width", W - 4).attr("height", LH)
          .attr("rx", 4).attr("fill", layer.color).attr("opacity", 0.06)
          .style("filter", "blur(4px)");
      }

      // Box border + background
      g.append("rect").attr("x", 6).attr("y", 0).attr("width", W - 12).attr("height", LH)
        .attr("rx", 3)
        .attr("fill", isHot ? d3.color(layer.color)!.copy({ opacity: 0.08 }).formatRgb() : "#0a1628")
        .attr("stroke", isHot ? layer.color : "#1e293b")
        .attr("stroke-width", isHot ? 1.2 : 0.6);

      // Intensity fill bar
      if (isHot) {
        g.append("rect").attr("x", 6).attr("y", 0).attr("width", Math.max((W - 12) * intensity, 8)).attr("height", LH)
          .attr("rx", 3).attr("fill", layer.color).attr("opacity", 0.1);
      }

      // Label
      g.append("text").attr("x", 18).attr("y", 11)
        .attr("fill", isHot ? layer.color : "#475569").attr("font-size", 9).attr("font-family", "monospace").attr("font-weight", "700")
        .text(layer.label);

      // Sub-label
      g.append("text").attr("x", 18).attr("y", 22)
        .attr("fill", "#334155").attr("font-size", 6.5).attr("font-family", "sans-serif")
        .text(layer.sub);

      // Hit badge
      if (isHot) {
        g.append("circle").attr("cx", W - 18).attr("cy", LH / 2).attr("r", 9).attr("fill", layer.color).attr("opacity", 0.9);
        g.append("text").attr("x", W - 18).attr("y", LH / 2)
          .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
          .attr("fill", "white").attr("font-size", 7.5).attr("font-family", "monospace").attr("font-weight", "700")
          .text(n);
      }

      // Connecting line to next layer
      if (i < LAYERS.length - 1) {
        const threatened = isHot || hits[i + 1] > 0;
        svg.append("line")
          .attr("x1", W / 2).attr("y1", y + LH)
          .attr("x2", W / 2).attr("y2", y + LH + GAP)
          .attr("stroke", threatened ? layer.color : "#1e293b")
          .attr("stroke-width", threatened ? 1.5 : 0.7)
          .attr("stroke-dasharray", threatened ? "3,2" : null)
          .attr("opacity", threatened ? 0.7 : 0.4);

        // Animated dot on active connections
        if (threatened) {
          const dot = svg.append("circle").attr("r", 2.5).attr("fill", layer.color).attr("class", "flow-dot");
          const animate = () =>
            dot.attr("cx", W / 2).attr("cy", y + LH)
              .transition().duration(600 + i * 80).ease(d3.easeLinear)
              .attr("cy", y + LH + GAP)
              .on("end", animate);
          animate();
        }
      }
    });
  }, [hits, maxHits]);

  return (
    <div className="flex flex-col h-full">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1 shrink-0">🔗 Netzwerktopologie · Bedrohungslage</p>
      <div className="flex-1 flex items-center justify-center min-h-0">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet" />
      </div>
    </div>
  );
}
