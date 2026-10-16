export type NewsScope = "statewide" | "local";

export type NewsOffice =
  | "Governor"
  | "Attorney General"
  | "Lieutenant Governor"
  | "U.S. Senator"
  | "U.S. Representative"
  | "State Senator"
  | "State Delegate"
  | "Loudoun Supervisor"
  | "Loudoun Chair"
  | "Loudoun Commonwealth's Attorney candidate"
  | "Loudoun official"
  | "Fairfax Sheriff"
  | "Fairfax Commonwealth's Attorney"
  | "Fairfax official"
  | "Prince William Commonwealth's Attorney"
  | "Prince William official"
  | "Arlington Commonwealth's Attorney"
  | "Arlington official";

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
    id: "missing-middle-arguments-head-virginia-supreme-arlnow-2026-10-15",
    date: "2026-10-15",
    headline: "Missing Middle arguments head to the Virginia Supreme Court this month",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/10/15/missing-middle-arguments-head-to-the-virginia-supreme-court-this-month/",
    people: [],
    scope: "local",
  },
  {
    id: "acpd-suspects-stabbed-employee-threw-rocks-arlnow-2026-10-15",
    date: "2026-10-15",
    headline: "ACPD: Suspects stabbed employee, threw rocks at Ballston business",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/10/15/acpd-suspects-stabbed-employee-threw-rocks-at-ballston-business/",
    people: [],
    scope: "local",
  },
  {
    id: "e-care-disposal-event-returns-arlington-arlnow-2026-10-15",
    date: "2026-10-15",
    headline: "E-CARE disposal event returns to Arlington this weekend",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/10/15/e-care-disposal-event-returns-to-arlington-this-weekend/",
    people: [],
    scope: "local",
  },
  {
    id: "big-clock-pentagon-city-broken-frozen-arlnow-2026-10-15",
    date: "2026-10-15",
    headline: "The big clock in Pentagon City is broken, frozen at 10:17",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/10/15/the-big-clock-in-pentagon-city-is-broken-frozen-at-1017/",
    people: [],
    scope: "local",
  },
  {
    id: "county-seeks-feedback-oakton-community-park-ffxnow-2026-10-15",
    date: "2026-10-15",
    headline: "County seeks feedback on new amenities proposed for Oakton Community Park",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/10/15/county-seeks-feedback-on-new-amenities-proposed-for-oakton-community-park/",
    people: [],
    scope: "local",
  },
  {
    id: "volunteer-fire-departments-fairfax-brace-ffxnow-2026-10-15",
    date: "2026-10-15",
    headline: "Volunteer fire departments in Fairfax brace for new year of change, commission chair says",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/10/15/fairfaxs-volunteer-fire-departments-succeed-despite-challenges-commission-chair-says/",
    people: [],
    scope: "local",
  },
  {
    id: "olympic-medalists-join-fcps-water-safety-ffxnow-2026-10-15",
    date: "2026-10-15",
    headline: "Olympic medalists join FCPS to kick off new water safety program for kids",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/10/15/fcps-kicks-off-water-safety-program-for-kids-with-visits-from-olympic-medalists/",
    people: [],
    scope: "local",
  },
  {
    id: "fcpd-herndon-man-charged-sell-drugs-gun-ffxnow-2026-10-15",
    date: "2026-10-15",
    headline: "FCPD: Herndon man charged after trying to sell drugs for a gun",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/10/15/fcpd-herndon-man-charged-after-trying-to-sell-drugs-for-a-gun/",
    people: [],
    scope: "local",
  },
  {
    id: "county-targets-empty-land-innovation-center-ffxnow-2026-10-15",
    date: "2026-10-15",
    headline: "County targets empty land near Innovation Center Metro for affordable housing",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/10/15/county-targets-empty-land-near-innovation-center-metro-for-affordable-housing/",
    people: [],
    scope: "local",
  },
  {
    id: "washington-post-plans-layoffs-springfield-ffxnow-2026-10-15",
    date: "2026-10-15",
    headline: "Washington Post plans layoffs tied to Springfield printing plant closure",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/10/15/washington-post-plans-layoffs-ahead-of-springfield-printing-plant-closure/",
    people: [],
    scope: "local",
  },
  {
    id: "from-police-cameras-school-funding-fairfax-patch-2026-10-15",
    date: "2026-10-15",
    headline: "From Police Cameras To School Funding: What Fairfax Groups Want Changed",
    outlet: "Patch",
    url: "https://patch.com/virginia/fairfaxcity/fairfax-naacp-unveils-plan-targeting-housing-police-surveillance-schools",
    people: [],
    scope: "local",
  },
  {
    id: "loaded-firearms-waistband-herndon-teen-fox5-2026-10-15",
    date: "2026-10-15",
    headline: "Loaded firearms found in waistband of Herndon teen after foot pursuit, Fairfax County police say",
    outlet: "FOX 5 DC",
    url: "https://www.fox5dc.com/news/loaded-firearms-found-waistband-herndon-teen-after-foot-pursuit-fairfax-county-police-say",
    people: [],
    scope: "local",
  },
  {
    id: "loudoun-supervisors-advance-30-compensation-loudounnow-2026-10-15",
    date: "2026-10-15",
    headline: "Loudoun Supervisors Advance 30% Compensation Increases",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/loudoun-supervisors-advance-30-compensation-increases/article_e7abfe7e-7b64-4995-85c3-89281a2cd3fe.html",
    people: [],
    scope: "local",
  },
  {
    id: "school-board-discusses-return-showing-public-speakers-loudounnow-2026-10-15",
    date: "2026-10-15",
    headline: "School Board Discusses Return to Showing Public Speakers on Meeting Broadcasts",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/school-board-discusses-return-to-showing-public-speakers-on-meeting-broadcasts/article_bfd1e34e-b4a0-4221-9062-06a06e7eaa09.html",
    people: [],
    scope: "local",
  },
  {
    id: "school-board-approves-resource-hub-proposal-loudounnow-2026-10-15",
    date: "2026-10-15",
    headline: "School Board Approves Resource Hub Proposal",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/education/school-board-approves-resource-hub-proposal/article_9ec0ca9f-6b3c-4a28-a763-bfb4aa2d1f3c.html",
    people: [],
    scope: "local",
  },
  {
    id: "school-board-first-look-eastern-loudoun-boundaries-loudounnow-2026-10-15",
    date: "2026-10-15",
    headline: "School Board Takes First Look at Eastern Loudoun Elementary School Boundary Changes",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/school-board-takes-first-look-at-eastern-loudoun-elementary-school-boundary-changes/article_64844b25-7cd0-46f3-8e6d-56a55db84f21.html",
    people: [],
    scope: "local",
  },
  {
    id: "body-found-abandoned-sterling-home-loudounnow-2026-10-15",
    date: "2026-10-15",
    headline: "Body Found in Abandoned Sterling Home",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/body-found-in-abandoned-sterling-home/article_d93017d5-720b-47e6-92e3-5c7077146e81.html",
    people: [],
    scope: "local",
  },
  {
    id: "judge-allows-modified-subpoenas-purcellville-loudounnow-2026-10-15",
    date: "2026-10-15",
    headline: "Judge Allows Modified Subpoenas in Purcellville Vice Mayor’s Case Ahead of Trial",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/judge-allows-modified-subpoenas-in-purcellville-vice-mayor-s-case-ahead-of-trial/article_78c0e278-af61-45d5-bcb4-d1cbe9c70a34.html",
    people: [],
    scope: "local",
  },
  {
    id: "friends-blue-ridge-mountains-honor-tekrony-loudounnow-2026-10-15",
    date: "2026-10-15",
    headline: "Friends of the Blue Ridge Mountains Honor TeKrony, Kaine",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/community_news/friends-of-the-blue-ridge-mountains-honor-tekrony-kaine/article_78c7a00e-66ef-4c3c-beb3-416103692cd7.html",
    people: [],
    scope: "local",
  },
  {
    id: "kevin-ash-plans-condo-project-middleburg-ltm-2026-10-15",
    date: "2026-10-15",
    headline: "Kevin Ash plans condo project in Middleburg",
    outlet: "Loudoun Times-Mirror",
    url: "https://www.loudountimes.com/news/kevin-ash-plans-condo-project-in-middleburg/article_5e53290a-73ab-4e47-aec8-68f29744bf3d.html",
    people: [],
    scope: "local",
  },
  {
    id: "dumfries-holds-town-hall-paused-flock-potomaclocal-2026-10-15",
    date: "2026-10-15",
    headline: "Dumfries holds town hall tonight on paused Flock cameras",
    outlet: "Potomac Local",
    url: "https://www.potomaclocal.com/2026/10/15/dumfries-holds-town-hall-tonight-on-paused-flock-cameras/",
    people: [],
    scope: "local",
  },
  {
    id: "district-hemp-closes-manassas-store-potomaclocal-2026-10-15",
    date: "2026-10-15",
    headline: "District Hemp closes Manassas store after Spanberger’s new hemp rules",
    outlet: "Potomac Local",
    url: "https://www.potomaclocal.com/2026/10/15/district-hemp-closes-manassas-store-after-spanbergers-new-hemp-rules/",
    people: [],
    scope: "local",
  },
  {
    id: "police-blotter-ice-arrests-woodbridge-crash-potomaclocal-2026-10-15",
    date: "2026-10-15",
    headline: "Police Blotter: ICE arrests man with child sex abuse material conviction; passenger dies in Woodbridge crash",
    outlet: "Potomac Local",
    url: "https://www.potomaclocal.com/2026/10/15/police-blotter-2026-10-15/",
    people: [],
    scope: "local",
  },
  {
    id: "woodbridge-woman-83-killed-dale-boulevard-insidenova-2026-10-15",
    date: "2026-10-15",
    headline: "Woodbridge woman, 83, killed in Dale Boulevard crash",
    outlet: "InsideNoVa",
    url: "https://www.insidenova.com/headlines/woodbridge-woman-83-killed-in-dale-boulevard-crash/article_c1d3b2c1-9395-47ca-a8e7-8c4e103b8570.html",
    people: [],
    scope: "local",
  },
  {
    id: "investigator-describes-blood-evidence-bhatt-pwt-2026-10-15",
    date: "2026-10-15",
    headline: "Investigator describes blood, other evidence found in Bhatt’s home after Mamta disappeared",
    outlet: "Prince William Times",
    url: "https://www.princewilliamtimes.com/localnews/investigator-describes-blood-other-evidence-found-in-bhatt-s-home-after-mamta-disappeared/article_6411e545-b3c9-4414-a827-1fb16b086b51.html",
    people: [],
    scope: "local",
  },

