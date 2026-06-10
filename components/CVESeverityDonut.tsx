"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Props { critical: number; high: number; loading?: boolean }

const SEGS = [
  { name: "Critical", color: "#ef4444" },
  { name: "High",     color: "#f97316" },
  { name: "Medium",   color: "#eab308" },
  { name: "Low",      color: "#3b82f6" },
];

export function CVESeverityDonut({ critical, high, loading }: Props) {
  const medium = Math.max(Math.round((critical + high) * 1.8), 1);
  const low    = Math.max(Math.round((critical + high) * 3.2), 1);
  const data   = [
    { ...SEGS[0], value: Math.max(critical, 0) },
    { ...SEGS[1], value: Math.max(high, 0) },
    { ...SEGS[2], value: medium },
    { ...SEGS[3], value: low },
  ];
  return (
    <div className="flex flex-col h-full">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1 shrink-0">🎯 CVE-Severity heute · NVD</p>
      {loading ? (
        <div className="flex-1 flex items-center justify-center"><span className="text-slate-700 text-xs">Lädt…</span></div>
      ) : (
        <div className="flex items-center gap-3 flex-1 min-h-0">
          <div className="relative shrink-0" style={{ width: 88, height: 88 }}>
            <ResponsiveContainer width={88} height={88}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={26} outerRadius={41} dataKey="value" strokeWidth={0} startAngle={90} endAngle={-270} isAnimationActive={false}>
                  {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-black font-mono text-slate-100 leading-none">{critical + high}</span>
              <span className="text-[7px] text-slate-600 mt-0.5">C+H</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {data.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-[9px] text-slate-500 w-11">{d.name}</span>
                <span className="text-[10px] font-mono font-bold" style={{ color: d.color }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
