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

  const isNew = Date.now() - new Date(item.pubDate).getTime() < 3 * 60 * 60 * 1000;

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-start gap-2 px-2.5 py-2 rounded border-l-2 transition-all duration-150
        hover:bg-slate-800/60 cursor-pointer
        ${index % 2 === 0 ? "bg-slate-900/20" : "bg-transparent"}
        ${isNew ? config.borderColor.replace("border", "border-l") : "border-l-transparent"}`}
    >
      {/* Index */}
      <span className="text-[10px] text-slate-700 tabular-nums pt-0.5 w-4 shrink-0 text-right">
        {index + 1}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 mb-0.5">
          <span className={`text-[9px] font-bold uppercase tracking-wider shrink-0 ${config.color}`}>
            {item.source}
          </span>
          {item.language === "en" && (
            <span className="text-[8px] text-slate-600 uppercase shrink-0">EN</span>
          )}
        </div>
        <p className={`text-[11px] leading-snug text-slate-300 group-hover:${config.color} transition-colors line-clamp-2`}>
          {item.title}
        </p>
      </div>

      {/* Time */}
      <span className="text-[9px] text-slate-600 shrink-0 pt-0.5 whitespace-nowrap">
        {timeAgo.replace("vor ", "").replace(" Stunden", "h").replace(" Stunde", "h").replace(" Minuten", "m").replace(" Minute", "m").replace(" Tagen", "d").replace(" Tag", "d")}
      </span>
    </a>
  );
}
