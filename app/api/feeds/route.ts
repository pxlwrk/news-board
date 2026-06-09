import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { FEED_SOURCES, FeedCategory, FeedItem, FeedResult } from "@/lib/feeds";
import { MOCK_ITEMS } from "@/lib/mockData";

const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; CTO-Dashboard/1.0; +https://dashboard.intern)",
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
  },
  customFields: {
    item: ["summary", "content:encoded"],
  },
});

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

async function fetchFeed(source: (typeof FEED_SOURCES)[0]): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items || []).slice(0, 10).map((item, idx) => ({
      id: `${source.id}-${idx}-${(item.guid || item.link || String(idx)).slice(-16)}`,
      title: item.title?.trim() || "Kein Titel",
      link: item.link || "#",
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      description: stripHtml(
        item["content:encoded"] ||
          item.summary ||
          item.contentSnippet ||
          item.content ||
          (item as unknown as Record<string, string>)["description"] ||
          ""
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
  const byCategory: Record<string, FeedResult> = {};

  for (const item of allItems) {
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
    cat.items.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
    cat.items = cat.items.slice(0, 15);
  }

  return NextResponse.json(
    {
      categories: byCategory,
      lastFetched: new Date().toISOString(),
      errors,
      usingDemoData: usedMock,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get("demo") === "true";

  if (demo) {
    return buildResponse(MOCK_ITEMS, [], true);
  }

  const sources = FEED_SOURCES;
  const results = await Promise.allSettled(sources.map((s) => fetchFeed(s)));

  const allItems: FeedItem[] = [];
  const errors: string[] = [];

  results.forEach((result, idx) => {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    } else {
      errors.push(sources[idx].name);
    }
  });

  // If no items at all (network blocked), fall back to mock data
  if (allItems.length === 0) {
    return buildResponse(MOCK_ITEMS, [], true);
  }

  return buildResponse(allItems, errors, false);
}
