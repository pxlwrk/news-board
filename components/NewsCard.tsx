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
  const isNew = ageMs < 15 * 60 * 1000; // ungelesen: < 15 Minuten

  const shortTime = timeAgo
    .replace("vor ", "").replace(" Stunden", "h").replace(" Stunde", "h")
    .replace(" Minuten", "m").replace(" Minute", "m")
    .replace(" Tagen", "d").replace(" Tag", "d");

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-start gap-2 px-2.5 py-2 rounded border-l-2 transition-all duration-150
        hover:bg-slate-800/60 cursor-pointer
        ${index % 2 === 0 ? "bg-slate-900/20" : "bg-transparent"}
        ${isNew ? config.borderColor.replace("border", "border-l") : "border-l-transparent"}
        ${isNew ? "" : "opacity-40"}`}
    >
      {/* Index */}
      <span className="text-[10px] text-slate-700 tabular-nums pt-0.5 w-4 shrink-0 text-right">
        {index + 1}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className={`text-[9px] font-bold uppercase tracking-wider shrink-0 ${config.color}`}>
            {item.source}
          </span>
          {isNew && (
            <span className={`inline-flex items-center gap-0.5 text-[7px] font-black uppercase px-1 py-0.5 rounded ${config.bgColor} ${config.color} shrink-0`}>
              <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: "currentColor" }} />
              NEU
            </span>
          )}
          {item.language === "en" && (
            <span className="text-[8px] text-slate-600 uppercase shrink-0">EN</span>
          )}
        </div>
        <p className={`text-[11px] leading-snug transition-colors line-clamp-2
          ${isNew ? "text-slate-200" : "text-slate-500"}`}>
          {item.title}
        </p>
      </div>

      {/* Time */}
      <span className="text-[9px] text-slate-600 shrink-0 pt-0.5 whitespace-nowrap">
        {shortTime}
      </span>
    </a>
  );
}
