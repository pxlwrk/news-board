export type FeedCategory =
  | "security_critical"
  | "security_news"
  | "government_it"
  | "eu_policy"
  | "tech_trends"
  | "ai_innovation";

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: FeedCategory;
  language: "de" | "en";
  priority: "high" | "medium" | "low";
}

export interface FeedItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
  category: FeedCategory;
  language: "de" | "en";
}

export interface FeedResult {
  category: FeedCategory;
  items: FeedItem[];
  lastFetched: string;
  errors: string[];
}

export const FEED_SOURCES: FeedSource[] = [
  // ── Security Critical ──────────────────────────────────────────────
  // BSI WID: confirmed working (RSS via wid.cert-bund.de)
  {
    id: "bsi-wid",
    name: "BSI WID",
    url: "https://www.bsi.bund.de/SiteGlobals/Functions/RSSFeed/RSSNewsfeed/RSSNewsfeed_WID.xml",
    category: "security_critical",
    language: "de",
    priority: "high",
  },
  // CERT-Bund advisories: confirmed at wid.cert-bund.de
  {
    id: "cert-bund",
    name: "CERT-Bund",
    url: "https://wid.cert-bund.de/content/public/securityAdvisory/rss",
    category: "security_critical",
    language: "de",
    priority: "high",
  },
  // CVEFeed.io: replacement for retired NVD XML feeds (Aug 2025)
  {
    id: "cvefeed-critical",
    name: "CVEFeed – Kritisch",
    url: "https://cvefeed.io/rssfeed/severity/critical.xml",
    category: "security_critical",
    language: "en",
    priority: "high",
  },
  // CERT-EU security advisories for EU institutions
  {
    id: "cert-eu",
    name: "CERT-EU",
    url: "https://cert.europa.eu/publications/security-advisories-rss",
    category: "security_critical",
    language: "en",
    priority: "high",
  },
  // BSI general press + news
  {
    id: "bsi-news",
    name: "BSI Pressemitteilungen",
    url: "https://www.bsi.bund.de/SiteGlobals/Functions/RSSFeed/RSSNewsfeed/RSSNewsfeed.xml",
    category: "security_critical",
    language: "de",
    priority: "medium",
  },

  // ── Security News ──────────────────────────────────────────────────
  {
    id: "heise-security",
    name: "Heise Security",
    url: "https://www.heise.de/security/rss/news-atom.xml",
    category: "security_news",
    language: "de",
    priority: "high",
  },
  {
    id: "heise-security-alerts",
    name: "Heise Security Alerts",
    url: "https://www.heise.de/security/rss/alert-news-atom.xml",
    category: "security_news",
    language: "de",
    priority: "high",
  },
  {
    id: "bleepingcomputer",
    name: "BleepingComputer",
    url: "https://www.bleepingcomputer.com/feed/",
    category: "security_news",
    language: "en",
    priority: "high",
  },
  {
    id: "krebs-security",
    name: "Krebs on Security",
    url: "https://krebsonsecurity.com/feed/",
    category: "security_news",
    language: "en",
    priority: "medium",
  },
  {
    id: "golem-security",
    name: "Golem Security",
    url: "https://rss.golem.de/rss.php?ms=security&feed=RSS1.0",
    category: "security_news",
    language: "de",
    priority: "medium",
  },
  {
    id: "kuketz",
    name: "Kuketz IT-Security",
    url: "https://www.kuketz-blog.de/category/artikel/feed/",
    category: "security_news",
    language: "de",
    priority: "low",
  },

  // ── Government IT / Verwaltungsdigitalisierung ─────────────────────
  {
    id: "netzpolitik",
    name: "Netzpolitik.org",
    url: "https://netzpolitik.org/feed/",
    category: "government_it",
    language: "de",
    priority: "high",
  },
  {
    id: "bundesregierung",
    name: "Bundesregierung",
    url: "https://www.bundesregierung.de/breg-de/aktuelles/rss",
    category: "government_it",
    language: "de",
    priority: "high",
  },
  {
    id: "golem-politik",
    name: "Golem Verwaltung",
    url: "https://rss.golem.de/rss.php?tp=reg&feed=RSS2.0",
    category: "government_it",
    language: "de",
    priority: "medium",
  },
  {
    id: "heise-ix",
    name: "Heise iX",
    url: "https://www.heise.de/ix/rss/news-atom.xml",
    category: "government_it",
    language: "de",
    priority: "medium",
  },
  {
    id: "computerwoche",
    name: "Computerwoche",
    url: "https://www.computerwoche.de/feed/",
    category: "government_it",
    language: "de",
    priority: "medium",
  },

  // ── EU Policy / Regulatory ─────────────────────────────────────────
  // EUR-Lex Official Journal L (binding EU legislation)
  {
    id: "eur-lex-ojl",
    name: "EUR-Lex Gesetzgebung",
    url: "https://eur-lex.europa.eu/RSSXSL/SearchResults.do?source=predefined&newsType=OJL_OJL",
    category: "eu_policy",
    language: "en",
    priority: "high",
  },
  // Council of EU press releases
  {
    id: "council-eu",
    name: "Rat der EU",
    url: "https://www.consilium.europa.eu/en/about-site/rss/",
    category: "eu_policy",
    language: "en",
    priority: "high",
  },
  // CERT-EU threat intel (also relevant for EU policy context)
  {
    id: "cert-eu-threat",
    name: "CERT-EU Threat Intel",
    url: "https://cert.europa.eu/publications/threat-intelligence-rss",
    category: "eu_policy",
    language: "en",
    priority: "medium",
  },
  // European Parliament press (ITRE covers digital policy)
  {
    id: "europarl",
    name: "Europaparlament",
    url: "https://www.europarl.europa.eu/rss/en/pressreleases/index.xml",
    category: "eu_policy",
    language: "en",
    priority: "medium",
  },

  // ── Technology Trends ──────────────────────────────────────────────
  {
    id: "heise-online",
    name: "Heise Online",
    url: "https://www.heise.de/newsticker/heise-atom.xml",
    category: "tech_trends",
    language: "de",
    priority: "high",
  },
  {
    id: "mit-tech-review",
    name: "MIT Technology Review",
    url: "https://www.technologyreview.com/feed/",
    category: "tech_trends",
    language: "en",
    priority: "high",
  },
  {
    id: "t3n",
    name: "t3n",
    url: "https://t3n.de/rss.xml",
    category: "tech_trends",
    language: "de",
    priority: "medium",
  },
  {
    id: "wired",
    name: "Wired",
    url: "https://www.wired.com/feed/rss",
    category: "tech_trends",
    language: "en",
    priority: "medium",
  },
  {
    id: "golem-internet",
    name: "Golem Internet & Infrastruktur",
    url: "https://rss.golem.de/rss.php?tp=inet&feed=RSS2.0",
    category: "tech_trends",
    language: "de",
    priority: "low",
  },

  // ── AI & Innovation ────────────────────────────────────────────────
  {
    id: "golem-ki",
    name: "Golem KI",
    url: "https://rss.golem.de/rss.php?ms=ki&feed=RSS1.0",
    category: "ai_innovation",
    language: "de",
    priority: "high",
  },
  {
    id: "the-verge",
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    category: "ai_innovation",
    language: "en",
    priority: "high",
  },
  {
    id: "golem-opensource",
    name: "Golem Open Source",
    url: "https://rss.golem.de/rss.php?ms=open-source&feed=RSS1.0",
    category: "ai_innovation",
    language: "de",
    priority: "medium",
  },
];

export const CATEGORY_CONFIG: Record<
  FeedCategory,
  { label: string; color: string; bgColor: string; borderColor: string; icon: string }
> = {
  security_critical: {
    label: "Sicherheitswarnungen",
    color: "text-red-400",
    bgColor: "bg-red-950/40",
    borderColor: "border-red-800/60",
    icon: "🚨",
  },
  security_news: {
    label: "Security News",
    color: "text-orange-400",
    bgColor: "bg-orange-950/30",
    borderColor: "border-orange-800/50",
    icon: "🔐",
  },
  government_it: {
    label: "Verwaltungs-IT",
    color: "text-blue-400",
    bgColor: "bg-blue-950/30",
    borderColor: "border-blue-800/50",
    icon: "🏛️",
  },
  eu_policy: {
    label: "EU & Regulierung",
    color: "text-amber-400",
    bgColor: "bg-amber-950/30",
    borderColor: "border-amber-800/50",
    icon: "🇪🇺",
  },
  tech_trends: {
    label: "Technologie-Trends",
    color: "text-purple-400",
    bgColor: "bg-purple-950/30",
    borderColor: "border-purple-800/50",
    icon: "📡",
  },
  ai_innovation: {
    label: "KI & Innovation",
    color: "text-emerald-400",
    bgColor: "bg-emerald-950/30",
    borderColor: "border-emerald-800/50",
    icon: "🤖",
  },
};
