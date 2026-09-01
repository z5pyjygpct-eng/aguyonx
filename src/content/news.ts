export type NewsScope = "statewide" | "local";

export type NewsItem = {
  id: string;
  date: string;
  headline: string;
  outlet: string;
  url: string;
  about: string[];
  scope: NewsScope;
  advocacy?: boolean;
};

/** Public-outlet headlines only. Never invent stories. Fairfax GOP would be advocacy if used. */
export const NEWS: NewsItem[] = [
  {
    id: "jones-federal-overreach-unit-2026-08-27",
    date: "2026-08-27",
    headline: "Virginia attorney general creates unit to challenge Trump administration actions",
    outlet: "WJLA",
    url: "https://wjla.com/news/local/virginia-attorney-general-jay-jones-federal-overreach-trump-administration-accountability-unit-government-legal-challenge-lawsuits-tariffs-doge-elections-healthcare-immigration-protections-rights",
    about: ["Jay Jones"],
    scope: "statewide",
  },
  {
    id: "spanberger-medicaid-snap-eo-2026-08-26",
    date: "2026-08-26",
    headline: "Gov. Spanberger signs executive order to help fill the gap in federal funding for Medicaid and SNAP",
    outlet: "Virginia Scope",
    url: "https://www.virginiascope.com/gov-spanberger-signs-executive-order-to-help-fill-the-gap-in-federal-funding-for-medicaid-and-snap/",
    about: ["Abigail Spanberger"],
    scope: "statewide",
  },
  {
    id: "jones-meta-settlement-2026-08-26",
    date: "2026-08-26",
    headline: "Virginia to receive $353 million in landmark Meta child-safety settlement",
    outlet: "Virginia Mercury",
    url: "https://virginiamercury.com/2026/08/26/virginia-to-receive-353-million-in-landmark-meta-child-safety-settlement/",
    about: ["Jay Jones"],
    scope: "statewide",
  },
  {
    id: "briskman-loudoun-chair-2026-08-25",
    date: "2026-08-25",
    headline: "Briskman Announces Bid for Loudoun County Chair",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/briskman-announces-bid-for-loudoun-county-chair/article_f7fc36f1-df9a-4e0b-9288-4b98349f9063.html",
    about: ["Juli Briskman", "Phyllis Randall"],
    scope: "local",
  },
];

export function newsNewestFirst(items: NewsItem[] = NEWS): NewsItem[] {
  return [...items].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

export function formatNewsDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const NEWS_DEK =
  "This is an index of already-public headlines. Links go to the original outlet. We keep the list.";

export const NEWS_EMPTY =
  "Nothing on this shelf yet. Weekday mornings we index already-public headlines about Governor Spanberger, Attorney General Jay Jones, House and Senate Democrats, and newsworthy local Democrats. Tips and corrections: @VaChangeAgent on X.";
