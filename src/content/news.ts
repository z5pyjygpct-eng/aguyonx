export type NewsScope = "statewide" | "local";

export type NewsOffice =
  | "Governor"
  | "Attorney General"
  | "State Senator"
  | "State Delegate"
  | "Loudoun Supervisor"
  | "Loudoun Chair"
  | "Fairfax official"
  | "Prince William official";

export type NewsPerson = {
  name: string;
  office: NewsOffice;
};

export type NewsItem = {
  id: string;
  date: string;
  headline: string;
  outlet: string;
  url: string;
  people: NewsPerson[];
  scope: NewsScope;
  advocacy?: boolean;
};

export function personChip(person: NewsPerson): string {
  return `${person.name} · ${person.office}`;
}

export function peopleSearchText(people: NewsPerson[]): string {
  return people.map((p) => `${p.name} ${p.office}`).join(" ");
}

/** Public-outlet headlines only. Never invent stories. Fairfax GOP would be advocacy if used. */
export const NEWS: NewsItem[] = [
  {
    id: "spanberger-revenue-team-2026-08-31",
    date: "2026-08-31",
    headline: "Spanberger looks near and far as she appoints revenue team",
    outlet: "Richmond Times-Dispatch",
    url: "https://richmond.com/news/state-regional/government-politics/article_25ae42fa-b447-406b-9f73-27f5918be578.html",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "dominion-nextera-special-session-2026-08-31",
    date: "2026-08-31",
    headline: "Group of lawmakers requests Special Session to review Dominion-NextEra merger",
    outlet: "WWBT",
    url: "https://www.12onyourside.com/2026/08/31/group-lawmakers-ask-special-session-review-dominion-nextera-merger/",
    people: [
      { name: "Scott Surovell", office: "State Senator" },
      { name: "Mamie Locke", office: "State Senator" },
      { name: "L. Louise Lucas", office: "State Senator" },
      { name: "Don Scott", office: "State Delegate" },
      { name: "Charniele Herring", office: "State Delegate" },
      { name: "Kathy Tran", office: "State Delegate" },
      { name: "Abigail Spanberger", office: "Governor" },
    ],
    scope: "statewide",
  },
  {
    id: "jones-ice-local-enforcement-2026-08-28",
    date: "2026-08-28",
    headline:
      "Virginia AG Jay Jones cracks down on local law enforcement operations with ICE",
    outlet: "WJLA",
    url: "https://wjla.com/news/local/virginia-attorney-general-jay-jones-greene-county-sheriff-steven-smith-ice-immigration-enforcement-traffic-stops-arrests-investigation-civil-rights-abigail-spanberger-287g-agreements-karen-hamilton-jonathan-fahey-us-route-29-albemarle-deputies-federal",
    people: [
      { name: "Jay Jones", office: "Attorney General" },
      { name: "Abigail Spanberger", office: "Governor" },
    ],
    scope: "statewide",
  },
  {
    id: "jones-federal-overreach-unit-2026-08-27",
    date: "2026-08-27",
    headline: "Virginia attorney general creates unit to challenge Trump administration actions",
    outlet: "WJLA",
    url: "https://wjla.com/news/local/virginia-attorney-general-jay-jones-federal-overreach-trump-administration-accountability-unit-government-legal-challenge-lawsuits-tariffs-doge-elections-healthcare-immigration-protections-rights",
    people: [{ name: "Jay Jones", office: "Attorney General" }],
    scope: "statewide",
  },
  {
    id: "spanberger-medicaid-snap-eo-2026-08-26",
    date: "2026-08-26",
    headline: "Gov. Spanberger signs executive order to help fill the gap in federal funding for Medicaid and SNAP",
    outlet: "Virginia Scope",
    url: "https://www.virginiascope.com/gov-spanberger-signs-executive-order-to-help-fill-the-gap-in-federal-funding-for-medicaid-and-snap/",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "jones-meta-settlement-2026-08-26",
    date: "2026-08-26",
    headline: "Virginia to receive $353 million in landmark Meta child-safety settlement",
    outlet: "Virginia Mercury",
    url: "https://virginiamercury.com/2026/08/26/virginia-to-receive-353-million-in-landmark-meta-child-safety-settlement/",
    people: [{ name: "Jay Jones", office: "Attorney General" }],
    scope: "statewide",
  },
  {
    id: "briskman-loudoun-chair-2026-08-25",
    date: "2026-08-25",
    headline: "Briskman Announces Bid for Loudoun County Chair",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/briskman-announces-bid-for-loudoun-county-chair/article_f7fc36f1-df9a-4e0b-9288-4b98349f9063.html",
    people: [
      { name: "Juli Briskman", office: "Loudoun Supervisor" },
      { name: "Phyllis Randall", office: "Loudoun Chair" },
    ],
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
