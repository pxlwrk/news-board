"use client";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Cell, LabelList, ResponsiveContainer } from "recharts";
import { FeedItem } from "@/lib/feeds";

const VECTORS = [
  { label: "Ransomware",        kw: /ransomware/i,                      color: "#ef4444" },
  { label: "Phishing / BEC",    kw: /phishing|spear.phish/i,            color: "#f97316" },
  { label: "Schwachstellen",    kw: /cve-|patch|vulnerability|exploit/i, color: "#eab308" },
  { label: "DDoS",              kw: /\bddos\b|denial.of.service/i,      color: "#3b82f6" },
  { label: "Supply Chain",      kw: /supply.chain|lieferkette/i,        color: "#a855f7" },
  { label: "APT / Spionage",    kw: /\bapt\b|spionage|espionage/i,      color: "#ec4899" },
  { label: "Zero-Day",          kw: /zero.day|0-day|0day/i,             color: "#fb923c" },
  { label: "Social Engineering",kw: /social.engineering|manipulation/i, color: "#22d3ee" },
] as const;

export function AttackVectorChart({ feedItems }: { feedItems: FeedItem[] }) {
  const data = useMemo(
    () =>
      VECTORS.map((v) => ({
        label: v.label,
        value: feedItems.filter((i) => v.kw.test(i.title + " " + i.description)).length,
        color: v.color,
      })).sort((a, b) => b.value - a.value),
    [feedItems]
  );
  return (
    <div className="flex flex-col h-full">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1 shrink-0">⚔ Angriffsvektoren</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 2, right: 26, left: 4, bottom: 2 }}>
            <XAxis type="number" hide domain={[0, "auto"]} />
            <YAxis type="category" dataKey="label" width={114} tick={{ fill: "#64748b", fontSize: 9, fontFamily: "sans-serif" }} axisLine={false} tickLine={false} />
            <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={10} isAnimationActive={false}>
              {data.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={d.value > 0 ? 0.85 : 0.18} />)}
              <LabelList dataKey="value" position="right" style={{ fill: "#475569", fontSize: 8.5, fontFamily: "monospace" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
