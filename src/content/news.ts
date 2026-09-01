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
,
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
