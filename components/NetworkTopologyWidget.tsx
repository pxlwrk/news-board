"use client";
import { useMemo } from "react";
import { FeedItem } from "@/lib/feeds";

const LAYERS = [
  { id: "internet",  label: "INTERNET",      sub: "Bedrohungszone",        kw: /ddos|botnet|external|port.scan|c2\b|c&c/i,                              color: "#ef4444", y: 8  },
  { id: "perimeter", label: "PERIMETER",     sub: "Firewall · WAF · IDS",  kw: /firewall|perimeter|intrusion|boundary|ddos/i,                          color: "#f97316", y: 48 },
  { id: "dmz",       label: "DMZ",           sub: "Web · Mail · VPN",      kw: /phishing|email.*attack|web.*vuln|vpn.*exploit|smtp/i,                  color: "#eab308", y: 88 },
  { id: "internal",  label: "INTRANET",      sub: "AD · ERP · Fileserver", kw: /active.directory|lateral.*move|credential|privilege|ransomware|pass.the/i, color: "#a855f7", y: 128 },
  { id: "endpoints", label: "ENDPUNKTE",     sub: "2.500 Arbeitsplätze",   kw: /endpoint|workstation|malware|trojan|ransomware|user.*attack/i,          color: "#3b82f6", y: 168 },
] as const;

const W = 210, LAYER_H = 28;

export function NetworkTopologyWidget({ feedItems }: { feedItems: FeedItem[] }) {
  const scored = useMemo(
    () =>
      LAYERS.map((l) => ({
        ...l,
        hits: feedItems.filter((i) => l.kw.test(i.title + " " + i.description)).length,
      })),
    [feedItems]
  );

  const maxHits = Math.max(...scored.map((l) => l.hits), 1);

  return (
    <div className="flex flex-col h-full">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
        🔗 Netzwerktopologie · Bedrohungslage
      </div>
      <div className="flex-1 flex items-start gap-2 min-h-0 overflow-hidden">
        <svg viewBox="0 0 220 208" className="h-full w-auto shrink-0" style={{ maxWidth: "175px" }}>
          <defs>
            <filter id="nt-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Connector lines between layers */}
          {scored.slice(0, -1).map((l, i) => {
            const nextL = scored[i + 1];
            const threatened = l.hits > 0 || nextL.hits > 0;
            return (
              <g key={`conn-${i}`}>
                <line
                  x1={W / 2} y1={l.y + LAYER_H}
                  x2={W / 2} y2={nextL.y}
                  stroke={threatened ? l.color : "#1e293b"}
                  strokeWidth={threatened ? 1.5 : 0.8}
                  strokeDasharray={threatened ? "4 3" : undefined}
                  opacity={threatened ? 0.7 : 0.4}
                />
                {/* Animated flow dot when threatened */}
                {threatened && (
                  <circle r="2.5" fill={l.color} opacity="0.9">
                    <animateMotion
                      dur={`${1.5 + i * 0.3}s`}
                      repeatCount="indefinite"
                      path={`M ${W / 2} ${l.y + LAYER_H} L ${W / 2} ${nextL.y}`}
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Layer boxes */}
          {scored.map((l) => {
            const intensity = l.hits / maxHits;
            const isHot = l.hits > 0;
            return (
              <g key={l.id}>
                {/* Glow behind box when hot */}
                {isHot && (
                  <rect
                    x={4} y={l.y} width={W - 8} height={LAYER_H}
                    rx="4" fill={l.color} opacity="0.08"
                    style={{ filter: "url(#nt-glow)" }}
                  />
                )}
                {/* Box */}
                <rect
                  x={8} y={l.y} width={W - 16} height={LAYER_H}
                  rx="3"
                  fill={isHot ? `${l.color}18` : "#0f172a"}
                  stroke={isHot ? l.color : "#1e293b"}
                  strokeWidth={isHot ? 1.2 : 0.6}
                />
                {/* Fill bar showing intensity */}
                {isHot && (
                  <rect
                    x={8} y={l.y} width={(W - 16) * intensity} height={LAYER_H}
                    rx="3" fill={l.color} opacity="0.12"
                  />
                )}
                {/* Label */}
                <text
                  x={18} y={l.y + 11}
                  fill={isHot ? l.color : "#475569"}
                  fontSize="8.5" fontFamily="monospace" fontWeight="700"
                >
                  {l.label}
                </text>
                {/* Sub-label */}
                <text
                  x={18} y={l.y + 22}
                  fill="#334155" fontSize="6.5" fontFamily="sans-serif"
                >
                  {l.sub}
                </text>
                {/* Hit count badge */}
                {l.hits > 0 && (
                  <g>
                    <circle cx={W - 16} cy={l.y + LAYER_H / 2} r="8" fill={l.color} opacity="0.9" />
                    <text
                      x={W - 16} y={l.y + LAYER_H / 2}
                      textAnchor="middle" dominantBaseline="middle"
                      fill="white" fontSize="7.5" fontFamily="monospace" fontWeight="700"
                    >
                      {l.hits}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-col gap-1 text-[7.5px] pt-1">
          <div className="text-slate-600 mb-0.5">Bedrohungsstufen:</div>
          {scored.map((l) => (
            <div key={l.id} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ background: l.color }} />
              <span style={{ color: l.hits > 0 ? l.color : "#475569" }}>{l.label}</span>
              {l.hits > 0 && (
                <span className="font-mono font-bold ml-auto" style={{ color: l.color }}>{l.hits}</span>
              )}
            </div>
          ))}
          <div className="text-slate-700 mt-2 text-[7px] leading-tight">
            Basierend auf<br />Feed-Analyse
          </div>
        </div>
      </div>
    </div>
  );
}
