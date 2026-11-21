/**
 * 2027 Election Dashboard (/2027) buttons. Localities with 2027 race data link to the race directory
 * filtered to that locality; the rest link to a plain "Coming soon" page (/2027/$locality). No counts here.
 */
export type E27Button = { label: string; slug: string; to: string; search?: Record<string, string>; hash?: string; soon?: boolean };

export const E27_GA: E27Button[] = [
  { label: "Virginia Delegates", slug: "house", to: "/2027/races", search: { office: "house" } },
  { label: "Virginia Senate", slug: "senate", to: "/2027/races", search: { office: "senate" } },
];

/** Ids are the locality ids in src/lib/elections-2027-{bos,sb,co}.json. */
const LOCAL: { label: string; slug: string; soon?: boolean }[] = [
  { label: "Albemarle", slug: "albemarle" },
  { label: "Chesterfield", slug: "chesterfield" },
  { label: "Fairfax", slug: "fairfax-county" },
  { label: "Fairfax City", slug: "fairfax-city", soon: true },
  { label: "Hanover", slug: "hanover", soon: true },
  { label: "Henrico", slug: "henrico" },
  { label: "Loudoun", slug: "loudoun" },
  { label: "Manassas", slug: "manassas", soon: true },
  { label: "Prince William", slug: "prince-william" },
];

export const E27_LOCAL: E27Button[] = LOCAL.map((l) =>
  l.soon
    ? { label: l.label, slug: l.slug, to: `/2027/${l.slug}`, soon: true }
    : { label: l.label, slug: l.slug, to: "/2027/races", search: { r_loc: l.slug }, hash: "races" },
);

export const E27_SOON = new Map(E27_LOCAL.filter((b) => b.soon).map((b) => [b.slug, b.label]));
export const E27_LIVE = new Map(E27_LOCAL.filter((b) => !b.soon).map((b) => [b.slug, b]));
export const E27_NEWS_SHOWN = 10;
