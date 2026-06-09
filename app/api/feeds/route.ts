import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { FEED_SOURCES, FeedCategory, FeedItem, FeedResult } from "@/lib/feeds";
import { MOCK_ITEMS } from "@/lib/mockData";
import { filterItems, scoreItem } from "@/lib/filter";

const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; CTO-Dashboard/1.0)",
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
  },
  customFields: { item: ["summary", "content:encoded"] },
});

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim().slice(0, 200);
}

async function fetchFeed(source: (typeof FEED_SOURCES)[0]): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items || []).slice(0, 12).map((item, idx) => ({
      id: `${source.id}-${idx}-${(item.guid || item.link || String(idx)).slice(-16)}`,
      title: item.title?.trim() || "Kein Titel",
      link: item.link || "#",
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      description: stripHtml(
        item["content:encoded"] || item.summary || item.contentSnippet ||
        item.content || (item as unknown as Record<string, string>)["description"] || ""
      ),
      source: source.name,
      category: source.category,
      language: source.language,
    }));
  } catch {
    return [];
  }
}

function buildResponse(allItems: FeedItem[], errors: string[], usedMock: boolean) {
  const filtered = filterItems(allItems);

  const byCategory: Record<string, FeedResult> = {};
  for (const item of filtered) {
    if (!byCategory[item.category]) {
      byCategory[item.category] = {
        category: item.category,
        items: [],
        lastFetched: new Date().toISOString(),
        errors: [],
      };
    }
    byCategory[item.category].items.push(item);
  }

  for (const cat of Object.values(byCategory)) {
    // Sort by recency, but boost high-priority items
    cat.items.sort((a, b) => {
      const timeDiff = new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
      const scoreDiff = (scoreItem(b) - scoreItem(a)) * 2 * 60 * 60 * 1000;
      return timeDiff + scoreDiff > 0 ? -1 : 1;
    });
    cat.items = cat.items.slice(0, 20);
  }

  // Compute KPIs
  const now = Date.now();
  const h24 = 24 * 60 * 60 * 1000;
  const d7 = 7 * h24;

  const kpis = {
    criticalAdvisories: (byCategory["security_critical"]?.items || [])
      .filter((i) => now - new Date(i.pubDate).getTime() < h24).length,
    securityNews24h: (byCategory["security_news"]?.items || [])
      .filter((i) => now - new Date(i.pubDate).getTime() < h24).length,
    euRegulatory7d: (byCategory["eu_policy"]?.items || [])
      .filter((i) => now - new Date(i.pubDate).getTime() < d7).length,
    govIt7d: (byCategory["government_it"]?.items || [])
      .filter((i) => now - new Date(i.pubDate).getTime() < d7).length,
    totalItems: filtered.length,
    sourcesOk: FEED_SOURCES.length - errors.length,
    sourcesTotal: FEED_SOURCES.length,
  };

  return NextResponse.json(
    { categories: byCategory, lastFetched: new Date().toISOString(), errors, usingDemoData: usedMock, kpis },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("demo") === "true") {
    return buildResponse(MOCK_ITEMS, [], true);
  }

  const results = await Promise.allSettled(FEED_SOURCES.map(fetchFeed));
  const allItems: FeedItem[] = [];
  const errors: string[] = [];

  results.forEach((result, idx) => {
    if (result.status === "fulfilled") allItems.push(...result.value);
    else errors.push(FEED_SOURCES[idx].name);
  });

  if (allItems.length === 0) return buildResponse(MOCK_ITEMS, [], true);
  return buildResponse(allItems, errors, false);
}
