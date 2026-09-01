export type NewsScope = "statewide" | "local";

export type NewsOffice =
  | "Governor"
  | "Attorney General"
  | "State Senator"
  | "State Delegate"
  | "Loudoun Supervisor"
  | "Loudoun Chair"
  | "Loudoun Commonwealth's Attorney candidate"
  | "Fairfax Sheriff"
  | "Fairfax Commonwealth's Attorney"
  | "Fairfax official"
  | "Prince William Commonwealth's Attorney"
  | "Prince William official";

export type NewsPerson = {
  name: string;
  office: NewsOffice;
};

export type NewsItem = {
  id: string;
  /** Outlet publication date (YYYY-MM-DD). Primary date; sort key. */
  date: string;
  /** When we filed the clip on the News shelf, if later than `date`. Omit when same as story date. */
  filed?: string;
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
    id: "kincaid-descano-fairfax-high-ice-2026-08-31",
    date: "2026-08-31",
    headline: "Illegal immigrant who groped girls at Fairfax High School released to ICE",
    outlet: "WJLA",
    url: "https://wjla.com/news/local/illegal-immigrant-who-groped-girls-fairfax-high-school-released-from-jail-israel-flores-ortiz-fairfax-county-sheriff-kincaid-descano-immigration-sanctuary-policies",
    people: [
      { name: "Stacey Kincaid", office: "Fairfax Sheriff" },
      { name: "Steve Descano", office: "Fairfax Commonwealth's Attorney" },
    ],
    scope: "local",
  },
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
    id: "spanberger-voting-rights-100k-2026-08-29",
    date: "2026-08-29",
    filed: "2026-09-01",
    headline: "Gov. Spanberger announces right to vote restored for 100,000 formerly incarcerated Virginians",
    outlet: "WSLS",
    url: "https://www.wsls.com/news/local/2026/08/29/gov-spanberger-announces-right-to-vote-restored-for-100000-formerly-incarcerated-virginians/",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "descano-spanberger-passport-flight-2026-08-28",
    date: "2026-08-28",
    filed: "2026-09-01",
    headline: "Spanberger demands answers after man in Fairfax murder case obtains passport, leaves US",
    outlet: "WJLA",
    url: "https://wjla.com/news/local/spanberger-demands-answers-after-man-in-fairfax-murder-case-obtains-passport-leaves-us-virginia-steve-descano-washington",
    people: [
      { name: "Steve Descano", office: "Fairfax Commonwealth's Attorney" },
      { name: "Abigail Spanberger", office: "Governor" },
    ],
    scope: "local",
  },
  {
    id: "descano-minter-fox-recall-2026-08-28",
    date: "2026-08-28",
    filed: "2026-09-01",
    headline: "Fairfax County prosecutor Steve Descano faces recall over repeat crime",
    outlet: "Fox News",
    url: "https://www.foxnews.com/politics/soros-prosecutor-danger-removed-grieving-moms-desperate-alarm-cant-believe-this",
    people: [{ name: "Steve Descano", office: "Fairfax Commonwealth's Attorney" }],
    scope: "local",
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
    id: "fairfax-tree-commission-eqac-2026-08-26",
    date: "2026-08-26",
    filed: "2026-09-01",
    headline: "Fairfax County Dissolves Tree Commission, Replaces EQAC With Environmental Panel",
    outlet: "Patch McLean",
    url: "https://patch.com/virginia/mclean/fairfax-county-dissolves-tree-commission-replaces-eqac-environmental-panel",
    people: [
      { name: "Jeff McKay", office: "Fairfax official" },
      { name: "Kathy L. Smith", office: "Fairfax official" },
      { name: "James Bierman", office: "Fairfax official" },
      { name: "Andres Jimenez", office: "Fairfax official" },
      { name: "Rodney Lusk", office: "Fairfax official" },
      { name: "Dalia Palchik", office: "Fairfax official" },
      { name: "Rachna Sizemore Heizer", office: "Fairfax official" },
      { name: "Daniel Storck", office: "Fairfax official" },
      { name: "Walter Alcorn", office: "Fairfax official" },
    ],
    scope: "local",
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
  {
    id: "descano-recall-minter-2026-08-23",
    date: "2026-08-23",
    headline: "Mother of slain Virginia woman seeks to recall Fairfax County prosecutor",
    outlet: "Washington Times",
    url: "https://www.washingtontimes.com/news/2026/aug/23/cheryl-minter-seeks-recall-fairfax-county-prosecutor-steve-descano/",
    people: [{ name: "Steve Descano", office: "Fairfax Commonwealth's Attorney" }],
    scope: "local",
  },
  {
    id: "kincaid-spanberger-dhs-hold-2026-08-20",
    date: "2026-08-20",
    headline: "DHS Asks Spanberger To Hold Fairfax Killing Suspect; Sheriff Oversees Jail",
    outlet: "Patch McLean",
    url: "https://patch.com/virginia/mclean/dhs-asks-spanberger-hold-fairfax-killing-suspect-sheriff-oversees-jail",
    people: [
      { name: "Stacey Kincaid", office: "Fairfax Sheriff" },
      { name: "Abigail Spanberger", office: "Governor" },
    ],
    scope: "local",
  },
  {
    id: "ashworth-manassas-self-defense-2026-08-14",
    date: "2026-08-14",
    headline: "Murder charge dropped; new evidence backs Manassas mother’s self defense claim",
    outlet: "WTOP",
    url: "https://wtop.com/virginia/2026/08/murder-charge-dropped-new-evidence-backs-manassas-mothers-self-defense-claim/",
    people: [{ name: "Amy Ashworth", office: "Prince William Commonwealth's Attorney" }],
    scope: "local",
  },
  {
    id: "ruzic-loudoun-ca-2026-05-06",
    date: "2026-05-06",
    headline: "Ruzic Launches Bid for Commonwealth’s Attorney",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/ruzic-launches-bid-for-commonwealth-s-attorney/article_1c4538e0-ac09-4fb8-866f-3599a1438368.html",
    people: [{ name: "Ryan Ruzic", office: "Loudoun Commonwealth's Attorney candidate" }],
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


export function newsFiledLine(item: NewsItem): string | null {
  if (!item.filed || item.filed === item.date) return null;
  return `Filed ${formatNewsDate(item.filed)}`;
}

export const NEWS_DEK =
  "This is an index of already-public headlines. Links go to the original outlet. We keep the list.";

export const NEWS_EMPTY =
  "Nothing on this shelf yet. Weekday mornings we index already-public headlines about Governor Spanberger, Attorney General Jay Jones, House and Senate Democrats, and newsworthy local Democrats. Tips and corrections: @VaChangeAgent on X.";
