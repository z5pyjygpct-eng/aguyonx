export type NewsScope = "statewide" | "local";

export type NewsOffice =
  | "Governor"
  | "Attorney General"
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
    id: "spanberger-digital-service-vascope-2026-09-08",
    date: "2026-09-08",
    filed: "2026-09-09",
    headline: "Spanberger is creating a new state technology team",
    outlet: "Virginia Scope",
    url: "https://www.virginiascope.com/spanberger-is-creating-a-new-state-technology-team/",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "loudoun-supervisor-salary-hearing-loudounnow-2026-09-08",
    date: "2026-09-08",
    filed: "2026-09-09",
    headline: "Loudoun Supervisors Set Public Hearing for 30% Salary Increases",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/loudoun-supervisors-set-public-hearing-for-30-salary-increases/article_cd0b4b1a-9fbb-4a98-b716-6e228471305f.html",
    people: [
      { name: "Juli Briskman", office: "Loudoun Supervisor" },
      { name: "Sylvia Glass", office: "Loudoun Supervisor" },
      { name: "Laura TeKrony", office: "Loudoun Supervisor" },
      { name: "Kristen Umstattd", office: "Loudoun Supervisor" },
      { name: "Phyllis Randall", office: "Loudoun Chair" },
    ],
    scope: "local",
  },
  {
    id: "zargarpur-coles-supervisor-2027-insidenova-2026-06-09",
    date: "2026-06-09",
    filed: "2026-09-09",
    headline:
      "Prince William School Board member Zargarpur launches campaign for Coles District supervisor",
    outlet: "InsideNoVa",
    url: "https://www.insidenova.com/news/prince_william/prince-william-school-board-member-zargarpur-launches-campaign-for-coles-district-supervisor/article_0668db75-1b52-4bff-b287-61e94a36cee7.html",
    people: [
      { name: "Lisa Zargarpur", office: "Prince William official" },
      { name: "James Walkinshaw", office: "U.S. Representative" },
      { name: "Jeremy McPike", office: "State Senator" },
    ],
    scope: "local",
  },
  {
    id: "fairfax-city-chain-bridge-housing-ffxnow-2026-08-04",
    date: "2026-08-04",
    filed: "2026-09-08",
    headline:
      "Fairfax City Council split over housing plan for Chain Bridge Road office parcel",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/08/04/fairfax-city-council-split-over-housing-plan-for-chain-bridge-road-office-parcel/",
    people: [{ name: "Stacy Hall", office: "Fairfax official" }],
    scope: "local",
  },
  {
    id: "loudoun-aspen-barrister-substations-loudounnow-2026-07-08",
    date: "2026-07-08",
    filed: "2026-09-08",
    headline: "After Delays, Supervisors Approve 2 Substations",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/after-delays-supervisors-approve-2-substations/article_cf6e6191-338d-4284-990e-b0309dc64827.html",
    people: [
      { name: "Juli Briskman", office: "Loudoun Supervisor" },
      { name: "Kristen Umstattd", office: "Loudoun Supervisor" },
      { name: "Matt Letourneau", office: "Loudoun Supervisor" },
      { name: "Mike Turner", office: "Loudoun Supervisor" },
    ],
    scope: "local",
  },
  {
    id: "loudoun-54b-budget-adopt-loudounnow-2026-04-08",
    date: "2026-04-08",
    filed: "2026-09-08",
    headline: "Loudoun Supervisors Adopt $5.4B Budget",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/loudoun-supervisors-adopt-5-4b-budget/article_6dc32fac-b2fc-45a7-90e3-0a5d8d00f1ad.html",
    people: [
      { name: "Phyllis Randall", office: "Loudoun Chair" },
      { name: "Mike Turner", office: "Loudoun Supervisor" },
      { name: "Matt Letourneau", office: "Loudoun Supervisor" },
    ],
    scope: "local",
  },
  {
    id: "loudoun-fy2027-budget-ltm-2026-04-07",
    date: "2026-04-07",
    filed: "2026-09-08",
    headline: "Board of Supervisors passes FY2027 budget",
    outlet: "Loudoun Times-Mirror",
    url: "https://www.loudountimes.com/news/politics_and_government/budget_and_tax/board-of-supervisors-passes-fy2027-budget/article_01c76b9e-e652-469a-8a2b-b6dec43b1834.html",
    people: [
      { name: "Phyllis Randall", office: "Loudoun Chair" },
      { name: "Sylvia Glass", office: "Loudoun Supervisor" },
    ],
    scope: "local",
  },
  {
    id: "pwcs-29b-budget-insidenova-2026-03-24",
    date: "2026-03-24",
    filed: "2026-09-08",
    headline: "Prince William schools sign off on nearly $3B spending plan",
    outlet: "InsideNoVa",
    url: "https://www.insidenova.com/news/prince_william/prince-william-school-board-signs-off-on-over-2-billion-spending-plan/article_4a221a44-aba7-44db-8624-d5a6ae463a89.html",
    people: [
      { name: "Babur Lateef", office: "Prince William official" },
      { name: "LaTanya McDade", office: "Prince William official" },
    ],
    scope: "local",
  },
  {
    id: "lcso-ice-info-sharing-ltm-2026-09-04",
    date: "2026-09-04",
    filed: "2026-09-08",
    headline:
      "Sheriff's Office says sharing immigrant information complies with federal enforcement agreement",
    outlet: "Loudoun Times-Mirror",
    url: "https://www.loudountimes.com/news/public_safety/sheriffs-office-says-sharing-immigrant-information-complies-with-federal-enforcement-agreement/article_aaaa4be3-ab21-47a9-8621-fc208c690d03.html",
    people: [
      { name: "Mike Chapman", office: "Loudoun official" },
      { name: "Phyllis Randall", office: "Loudoun Chair" },
    ],
    scope: "local",
  },
  {
    id: "lcso-ice-foia-field-loudounnow-2026-09-04",
    date: "2026-09-04",
    filed: "2026-09-08",
    headline:
      "Loudoun Sheriff's Office Has Turned Immigrant Information Over to ICE, Records Show",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/loudoun-sheriff-s-office-has-turned-immigrant-information-over-to-ice-records-show/article_8649efac-d9d0-47f9-8880-fc0ec19eca79.html",
    people: [
      { name: "Mike Chapman", office: "Loudoun official" },
      { name: "Phyllis Randall", office: "Loudoun Chair" },
      { name: "Koran Saines", office: "Loudoun Supervisor" },
    ],
    scope: "local",
  },
  {
    id: "lcso-287g-continue-injunction-ltm-2026-09-02",
    date: "2026-09-02",
    filed: "2026-09-08",
    headline: "Loudoun County Sheriff's Office will continue jail agreement with ICE",
    outlet: "Loudoun Times-Mirror",
    url: "https://www.loudountimes.com/news/public_safety/sheriffs-office-will-continue-jail-agreement-with-ice/article_0714a38c-128c-43c1-b9cc-65af781733dd.html",
    people: [
      { name: "Mike Chapman", office: "Loudoun official" },
      { name: "Jay Jones", office: "Attorney General" },
      { name: "Juli Briskman", office: "Loudoun Supervisor" },
    ],
    scope: "local",
  },
  {
    id: "payne-287g-injunction-wtop-2026-09-02",
    date: "2026-09-02",
    filed: "2026-09-08",
    headline:
      "Federal judge blocks new Virginia limits on existing local ICE agreements",
    outlet: "WTOP",
    url: "https://wtop.com/virginia/2026/09/federal-judge-blocks-new-virginia-limits-on-existing-local-ice-agreements/",
    people: [
      { name: "Abigail Spanberger", office: "Governor" },
      { name: "Jay Jones", office: "Attorney General" },
      { name: "Saddam Azlan Salim", office: "State Senator" },
      { name: "Alfonso Lopez", office: "State Delegate" },
    ],
    scope: "statewide",
  },
  {
    id: "fairfax-615-ice-refusals-fox-2026-07-02",
    date: "2026-07-02",
    filed: "2026-09-08",
    headline:
      "Sanctuary county refused 615 ICE transfer requests, turned over just 11 illegal immigrants, records show",
    outlet: "Fox News",
    url: "https://www.foxnews.com/politics/sanctuary-county-refused-615-ice-transfer-requests-turned-over-11-illegal-immigrants-records-show",
    people: [{ name: "Stacey Kincaid", office: "Fairfax Sheriff" }],
    scope: "local",
  },
  {
    id: "lcso-ice-ops-surge-loudounnow-2026-07-24",
    date: "2026-07-24",
    filed: "2026-09-08",
    headline:
      "Loudoun Leaders, Community Advocates Concerned About Rise in ICE Operations in County",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/loudoun-leaders-community-advocates-concerned-about-rise-in-ice-operations-in-county/article_c1d2630e-b167-4bc6-9578-39e0a399fde8.html",
    people: [
      { name: "Phyllis Randall", office: "Loudoun Chair" },
      { name: "Koran Saines", office: "Loudoun Supervisor" },
      { name: "Suhas Subramanyam", office: "U.S. Representative" },
    ],
    scope: "local",
  },
  {
    id: "lcso-287g-continue-loudounnow-2026-07-22",
    date: "2026-07-22",
    filed: "2026-09-08",
    headline: "Loudoun Jail's ICE Agreement to Continue for Now, LCSO Says",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/loudoun-jail-s-ice-agreement-to-continue-for-now-lcso-says/article_6f5d5874-0cbc-42bc-90d4-c0a54fa3efa8.html",
    people: [{ name: "Mike Chapman", office: "Loudoun official" }],
    scope: "local",
  },
  {
    id: "loudoun-460-ice-arrests-map-loudounnow-2026-05-28",
    date: "2026-05-28",
    filed: "2026-09-08",
    headline: "460 Immigrants Arrested in Loudoun Since January 2025, ICE Data Says",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/460-immigrants-arrested-in-loudoun-since-january-2025-ice-data-says/article_61557b71-ff56-4466-aa9f-6d32b43fa714.html",
    people: [{ name: "Mike Chapman", office: "Loudoun official" }],
    scope: "local",
  },
  {
    id: "lcso-253-ice-pickups-2025-loudounnow-2026-01-05",
    date: "2026-01-05",
    filed: "2026-09-08",
    headline: "Loudoun Sheriff's Office Released Over 250 Inmates to ICE In 2025",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/loudoun-sheriff-s-office-released-over-250-inmates-to-ice-in-2025/article_fb1f7d04-1d7e-4f30-b3e2-a814e1e1dbca.html",
    people: [{ name: "Mike Chapman", office: "Loudoun official" }],
    scope: "local",
  },
  {
    id: "luria-staten-ballot-suit-vascope-2026-09-04",
    date: "2026-09-04",
    filed: "2026-09-08",
    headline:
      "Luria files lawsuit against Department of Elections questioning validity of Independent candidates' signatures",
    outlet: "Virginia Scope",
    url: "https://www.virginiascope.com/luria-files-lawsuit-against-department-of-elections-questioning-validity-of-independent-candidates-signatures/",
    people: [{ name: "Elaine Luria", office: "U.S. Representative" }],
    scope: "statewide",
  },
  {
    id: "acpd-ice-mejia-hernandez-arlnow-2026-09-04",
    date: "2026-09-04",
    filed: "2026-09-07",
    headline:
      "ACPD opens investigation into ICE allegedly injuring man on Columbia Pike",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/04/acpd-opens-investigation-into-ice-allegedly-injuring-man-on-columbia-pike/",
    people: [
      { name: "Suhas Subramanyam", office: "U.S. Representative" },
      { name: "James Walkinshaw", office: "U.S. Representative" },
      { name: "Tim Kaine", office: "U.S. Senator" },
      { name: "Mark Warner", office: "U.S. Senator" },
    ],
    scope: "local",
  },
  {
    id: "spanberger-nextera-special-session-vabusiness-2026-09-04",
    date: "2026-09-04",
    filed: "2026-09-07",
    headline:
      "Spanberger won't call special session to extend Dominion-NextEra merger deadline",
    outlet: "Virginia Business",
    url: "https://virginiabusiness.com/spanberger-wont-call-special-session-to-extend-dominion-nextera-merger-deadline/",
    people: [
      { name: "Abigail Spanberger", office: "Governor" },
      { name: "Danica Roem", office: "State Senator" },
      { name: "Jeremy McPike", office: "State Senator" },
      { name: "Barbara Favola", office: "State Senator" },
      { name: "Elizabeth Bennett-Parker", office: "State Senator" },
      { name: "Elizabeth Guzman", office: "State Delegate" },
    ],
    scope: "statewide",
  },
  {
    id: "purcellville-khalil-successor-ltm-2026-09-04",
    date: "2026-09-04",
    filed: "2026-09-07",
    headline:
      "New Purcellville Town Council member to be appointed to fill vacancy",
    outlet: "Loudoun Times-Mirror",
    url: "https://www.loudountimes.com/news/politics_and_government/elections/new-purcellville-town-council-member-to-be-appointed-to-fill-vacancy/article_5c9c8eaa-f8c3-471b-86bb-10195849a1c0.html",
    people: [{ name: "Susan Khalil", office: "Loudoun official" }],
    scope: "local",
  },
  {
    id: "arlington-ga-condemn-ice-wtop-2026-09-04",
    date: "2026-09-04",
    filed: "2026-09-07",
    headline:
      "Arlington lawmakers condemn ICE actions after man allegedly seriously injured in encounter",
    outlet: "WTOP",
    url: "https://wtop.com/virginia/2026/09/arlington-lawmakers-condemn-ice-actions-after-man-allegedly-seriously-injured-in-encounter/",
    people: [
      { name: "Barbara Favola", office: "State Senator" },
      { name: "Elizabeth Bennett-Parker", office: "State Senator" },
      { name: "Patrick Hope", office: "State Delegate" },
      { name: "Adele McClure", office: "State Delegate" },
      { name: "Alfonso Lopez", office: "State Delegate" },
    ],
    scope: "local",
  },
  {
    id: "scott-nextera-scc-letter-vamercury-2026-09-03",
    date: "2026-09-03",
    filed: "2026-09-07",
    headline:
      "Va. House speaker details 'concerns' about NextEra-Dominion merger in letter to state regulators",
    outlet: "Virginia Mercury",
    url: "https://virginiamercury.com/2026/09/03/va-house-speaker-scott-details-concerns-about-nextera-dominion-merger-in-letter-to-state-regulators/",
    people: [{ name: "Don Scott", office: "State Delegate" }],
    scope: "statewide",
  },
  {
    id: "spanberger-nextera-special-session-decline-vascope-2026-09-03",
    date: "2026-09-03",
    filed: "2026-09-04",
    headline:
      "Spanberger declines to call second special session for consideration of merger review extension",
    outlet: "Virginia Scope",
    url: "https://www.virginiascope.com/spanberger-declines-to-call-second-special-session-for-consideration-of-merger-review-extension/",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "spanberger-flock-cameras-wtop-2026-09-03",
    date: "2026-09-03",
    filed: "2026-09-04",
    headline: "Va. governor says calls to ban Flock license reader cameras 'overly simplistic'",
    outlet: "WTOP",
    url: "https://wtop.com/virginia/2026/09/va-governor-considers-calls-to-ban-flock-license-reader-cameras-overly-simplistic/",
    people: [
      { name: "Abigail Spanberger", office: "Governor" },
      { name: "Lashrecse Aird", office: "State Senator" },
    ],
    scope: "statewide",
  },
  {
    id: "lucas-wiretap-letters-vascope-2026-09-03",
    date: "2026-09-03",
    filed: "2026-09-04",
    headline:
      "A second round of letters notifies individuals that their calls with Sen. Louise Lucas were tapped",
    outlet: "Virginia Scope",
    url: "https://www.virginiascope.com/a-second-round-of-letters-notifies-individuals-that-their-calls-with-sen-louise-lucas-were-tapped/",
    people: [{ name: "L. Louise Lucas", office: "State Senator" }],
    scope: "statewide",
  },
  {
    id: "descano-recall-petition-ffxtimes-2026-09-04",
    date: "2026-09-04",
    headline: "Mother petitions to recall Descano",
    outlet: "Fairfax County Times",
    url: "https://www.fairfaxtimes.com/articles/mother-petitions-to-recall-descano/article_3cb15831-5fb6-4365-b8b0-e3b79a7f2b30.html",
    people: [{ name: "Steve Descano", office: "Fairfax Commonwealth's Attorney" }],
    scope: "local",
  },
  {
    id: "va-job-losses-data-centers-cardinal-2026-09-03",
    date: "2026-09-03",
    headline:
      "Virginia's job losses are accelerating, economic report says. Data center construction may be propping up the economy.",
    outlet: "Cardinal News",
    url: "https://cardinalnews.org/2026/09/03/virginias-job-losses-are-accelerating-economic-report-says-data-center-construction-may-be-propping-up-the-economy/",
    people: [
      { name: "Abigail Spanberger", office: "Governor" },
      { name: "L. Louise Lucas", office: "State Senator" },
    ],
    scope: "statewide",
  },
  {
    id: "spanberger-jahelka-weighs-in-wjla-2026-09-02",
    date: "2026-09-02",
    filed: "2026-09-03",
    headline: "Governor Spanberger weighs in after man involved in Fairfax murder case leaves country",
    outlet: "WJLA",
    url: "https://wjla.com/news/local/governor-spanberger-weighs-in-after-man-involved-in-fairfax-county-murder-case-leaves-country-alexander-jahelka-september-2026",
    people: [
      { name: "Abigail Spanberger", office: "Governor" },
      { name: "Steve Descano", office: "Fairfax Commonwealth's Attorney" },
    ],
    scope: "local",
  },
  {
    id: "loudoun-data-center-grandfather-2026-09-02",
    date: "2026-09-02",
    filed: "2026-09-03",
    headline:
      "'Turn Over Every Rock': Loudoun Supervisors Ask for Legal Opinion on Ending Grandfathered Data Center Protections",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/turn-over-every-rock-loudoun-supervisors-ask-for-legal-opinion-on-ending-grandfathered-data-center/article_588795b5-8135-486a-84a7-86b1b33e5501.html",
    people: [
      { name: "Phyllis Randall", office: "Loudoun Chair" },
      { name: "Juli Briskman", office: "Loudoun Supervisor" },
      { name: "Laura TeKrony", office: "Loudoun Supervisor" },
    ],
    scope: "local",
  },
  {
    id: "descano-jahelka-release-fox5-2026-09-01",
    date: "2026-09-01",
    filed: "2026-09-03",
    headline: "Another accused killer released from Virginia mental health facility after insanity plea",
    outlet: "FOX 5 DC",
    url: "https://www.fox5dc.com/news/another-accused-killer-released-from-virginia-mental-health-facility-after-insanity-plea",
    people: [{ name: "Steve Descano", office: "Fairfax Commonwealth's Attorney" }],
    scope: "local",
  },
  {
    id: "spanberger-beef-imports-cardinal-2026-09-02",
    date: "2026-09-02",
    headline: "Spanberger has a beef with Trump over beef imports. So do some Virginia farmers.",
    outlet: "Cardinal News",
    url: "https://cardinalnews.org/2026/09/02/spanberger-has-a-beef-with-trump-over-beef-imports-so-do-some-virginia-farmers/",
    people: [
      { name: "Abigail Spanberger", office: "Governor" },
      { name: "Sam Rasoul", office: "State Delegate" },
    ],
    scope: "statewide",
  },
  {
    id: "wapo-felon-voting-gibney-2026-09-01",
    date: "2026-09-01",
    headline: "Virginia was ordered to stop barring many felons from voting. The issue persists.",
    outlet: "Washington Post",
    url: "https://valawyersweekly.com/2026/09/01/virginia-federal-court-orders-halt-to-illegal-felon-voter-disenfranchisement/",
    people: [
      { name: "Jay Jones", office: "Attorney General" },
      { name: "Abigail Spanberger", office: "Governor" },
      { name: "Mamie Locke", office: "State Senator" },
    ],
    scope: "statewide",
  },
  {
    id: "wric-287g-injunction-2026-09-01",
    date: "2026-09-01",
    headline: "Federal judge temporarily blocks Virginia law regulating how local law enforcement participate in ICE activities",
    outlet: "WRIC",
    url: "https://www.wric.com/news/virginia-news/federal-judge-injunction-287g-agreements/",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
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
    id: "umstattd-loudoun-no-reelection-2026-08-31",
    date: "2026-08-31",
    filed: "2026-09-02",
    headline: "Umstattd Will Not Seek Reelection in 2027",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/umstattd-will-not-seek-reelection-in-2027/article_fb07c580-02db-4dc6-9187-7574a0451841.html",
    people: [{ name: "Kristen Umstattd", office: "Loudoun Supervisor" }],
    scope: "local",
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
    id: "descano-jordan-stonewall-2026-08-24",
    date: "2026-08-24",
    filed: "2026-09-02",
    headline: "Fairfax prosecutor accused of stonewalling Congressional illegal immigration investigation",
    outlet: "WJLA",
    url: "https://wjla.com/news/local/fairfax-county-commonwealths-attorney-steve-descano-house-judiciary-committee-jim-jordan-tom-mcclintock-congress-investigation-immigration-defendants-prosecution-policies-plea-deals-abdul-jalloh-stephanie-minter-murder-charges-records-nolle-prosequi",
    people: [{ name: "Steve Descano", office: "Fairfax Commonwealth's Attorney" }],
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
