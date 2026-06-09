"use client";
import { FeedItem } from "@/lib/feeds";

interface ThreatLevelProps {
  securityItems: FeedItem[];
}

const THREAT_KEYWORDS = {
  critical: ["kritisch", "critical", "0-day", "zero-day", "emergency", "notfall", "exploit", "ransomware", "breach", "kompromittiert"],
  high: ["schwerwiegend", "high", "gefährlich", "angriff", "attack", "vulnerability", "cve-", "patch", "dringend", "urgent"],
  medium: ["medium", "warning", "warnung", "sicherheitslücke", "update", "mittel"],
};

function assessThreatLevel(items: FeedItem[]): { level: "KRITISCH" | "HOCH" | "MITTEL" | "NIEDRIG"; color: string; bg: string; pulse: boolean } {
  const text = items
    .slice(0, 5)
    .map((i) => (i.title + " " + i.description).toLowerCase())
    .join(" ");

  if (THREAT_KEYWORDS.critical.some((k) => text.includes(k))) {
    return { level: "KRITISCH", color: "text-red-400", bg: "bg-red-900/30 border-red-700/50", pulse: true };
  }
  if (THREAT_KEYWORDS.high.some((k) => text.includes(k))) {
    return { level: "HOCH", color: "text-orange-400", bg: "bg-orange-900/20 border-orange-700/40", pulse: false };
  }
  if (THREAT_KEYWORDS.medium.some((k) => text.includes(k))) {
    return { level: "MITTEL", color: "text-yellow-400", bg: "bg-yellow-900/20 border-yellow-700/40", pulse: false };
  }
  return { level: "NIEDRIG", color: "text-emerald-400", bg: "bg-emerald-900/20 border-emerald-700/40", pulse: false };
}

export function ThreatLevel({ securityItems }: ThreatLevelProps) {
  const threat = assessThreatLevel(securityItems);

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${threat.bg}`}>
      <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold whitespace-nowrap">
        Bedrohungslage
      </div>
      <div className="flex items-center gap-2">
        {threat.pulse && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        )}
        <span className={`text-sm font-bold tracking-widest ${threat.color}`}>
          {threat.level}
        </span>
      </div>
    </div>
  );
}
