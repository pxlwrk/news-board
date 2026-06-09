"use client";

interface KPICardProps {
  label: string;
  value: number | string;
  sublabel?: string;
  color: "red" | "orange" | "blue" | "amber" | "slate" | "emerald";
  highlight?: boolean;
}

const COLORS = {
  red:     { val: "text-red-400",     bg: "bg-red-950/40",     border: "border-red-800/50"     },
  orange:  { val: "text-orange-400",  bg: "bg-orange-950/30",  border: "border-orange-800/40"  },
  blue:    { val: "text-blue-400",    bg: "bg-blue-950/30",    border: "border-blue-800/40"    },
  amber:   { val: "text-amber-400",   bg: "bg-amber-950/30",   border: "border-amber-800/40"   },
  slate:   { val: "text-slate-300",   bg: "bg-slate-900/40",   border: "border-slate-700/50"   },
  emerald: { val: "text-emerald-400", bg: "bg-emerald-950/30", border: "border-emerald-800/40" },
};

export function KPICard({ label, value, sublabel, color, highlight }: KPICardProps) {
  const c = COLORS[color];
  return (
    <div className={`flex flex-col justify-between px-4 py-3 rounded-lg border ${c.bg} ${c.border} ${highlight ? "ring-1 ring-red-600/40" : ""}`}>
      <div className={`text-[10px] font-semibold uppercase tracking-widest text-slate-500 leading-none mb-1.5`}>
        {label}
      </div>
      <div className={`text-3xl font-bold tabular-nums leading-none ${c.val}`}>
        {value}
      </div>
      {sublabel && (
        <div className="text-[10px] text-slate-600 mt-1 leading-none">{sublabel}</div>
      )}
    </div>
  );
}
