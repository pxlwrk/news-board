"use client";
import { FeedItem, CATEGORY_CONFIG } from "@/lib/feeds";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface NewsCardProps {
  item: FeedItem;
  index: number;
}

export function NewsCard({ item, index }: NewsCardProps) {
  const config = CATEGORY_CONFIG[item.category];
  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(item.pubDate), { addSuffix: true, locale: de });
    } catch { return ""; }
  })();

  const ageMs = Date.now() - new Date(item.pubDate).getTime();
  const isNew = ageMs < 15 * 60 * 1000;

  const shortTime = timeAgo
    .replace("vor ", "").replace(" Stunden", "h").replace(" Stunde", "h")
    .replace(" Minuten", "m").replace(" Minute", "m")
    .replace(" Tagen", "d").replace(" Tag", "d");

  const borderClass = isNew
    ? config.borderColor.replace(/^border-(\S+)$/, "border-l-$1")
    : "border-l-transparent";

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex flex-col px-2.5 py-2 border-l-2 cursor-pointer transition-colors
        ${index % 2 === 0 ? "bg-slate-900/20" : "bg-transparent"}
        hover:bg-slate-800/50
        ${isNew ? borderClass : "border-l-transparent"}
        ${isNew ? "" : "opacity-30"}`}
    >
      {/* Headline — maximaler Kontrast */}
      <p className={`text-[13px] font-semibold leading-snug line-clamp-2 ${isNew ? "text-white" : "text-slate-400"}`}>
        {item.title}
      </p>

      {/* Meta-Zeile: bullet + Quelle + Zeit */}
      <div className="flex items-center gap-1 mt-1 min-w-0">
        {isNew && (
          <span className={`shrink-0 text-[8px] leading-none ${config.color}`}>●</span>
        )}
        <span className={`text-[9px] font-medium truncate ${isNew ? config.color : "text-slate-600"} opacity-80`}>
          {item.source}
        </span>
        {item.language === "en" && <span className="text-[8px] text-slate-700 shrink-0">EN</span>}
        <span className="text-[9px] text-slate-600 shrink-0 ml-auto">{shortTime}</span>
      </div>
    </a>
  );
}
