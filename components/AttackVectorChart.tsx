"use client";
import { useMemo } from "react";
import { FeedItem } from "@/lib/feeds";

const VECTORS = [
  { key: "ransomware",       label: "Ransomware",         kw: /ransomware/i,                              color: "#ef4444" },
  { key: "phishing",         label: "Phishing / BEC",     kw: /phishing|spear.phish|vishing/i,            color: "#f97316" },
  { key: "vulnerability",    label: "Schwachstellen",     kw: /vulnerabilit|schwachstelle|cve-\d{4}/i,    color: "#f59e0b" },
  { key: "ddos",             label: "DDoS",               kw: /\bddos\b|denial.of.service/i,             color: "#8b5cf6" },
  { key: "supply_chain",     label: "Supply Chain",       kw: /supply.chain|lieferkette|third.party/i,   color: "#3b82f6" },
  { key: "apt",              label: "APT / Spionage",     kw: /\bapt\b|advanced.persistent|spionage|state.sponsor/i, color: "#ec4899" },
  { key: "zero_day",         label: "Zero-Day",           kw: /zero.?day|0.day/i,                        color: "#ef4444" },
  { key: "social_eng",       label: "Social Engineering", kw: /social.engineer|deepfake|imperson/i,      color: "#14b8a6" },
] as const;

export function AttackVectorChart({ feedItems }: { feedItems: FeedItem[] }) {
  const counts = useMemo(() => {
    return VECTORS.map((v) => ({
      ...v,
      count: feedItems.filter((i) => v.kw.test(i.title + " " + i.description)).length,
    })).sort((a, b) => b.count - a.count);
  }, [feedItems]);

  const max = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className="flex flex-col h-full">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
        ⚡ Angriffsvektoren · Meldungsfrequenz
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        {counts.map((v) => (
          <div key={v.key} className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 w-28 shrink-0 truncate">{v.label}</span>
            <div className="flex-1 h-3.5 bg-slate-900 rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm transition-all duration-700"
                style={{
                  width: `${(v.count / max) * 100}%`,
                  background: `linear-gradient(90deg, ${v.color}cc, ${v.color}66)`,
                  minWidth: v.count > 0 ? "4px" : "0",
                  boxShadow: v.count > 0 ? `0 0 6px ${v.color}40` : "none",
                }}
              />
            </div>
            <span
              className="text-[10px] tabular-nums w-5 text-right shrink-0 font-mono"
              style={{ color: v.count > 0 ? v.color : "#475569" }}
            >
              {v.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
