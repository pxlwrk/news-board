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
}

export const SOCIAL_SOURCES: SocialSource[] = [
  // Mastodon – infosec.exchange hashtag timelines
  {
    id: "mastodon-infosec",
    platform: "mastodon",
    name: "infosec.exchange #infosec",
    url: "https://infosec.exchange/api/v1/timelines/tag/infosec?limit=40",
    instance: "infosec.exchange",
  },
  {
    id: "mastodon-cybersecurity",
    platform: "mastodon",
    name: "infosec.exchange #cybersecurity",
    url: "https://infosec.exchange/api/v1/timelines/tag/cybersecurity?limit=30",
    instance: "infosec.exchange",
  },
  {
    id: "mastodon-nis2",
    platform: "mastodon",
    name: "infosec.exchange #nis2",
    url: "https://infosec.exchange/api/v1/timelines/tag/nis2?limit=20",
    instance: "infosec.exchange",
  },
  // Mastodon – German Government instance
  {
    id: "mastodon-bund",
    platform: "mastodon",
    name: "social.bund.de",
    url: "https://social.bund.de/api/v1/timelines/public?local=true&limit=40",
    instance: "social.bund.de",
  },
  // Bluesky public search
  {
    id: "bluesky-infosec",
    platform: "bluesky",
    name: "Bluesky #infosec",
    url: "https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=%23infosec+%23cybersecurity&limit=30",
  },
  {
    id: "bluesky-nis2",
    platform: "bluesky",
    name: "Bluesky #nis2",
    url: "https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=%23nis2+OR+%23dsgvo+OR+%23verwaltungsdigitalisierung&limit=20",
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
