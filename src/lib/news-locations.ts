/**
 * Location tagging for news items. Each tag is a dashboard slug from src/lib/dashboards.ts.
 * Tags come from the item's own text (headline, URL slug, people's offices). No match, or an
 * ambiguous one, means no tag. Never guess.
 *
 * Precedence: item.locations (set by ingest) > NEWS_LOCATION_BACKFILL[id] (reviewed backfill)
 * > tagNewsLocations(item) at build/load time (catches new ingest items that arrive untagged).
 */
import type { NewsItem } from "@/content/news";
import { NEWS } from "@/content/news";
import { NEWS_LOCATION_BACKFILL } from "@/content/news-locations";

export type LocationSlug =
  | "loudoun" | "fairfax-city" | "albemarle" | "hanover" | "chesterfield" | "henrico" | "manassas"
  | "house" | "senate" | "board-of-education";

type Rule = { slug: LocationSlug; include: RegExp[]; exclude?: RegExp[]; offices?: RegExp };

export const LOCATION_RULES: Rule[] = [
  { slug: "loudoun", include: [/\bloudoun\b/i, /\blcps\b/i, /\bleesburg\b/i, /\bashburn\b/i, /\bpurcellville\b/i], offices: /^Loudoun /i },
  // Only the independent City of Fairfax. Plain "Fairfax" usually means Fairfax County, so it does not count.
  { slug: "fairfax-city", include: [/\bcity of fairfax\b/i, /\bfairfax city\b/i, /\bfairfax-city\b/i, /\bfcps?-?city\b/i] },
  { slug: "albemarle", include: [/\balbemarle\b/i] },
  { slug: "hanover", include: [/\bhanover county\b/i, /\bhanover-county\b/i, /\bhanover (?:supervisors?|schools?|board)\b/i] },
  { slug: "chesterfield", include: [/\bchesterfield\b/i] },
  { slug: "henrico", include: [/\bhenrico\b/i, /\bhcps\b/i] },
  // City of Manassas only; Manassas Park is a separate city.
  // City of Manassas only. A bare "Manassas" is often a Prince William County mailing address, so it
  // needs a city marker (city government, city schools, the city-owned airport, the city's First Friday).
  { slug: "manassas", include: [/\bcity of manassas\b/i, /\bmanassas city\b/i, /\bmanassas (?:city )?council\b/i, /\bmanassas (?:regional )?airport\b/i, /\bmanassas (?:cancels|pauses|puts|reports)\b/i, /\bfirst friday\b.*\bmanassas\b|\bmanassas\b.*\bfirst friday\b/i] },
  // Chambers: named in the text, or a member of that chamber is on the item AND the story is legislative.
  { slug: "house", include: [/\bhouse of delegates\b/i, /\bva\. house\b/i, /\bDel\.\s/, /\bdelegates?\b(?! to)/i], offices: /^State Delegate$/ },
  { slug: "senate", include: [/\b(?:state|virginia) senate\b/i, /\bsenate of virginia\b/i, /\bstate senators?\b/i, /\bSen\.\s(?!Tim Kaine|Mark Warner|Kaine|Warner)/], offices: /^State Senator$/ },
  { slug: "board-of-education", include: [/\bboard of education\b/i, /\bboard-of-education\b/i, /\bvdoe\b/i, /\bvirginia department of education\b/i, /\bsuperintendent of public instruction\b/i] },
];

const CHAMBER = new Set<LocationSlug>(["house", "senate"]);
const LEGISLATIVE = /\b(general assembly|lawmakers?|legislat\w*|legislators?|bills?|special session|session)\b/i;

function haystack(item: Pick<NewsItem, "headline" | "url">): string {
  let slug = item.url;
  try { slug = decodeURIComponent(new URL(item.url).pathname).replace(/[-_/]+/g, " "); } catch { /* keep raw */ }
  return `${item.headline} ${slug}`;
}

/** Reusable tagger: returns dashboard slugs that the item clearly names. */
export function tagNewsLocations(item: Pick<NewsItem, "headline" | "url" | "people">): LocationSlug[] {
  const text = haystack(item);
  const out: LocationSlug[] = [];
  for (const r of LOCATION_RULES) {
    if (r.exclude?.some((re) => re.test(text)) && !r.include.some((re) => re.test(text.replace(r.exclude![0], "")))) continue;
    const byText = r.include.some((re) => re.test(text));
    const byOffice = !!r.offices && item.people.some((p) => r.offices!.test(p.office)) && (!CHAMBER.has(r.slug) || LEGISLATIVE.test(item.headline));
    if (byText || byOffice) out.push(r.slug);
  }
  return out;
}

export function newsLocations(item: NewsItem): string[] {
  return item.locations ?? NEWS_LOCATION_BACKFILL[item.id] ?? tagNewsLocations(item);
}

export function newsForLocation(slug: string): NewsItem[] {
  return NEWS.filter((n) => newsLocations(n).includes(slug)).sort((a, b) => b.date.localeCompare(a.date));
}
