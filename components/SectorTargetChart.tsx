"use client";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Cell, LabelList, ResponsiveContainer } from "recharts";
import { FeedItem } from "@/lib/feeds";

const SECTORS = [
  { label: "Öffentl. Verwaltung", kw: /verwaltung|behörde|ministerium|bundesbehörde|kommune/i,        color: "#60a5fa" },
  { label: "Energie / KRITIS",    kw: /\benergie\b|energieversorger|strom.*netz|kraftwerk|enbw|rwe/i, color: "#f59e0b" },
  { label: "Gesundheit",          kw: /krankenhaus|klinik|gesundheit|medizin|patientendaten/i,        color: "#34d399" },
  { label: "Finanzen / Banking",  kw: /\bbank\b|finanz|börse|zahlungsverkehr|swift/i,                color: "#a78bfa" },
  { label: "IT-Infrastruktur",    kw: /rechenzentrum|cloud.*infra|telekommunikation|backbone/i,      color: "#f472b6" },
  { label: "Verkehr / Transport", kw: /\bverkehr\b|bahn\b|flughafen|logistik|hafen\b/i,             color: "#fb923c" },
  { label: "Verteidigung / Mil.", kw: /\bbundeswehr\b|verteidigung|nato|militär/i,                  color: "#e11d48" },
  { label: "Forschung / Uni",     kw: /universität|hochschule|forschung|dfn|wissenschaft/i,         color: "#22d3ee" },
] as const;

export function SectorTargetChart({ feedItems }: { feedItems: FeedItem[] }) {
  const data = useMemo(
    () =>
      SECTORS.map((s) => ({
        label: s.label,
        value: feedItems.filter((i) => s.kw.test(i.title + " " + i.description)).length,
        color: s.color,
      })).sort((a, b) => b.value - a.value),
    [feedItems]
  );
  return (
    <div className="flex flex-col h-full">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1 shrink-0">🏭 KRITIS-Sektoren · Betroffenheit</p>
      <div className="flex-1 min-h-0 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
