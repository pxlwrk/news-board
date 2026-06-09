"use client";
import { FeedItem, CATEGORY_CONFIG } from "@/lib/feeds";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface NewsCardProps {
  item: FeedItem;
  compact?: boolean;
}

export function NewsCard({ item, compact = false }: NewsCardProps) {
  const config = CATEGORY_CONFIG[item.category];
  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(item.pubDate), {
        addSuffix: true,
        locale: de,
      });
    } catch {
      return "";
    }
  })();

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block rounded-lg border p-3 transition-all duration-200 hover:scale-[1.01] hover:brightness-110 cursor-pointer ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${config.color} bg-black/20`}
        >
          {item.source}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {item.language === "en" && (
            <span className="text-[9px] text-slate-500 uppercase">EN</span>
          )}
          <span className="text-[10px] text-slate-500">{timeAgo}</span>
        </div>
      </div>
      <h3
        className={`text-sm font-medium leading-snug text-slate-100 group-hover:${config.color} transition-colors line-clamp-2 mb-1`}
      >
        {item.title}
      </h3>
      {!compact && item.description && (
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      )}
    </a>
  );
}
