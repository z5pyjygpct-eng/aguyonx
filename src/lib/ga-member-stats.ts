// Plain-words counts and page-head text for General Assembly member profiles.
// Everything here is computed from the member's own data (src/lib/ga-members-2026-*.json); nothing is hardcoded per member.
import type { GaBill, GaMember, GaMeta } from "@/components/site/ga-member-profile";

export type BillBreakdown = { total: number; signed: number; vetoed: number; honor: number; otherPassed: number; failed: number; tabled: number };

const HONOR_TITLE = /^(Celebrating the life of|Commending)\b/i;
const HONOR_CATEGORIES = new Set(["Memorial resolutions", "Commendations"]);

/** A passed resolution that remembers or commends someone (same rule as the Bill subjects groups). */
export function isHonorResolution(b: GaBill) {
  return b.outcome === "passed" && (HONOR_TITLE.test(b.title) || (b.categories ?? []).some((c) => HONOR_CATEGORIES.has(c)));
}

/** Recount straight from the list of bills the page shows, so the numbers always match the list. */
export function breakdownBills(bills: GaBill[]): BillBreakdown {
  const r: BillBreakdown = { total: bills.length, signed: 0, vetoed: 0, honor: 0, otherPassed: 0, failed: 0, tabled: 0 };
  for (const b of bills) {
    if (b.outcome === "signed") r.signed++;
    else if (b.outcome === "vetoed") r.vetoed++;
    else if (b.outcome === "failed") r.failed++;
    else if (b.outcome === "tabled") r.tabled++;
    else if (isHonorResolution(b)) r.honor++;
    else r.otherPassed++;
  }
  return r;
}

export function dateLabel(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const coPatronTotal = (m: GaMember) => Object.values(m.coPatronCounts ?? {}).reduce((a, n) => a + n, 0);
const plural = (n: number, one: string, many: string) => `${n.toLocaleString()} ${n === 1 ? one : many}`;

/** Parts of the plain-words sentence, e.g. ["2 became law", "8 were honor resolutions ..."]. */
export function billSentenceParts(c: BillBreakdown) {
  const parts: string[] = [];
  if (c.signed) parts.push(`${c.signed} became law (signed by the governor)`);
  if (c.vetoed) parts.push(`${c.vetoed} ${c.vetoed === 1 ? "was" : "were"} vetoed by the governor`);
  if (c.honor) parts.push(`${c.honor} ${c.honor === 1 ? "was an honor resolution" : "were honor resolutions"} (remembering or commending people)`);
  if (c.otherPassed) parts.push(`${c.otherPassed} also passed the General Assembly`);
  if (c.failed) parts.push(`${c.failed} did not pass (defeated, stricken, or folded into another bill)`);
  if (c.tabled) parts.push(`${c.tabled} ${c.tabled === 1 ? "was" : "were"} left in committee or continued to 2027`);
  return parts;
}
export function joinPlain(parts: string[]) {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

const PARTY_LABEL = { D: "Democrat", R: "Republican" } as const;
const honorific = (m: GaMember) => (m.chamber === "house" ? "Del." : "Sen.");

/** Short, data-only description for search results and link previews. */
export function memberDescription(m: GaMember, meta: GaMeta) {
  const c = breakdownBills(m.bills);
  const bits: string[] = [];
  if (c.total) bits.push(`${plural(c.total, "bill or resolution", "bills and resolutions")} as chief patron in 2026${c.signed ? ` (${c.signed} signed into law)` : ""}`);
  if (m.votes.total) bits.push(`${plural(m.votes.total, "floor roll call", "floor roll calls")} on record`);
  if (m.committees.length) bits.push(`committees: ${m.committees.join(", ")}`);
  const lead = `${honorific(m)} ${m.name} (${PARTY_LABEL[m.party]}), District ${m.district}, ${m.chamber === "house" ? "Virginia House of Delegates" : "Senate of Virginia"}.`;
  const body = bits.length ? ` From official LIS records: ${bits.join("; ")}.` : "";
  return `${lead}${body} Data as of ${dateLabel(meta.generated)}.`;
}

export function memberTitle(m: GaMember) {
  return `${honorific(m)} ${m.name} (${m.party}, District ${m.district}) · A Guy on X`;
}

/** Head tags for a member profile. og:image and twitter:image / card come from the root route (the site image). */
export function memberHead(m: GaMember, meta: GaMeta) {
  const title = memberTitle(m);
  const description = memberDescription(m, meta);
  const url = `https://aguyonx.com/dashboards/${m.chamber}/members/${m.slug}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
