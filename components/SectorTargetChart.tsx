"use client";
import { useMemo } from "react";
import { FeedItem } from "@/lib/feeds";

const SECTORS = [
  { key: "verwaltung",  label: "Öffentl. Verwaltung", kw: /verwaltung|behörde|ministerium|bundesbehörde|kommune|amt\b/i,             color: "#60a5fa" },
  { key: "energie",     label: "Energie / KRITIS",    kw: /\benergie\b|energieversorger|strom.*netz|gasversorgung|kraftwerk|enbw|rwe/i, color: "#f59e0b" },
  { key: "gesundheit",  label: "Gesundheit",          kw: /krankenhaus|klinik|gesundheit|medizin|impfstoff|patientendaten/i,          color: "#34d399" },
  { key: "finanzen",    label: "Finanzen / Banking",  kw: /\bbank\b|finanz|börse|zahlungsverkehr|swift|fintech/i,                    color: "#a78bfa" },
  { key: "it_infra",    label: "IT-Infrastruktur",    kw: /rechenzentrum|cloud.*infrastruktur|telekommunikation|backbone|internet.*knoten/i, color: "#f472b6" },
  { key: "verkehr",     label: "Verkehr / Transport", kw: /\bverkehr\b|bahn\b|flughafen|logistik|hafen\b|autobahn/i,                color: "#fb923c" },
  { key: "verteidigung",label: "Verteidigung / Mil.", kw: /\bbundeswehr\b|verteidigung|nato|militär|rüstung/i,                       color: "#e11d48" },
  { key: "forschung",   label: "Forschung / Uni",     kw: /universität|hochschule|forschung|dfn|wissenschaft/i,                     color: "#22d3ee" },
] as const;

export function SectorTargetChart({ feedItems }: { feedItems: FeedItem[] }) {
  const counts = useMemo(() => {
    return SECTORS.map((s) => ({
      ...s,
      count: feedItems.filter((i) => s.kw.test(i.title + " " + i.description)).length,
    })).sort((a, b) => b.count - a.count);
  }, [feedItems]);

  const max = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className="flex flex-col h-full">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
        🏭 KRITIS-Sektoren · Betroffenheit
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        {counts.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 w-32 shrink-0 truncate">{s.label}</span>
            <div className="flex-1 h-3.5 bg-slate-900 rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm transition-all duration-700"
                style={{
                  width: `${(s.count / max) * 100}%`,
                  background: `linear-gradient(90deg, ${s.color}cc, ${s.color}55)`,
                  minWidth: s.count > 0 ? "4px" : "0",
                  boxShadow: s.count > 0 ? `0 0 6px ${s.color}40` : "none",
                }}
              />
            </div>
            <span
              className="text-[10px] tabular-nums w-5 text-right shrink-0 font-mono"
              style={{ color: s.count > 0 ? s.color : "#475569" }}
            >
              {s.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
