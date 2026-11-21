/**
 * 2027 Election Dashboard (/2027) buttons. Every locality links to its /2027/<slug> page (one shared template);
 * "soon" localities have no own 2027 race data yet and show the Coming soon tag. No counts here.
 */
export type E27Button = { label: string; slug: string; to: string; search?: Record<string, string>; hash?: string; soon?: boolean };

export const E27_GA: E27Button[] = [
  { label: "Virginia Delegates", slug: "house", to: "/2027/delegates" },
  { label: "Virginia Senate", slug: "senate", to: "/2027/senate" },
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

export const E27_LOCAL: E27Button[] = LOCAL.map((l) => ({ label: l.label, slug: l.slug, to: `/2027/${l.slug}`, ...(l.soon ? { soon: true } : {}) }));

export const E27_SOON = new Map(E27_LOCAL.filter((b) => b.soon).map((b) => [b.slug, b.label]));
export const E27_NEWS_SHOWN = 10;
