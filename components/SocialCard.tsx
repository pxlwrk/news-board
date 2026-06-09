"use client";
import { SocialPost } from "@/lib/social";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

const PLATFORM_STYLE = {
  mastodon: { badge: "Mastodon", color: "text-violet-400", dot: "bg-violet-500" },
  bluesky:  { badge: "Bluesky",  color: "text-sky-400",    dot: "bg-sky-500"    },
};

function shorten(t: string) {
  try {
    return formatDistanceToNow(new Date(t), { addSuffix: true, locale: de })
      .replace("vor ", "").replace(" Stunden", "h").replace(" Stunde", "h")
      .replace(" Minuten", "m").replace(" Minute", "m")
      .replace(" Tagen", "d").replace(" Tag", "d").replace("weniger als einer Minute", "jetzt");
  } catch { return ""; }
}

export function SocialCard({ post, index }: { post: SocialPost; index: number }) {
  const ps = PLATFORM_STYLE[post.platform];
  const isNew = Date.now() - new Date(post.pubDate).getTime() < 2 * 60 * 60 * 1000;

  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col gap-1 px-2.5 py-2 transition-all duration-150 hover:bg-slate-800/60 cursor-pointer border-l-2 ${isNew ? "border-l-violet-600/60" : "border-l-transparent"} ${index % 2 === 0 ? "bg-slate-900/20" : "bg-transparent"}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ps.dot}`} />
          <span className={`text-[9px] font-bold uppercase tracking-wider shrink-0 ${ps.color}`}>
            {ps.badge}
          </span>
          <span className="text-[10px] text-slate-400 truncate font-medium">{post.author}</span>
        </div>
        <span className="text-[9px] text-slate-600 shrink-0">{shorten(post.pubDate)}</span>
      </div>

      {/* Content */}
      <p className="text-[11px] text-slate-300 leading-snug line-clamp-3 group-hover:text-slate-100 transition-colors">
        {post.content}
      </p>

      {/* Footer: engagement */}
      {(post.boosts > 0 || post.likes > 0) && (
        <div className="flex items-center gap-2 text-[9px] text-slate-600">
          {post.boosts > 0 && <span>↻ {post.boosts >= 1000 ? `${(post.boosts / 1000).toFixed(1)}k` : post.boosts}</span>}
          {post.likes  > 0 && <span>♥ {post.likes  >= 1000 ? `${(post.likes  / 1000).toFixed(1)}k` : post.likes}</span>}
          {post.instance && <span className="ml-auto opacity-60">{post.instance}</span>}
        </div>
      )}
    </a>
  );
}
