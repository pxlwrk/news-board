import { NextResponse } from "next/server";
import { SOCIAL_SOURCES, SocialPost, SOCIAL_INCLUDE, SOCIAL_EXCLUDE } from "@/lib/social";
import { MOCK_SOCIAL } from "@/lib/mockSocialData";

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

function isRelevant(text: string): boolean {
  const t = text.toLowerCase();
  if (SOCIAL_EXCLUDE.some((p) => p.test(t))) return false;
  return SOCIAL_INCLUDE.some((p) => p.test(t));
}

async function fetchMastodon(source: typeof SOCIAL_SOURCES[0]): Promise<SocialPost[]> {
  const res = await fetch(source.url, {
    headers: { "User-Agent": "CTO-Dashboard/1.0", Accept: "application/json" },
    signal: AbortSignal.timeout(7000),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data as {
    id: string; content: string; created_at: string; url: string;
    account: { display_name: string; acct: string };
    favourites_count: number; reblogs_count: number;
    tags: { name: string }[];
  }[])
    .map((s) => ({
      id: `${source.id}-${s.id}`,
      platform: "mastodon" as const,
      author: s.account.display_name || s.account.acct,
      handle: s.account.acct.includes("@") ? s.account.acct : `${s.account.acct}@${source.instance}`,
      content: stripHtml(s.content).slice(0, 320),
      link: s.url,
      pubDate: s.created_at,
      boosts: s.reblogs_count ?? 0,
      likes: s.favourites_count ?? 0,
      tags: (s.tags ?? []).map((t) => t.name),
      instance: source.instance,
    }))
    .filter((p) => isRelevant(p.content));
}

async function fetchBluesky(source: typeof SOCIAL_SOURCES[0]): Promise<SocialPost[]> {
  const res = await fetch(source.url, {
    headers: { "Accept": "application/json" },
    signal: AbortSignal.timeout(7000),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return ((data as { posts?: unknown[] }).posts ?? [])
    .map((p: unknown) => {
      const post = p as {
        uri: string; author: { handle: string; displayName?: string };
        record: { text: string; createdAt: string; tags?: string[] };
        likeCount?: number; repostCount?: number;
      };
      return {
        id: `${source.id}-${post.uri.split("/").pop()}`,
        platform: "bluesky" as const,
        author: post.author.displayName || post.author.handle,
        handle: post.author.handle,
        content: (post.record.text ?? "").slice(0, 320),
        link: `https://bsky.app/profile/${post.author.handle}`,
        pubDate: post.record.createdAt,
        boosts: post.repostCount ?? 0,
        likes: post.likeCount ?? 0,
        tags: post.record.tags ?? [],
      };
    })
    .filter((p) => isRelevant(p.content));
}

export async function GET() {
  const results = await Promise.allSettled(
    SOCIAL_SOURCES.map((s) =>
      s.platform === "mastodon" ? fetchMastodon(s) : fetchBluesky(s)
    )
  );

  const posts: SocialPost[] = [];
  let anySuccess = false;

  for (const r of results) {
    if (r.status === "fulfilled" && r.value.length > 0) {
      posts.push(...r.value);
      anySuccess = true;
    }
  }

  if (!anySuccess) {
    return NextResponse.json({ posts: MOCK_SOCIAL, usingDemoData: true }, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  // Deduplicate by content similarity, sort by recency + engagement
  const seen = new Set<string>();
  const unique = posts.filter((p) => {
    const key = p.content.slice(0, 60).toLowerCase().replace(/\s+/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => {
    const ageDiff = new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    const engDiff = (b.boosts * 3 + b.likes) - (a.boosts * 3 + a.likes);
    // blend: recency dominates, engagement is a tiebreaker in the same hour
    return ageDiff - engDiff * 60000;
  });

  return NextResponse.json(
    { posts: unique.slice(0, 30), usingDemoData: false },
    { headers: { "Cache-Control": "no-store" } }
  );
}
