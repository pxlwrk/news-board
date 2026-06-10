"use client";
import { GHAdvisory } from "@/app/api/kpis/route";

interface Props {
  advisories: GHAdvisory[];
  criticalCount: number;
  highCount: number;
  loading?: boolean;
}

const SEV_COLOR: Record<string, string> = {
  critical: "#ef4444",
  high:     "#f97316",
  medium:   "#eab308",
  low:      "#3b82f6",
};

const ECOSYSTEM_ABBR: Record<string, string> = {
  npm: "npm", pip: "PyPI", maven: "Maven", composer: "PHP",
  rubygems: "Ruby", go: "Go", nuget: ".NET", cargo: "Rust",
  "github actions": "GHA",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function GitHubAdvisoryWidget({ advisories, criticalCount, highCount, loading }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          🔓 GitHub Advisory · OSS
        </span>
        <div className="flex gap-2">
          <span className="text-[9px] font-mono" style={{ color: SEV_COLOR.critical }}>
            C:{criticalCount}
          </span>
          <span className="text-[9px] font-mono" style={{ color: SEV_COLOR.high }}>
            H:{highCount}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-slate-700 text-xs">Lädt…</span>
        </div>
      ) : advisories.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-slate-700 text-xs">Keine Daten</span>
        </div>
      ) : (
        <div className="flex flex-col gap-1 flex-1 overflow-hidden">
          {advisories.slice(0, 6).map((adv) => (
            <div key={adv.id} className="flex items-start gap-1.5 min-w-0">
              <span
                className="text-[8px] font-bold uppercase px-1 py-0.5 rounded shrink-0 mt-0.5"
                style={{ background: SEV_COLOR[adv.severity] + "22", color: SEV_COLOR[adv.severity] }}
              >
                {adv.severity.slice(0, 4)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] text-slate-300 truncate leading-tight">{adv.summary}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[8px] text-slate-600">
                    {ECOSYSTEM_ABBR[adv.ecosystem?.toLowerCase()] ?? adv.ecosystem ?? "—"}
                    {adv.packageName && adv.packageName !== "—" ? ` · ${adv.packageName}` : ""}
                  </span>
                  {adv.cvssScore != null && (
                    <span className="text-[8px] font-mono" style={{ color: SEV_COLOR[adv.severity] }}>
                      {adv.cvssScore.toFixed(1)}
                    </span>
                  )}
                  <span className="text-[8px] text-slate-700 ml-auto">{timeAgo(adv.publishedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
