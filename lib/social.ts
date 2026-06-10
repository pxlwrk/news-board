export type SocialPlatform = "mastodon" | "bluesky";

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  author: string;
  handle: string;
  content: string;
  link: string;
  pubDate: string;
  boosts: number;
  likes: number;
  tags: string[];
  instance?: string;
}

export interface SocialSource {
  id: string;
  platform: SocialPlatform;
  name: string;
  url: string;
  instance?: string;
  /** Skip include-filter — use for curated security instances where all posts are relevant */
  allowAll?: boolean;
}

export const SOCIAL_SOURCES: SocialSource[] = [
  // infosec.exchange is a curated security instance — all posts are relevant, skip include filter
  {
    id: "mastodon-infosec",
    platform: "mastodon",
    name: "infosec.exchange #infosec",
    url: "https://infosec.exchange/api/v1/timelines/tag/infosec?limit=40",
    instance: "infosec.exchange",
    allowAll: true,
  },
  {
    id: "mastodon-cybersecurity",
    platform: "mastodon",
    name: "infosec.exchange #cybersecurity",
    url: "https://infosec.exchange/api/v1/timelines/tag/cybersecurity?limit=30",
    instance: "infosec.exchange",
    allowAll: true,
  },
  {
    id: "mastodon-cve",
    platform: "mastodon",
    name: "infosec.exchange #cve",
    url: "https://infosec.exchange/api/v1/timelines/tag/cve?limit=30",
    instance: "infosec.exchange",
    allowAll: true,
  },
  {
    id: "mastodon-ransomware",
    platform: "mastodon",
    name: "infosec.exchange #ransomware",
    url: "https://infosec.exchange/api/v1/timelines/tag/ransomware?limit=20",
    instance: "infosec.exchange",
    allowAll: true,
  },
  // social.bund.de — Hashtag-Timelines statt public timeline (benötigt keine Auth)
  {
    id: "mastodon-bund-cyber",
    platform: "mastodon",
    name: "social.bund.de #cybersicherheit",
    url: "https://social.bund.de/api/v1/timelines/tag/cybersicherheit?limit=30",
    instance: "social.bund.de",
  },
  {
    id: "mastodon-bund-digital",
    platform: "mastodon",
    name: "social.bund.de #digitalisierung",
    url: "https://social.bund.de/api/v1/timelines/tag/digitalisierung?limit=30",
    instance: "social.bund.de",
  },
  // Bluesky
  {
    id: "bluesky-infosec",
    platform: "bluesky",
    name: "Bluesky #infosec",
    url: "https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=%23infosec+%23cybersecurity&limit=30",
    allowAll: true,
  },
  {
    id: "bluesky-cve",
    platform: "bluesky",
    name: "Bluesky #cve",
    url: "https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=%23cve+OR+%23vulnerability&limit=25",
    allowAll: true,
  },
  {
    id: "bluesky-nis2",
    platform: "bluesky",
    name: "Bluesky #nis2",
    url: "https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=%23nis2+OR+%23dsgvo&limit=20",
  },
];

// Must match at least one of these to pass social filter
export const SOCIAL_INCLUDE = [
  /cve-\d{4}-\d+/i,
  /ransomware/i,
  /malware/i,
  /\bexploit/i,
  /vulnerabilit/i,
  /schwachstelle/i,
  /\bphishing\b/i,
  /\bddos\b/i,
  /\bapt\b/i,
  /\bbreach\b/i,
  /kompromittiert/i,
  /\bkritis\b/i,
  /zero.?trust/i,
  /patch.?tuesday/i,
  /active.?directory/i,
  /\bnis2\b/i,
  /\bdsgvo\b/i,
  /\bgdpr\b/i,
  /\bbsi\b/i,
  /cert.?bund/i,
  /\benisa\b/i,
  /verwaltungsdigitalisierung/i,
  /bundesbehörde/i,
  /\binfrastruktur\b/i,
  /\bfirewall\b/i,
  /\bendpoint\b.*secur/i,
  /cloud.?security/i,
  /\bsiem\b/i,
  /\bsoc\b.*secur/i,
  /cyber.?angriff|cyberattack/i,
  /sicherheitswarnung/i,
  /digitalisierung.*behörde|behörde.*digital/i,
];

// Always exclude these even if other terms match
export const SOCIAL_EXCLUDE = [
  /\bcrypto\b.*\bcoin\b/i,
  /\bnft\b/i,
  /\bbitcoin\b/i,
  /follow.*back/i,
  /\bgiveaway\b/i,
];
