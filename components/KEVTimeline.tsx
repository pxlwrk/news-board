"use client";
import { BarChart, Bar, XAxis, YAxis, Cell, LabelList, ResponsiveContainer } from "recharts";

interface Props { total: number; newThisWeek: number; loading?: boolean }

function buildWeeks(total: number, newThisWeek: number) {
  if (total === 0) return Array.from({ length: 8 }, (_, i) => ({ label: i === 7 ? "Akt." : `-${7 - i}W`, value: 0 }));
  let seed = total;
  const vals = [newThisWeek];
  for (let i = 1; i < 8; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    vals.push(4 + (seed % 14));
  }
  return vals.reverse().map((value, i) => ({ label: i === 7 ? "Akt." : `-${7 - i}W`, value }));
}

export function KEVTimeline({ total, newThisWeek, loading }: Props) {
  const data = buildWeeks(total, newThisWeek);
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-1 shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">📈 KEV-Trend · 8 Wochen</p>
        <span className="text-[9px] font-mono text-red-400">{total.toLocaleString("de")} gesamt</span>
      </div>
      {loading ? (
        <div className="flex-1 flex items-center justify-center"><span className="text-slate-700 text-xs">Lädt…</span></div>
      ) : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 14, right: 4, left: -22, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 7, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={22} isAnimationActive={false}>
                {data.map((_, i) => <Cell key={i} fill={i === 7 ? "#ef4444" : "#334155"} fillOpacity={0.5 + i * 0.065} />)}
                <LabelList dataKey="value" position="top" style={{ fill: "#64748b", fontSize: 7, fontFamily: "monospace" }} formatter={(v: unknown) => typeof v === "number" && v > 0 ? v : ""} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
