import { FeedItem } from "./feeds";

// Terms that indicate content irrelevant for a government CTO / 2500-seat enterprise
const EXCLUDE_PATTERNS = [
  /raspberry\s?pi/i,
  /arduino/i,
  /maker\s?space/i,
  /\bsmarthome\b/i,
  /smart\s?home/i,
  /\bgaming\b/i,
  /\bkonsole\b/i,
  /playstation|xbox|nintendo|steam\s?deck/i,
  /\bhandy\b.*kaufen/i,
  /smartphone.*kaufen/i,
  /\bbasteln\b/i,
  /\bhobby\b/i,
  /\bdiy\b/i,
  /app\s?store|google\s?play/i,
  /\btwitch\b|\byoutube\b.*kanal/i,
  /\bcrypto\b|\bnft\b|\bblockchain.*coin/i,
  /\bstart.?up.*funding/i,
  /\biphone.*review/i,
  /\btesla\b|\bspacex\b/i,
];

// Terms that signal relevance for enterprise/government IT
const PRIORITY_PATTERNS = [
  /kritisch|critical/i,
  /\bcve-\d{4}/i,
  /schwachstelle|vulnerability|vulnerabilit/i,
  /exploit|ausgenutzt|actively exploited/i,
  /ransomware|malware/i,
  /behörde|ministerium|verwaltung|bundesbehörde/i,
  /\bkritis\b/i,
  /\bnis2\b/i,
  /\bdsgvo\b|\bgdpr\b/i,
  /compliance/i,
  /zero\s?trust/i,
  /active\s?directory|ldap|sso/i,
  /\bvpn\b|\bfirewall\b|\bendpoint\b/i,
  /rechenzentrum|datacenter|data\s?center/i,
  /\benterprise\b/i,
  /patch.*tuesday|sicherheits.*update/i,
  /\barbeitsplatz|\bworkplace\b/i,
  /cloud.*bund|bundescloud/i,
  /\bozg\b|\bdigitalpakt\b/i,
  /eu\s?ai\s?act|nis\s?2|cyber\s?resilience/i,
  /cert.bund|bsi\b/i,
];

export function filterItems(items: FeedItem[]): FeedItem[] {
  return items.filter((item) => {
    const text = `${item.title} ${item.description}`.toLowerCase();
    if (EXCLUDE_PATTERNS.some((p) => p.test(text))) return false;
    return true;
  });
}

export function scoreItem(item: FeedItem): number {
  const text = `${item.title} ${item.description}`;
  let score = 0;
  for (const p of PRIORITY_PATTERNS) {
    if (p.test(text)) score += 1;
  }
  return score;
}
