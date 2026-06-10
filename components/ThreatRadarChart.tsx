"use client";
import { useMemo } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { FeedItem } from "@/lib/feeds";

const AXES = [
  { label: "Ransomware",  kw: /ransomware/i },
  { label: "Phishing",    kw: /phishing|bec\b/i },
  { label: "APT",         kw: /\bapt\b|spionage/i },
  { label: "Supply Chain",kw: /supply.chain|lieferkette/i },
  { label: "KRITIS",      kw: /\bkritis\b|kritische.infra/i },
  { label: "NIS2/DSGVO",  kw: /nis2|dsgvo|gdpr/i },
] as const;

export function ThreatRadarChart({ feedItems }: { feedItems: FeedItem[] }) {
  const data = useMemo(
    () =>
      AXES.map((a) => ({
        label: a.label,
        score: Math.min(
          feedItems.filter((i) => a.kw.test(i.title + " " + i.description)).length / 6,
          1
        ),
      })),
    [feedItems]
  );
  return (
    <div className="flex flex-col h-full">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1 shrink-0">🕷 Bedrohungsradar</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
            <PolarGrid stroke="#1e293b" strokeWidth={0.8} />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fill: "#475569", fontSize: 8.5, fontFamily: "sans-serif" }}
              tickLine={false}
            />
            <Radar
              dataKey="score"
              fill="#3b82f6" fillOpacity={0.15}
              stroke="#3b82f6" strokeWidth={1.5}
              isAnimationActive={false}
              dot={{ fill: "#3b82f6", r: 2.5, strokeWidth: 0 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
