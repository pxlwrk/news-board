"use client";
import { SicherheitstachoData } from "@/app/api/kpis/route";

interface Props {
  data: SicherheitstachoData | null;
  loading?: boolean;
}

const FLAG: Record<string, string> = {
  CN: "🇨🇳", RU: "🇷🇺", US: "🇺🇸", DE: "🇩🇪", IN: "🇮🇳",
  BR: "🇧🇷", KR: "🇰🇷", TR: "🇹🇷", UA: "🇺🇦", NL: "🇳🇱",
  FR: "🇫🇷", GB: "🇬🇧", IT: "🇮🇹", PL: "🇵🇱", VN: "🇻🇳",
};

// Visual attack pulse ring
function PulseRing({ value }: { value: number }) {
  const intensity = Math.min(value / 500, 1);
  const color = intensity > 0.7 ? "#ef4444" : intensity > 0.3 ? "#f97316" : "#eab308";
  const rings = [28, 22, 16];

  return (
    <svg viewBox="0 0 60 60" width={60} height={60} className="shrink-0">
      {rings.map((r, i) => (
        <circle
          key={i}
          cx="30" cy="30" r={r}
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity={(1 - i * 0.25) * 0.4}
          style={{
            animation: `pulse-ring ${1.5 + i * 0.5}s ease-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
      <circle cx="30" cy="30" r="8" fill={color + "30"} stroke={color} strokeWidth="1.5" />
      <text x="30" y="34" textAnchor="middle" fill={color} fontSize="7" fontWeight="700" fontFamily="monospace">
        DE
      </text>
      <style>{`
        @keyframes pulse-ring {
          0% { r: ${rings[0]}; opacity: 0.4; }
          100% { r: ${rings[0] + 10}; opacity: 0; }
        }
      `}</style>
    </svg>
  );
}

export function HoneypotWidget({ data, loading }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
        🍯 Sicherheitstacho · Honeypot
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-slate-700 text-xs">Lädt…</span>
        </div>
      ) : !data ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-slate-700 text-xs">Keine Daten</span>
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-1">
          <PulseRing value={data.attacksLastHour} />

          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-orange-400 leading-none">
                {data.attacksLastHour.toLocaleString("de")}
              </span>
              <span className="text-[9px] text-slate-600">Angriffe/h</span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div>
                <span className="text-[8px] text-slate-600">Top Port</span>
                <div className="text-[11px] font-mono font-bold text-slate-200">{data.topPort}</div>
              </div>
              <div>
                <span className="text-[8px] text-slate-600">Protokoll</span>
                <div className="text-[11px] font-mono font-bold text-slate-200">{data.topProtocol}</div>
              </div>
              <div className="col-span-2">
                <span className="text-[8px] text-slate-600">Hauptquelle</span>
                <div className="text-[11px] font-mono font-bold text-slate-200">
                  {FLAG[data.topSourceCountry] ?? ""} {data.topSourceCountry}
                </div>
              </div>
            </div>

            <div className="text-[7px] text-slate-700">Deutsche Telekom CERT</div>
          </div>
        </div>
      )}
    </div>
  );
}
