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
    id: "arlington-valn-special-grand-jury-arlnow-2026-09-24",
    date: "2026-09-24",
    filed: "2026-09-25",
    headline:
      "BREAKING: Prosecutor seeks special grand jury in fatal Columbia Pike police shooting",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/24/breaking-prosecutor-seeks-special-grand-jury-in-fatal-columbia-pike-police-shooting/",
    people: [],
    scope: "local",
  },
  {
    id: "loudoun-faith-in-housing-renu-loudounnow-2026-09-24",
    date: "2026-09-24",
    filed: "2026-09-25",
    headline:
      "Planning Commission Reviews New Affordable Housing Rules After State Law Change",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/planning-commission-reviews-new-affordable-housing-rules-after-state-law-change/article_bcb9bf36-1366-4aea-9008-487a6aff4c9d.html",
    people: [{ name: "Phyllis Randall", office: "Loudoun Chair" }],
    scope: "local",
  },
  {
    id: "fcps-alpr-flock-ban-fox5-2026-09-24",
    date: "2026-09-24",
    filed: "2026-09-25",
    headline:
      "Fairfax County Public School board votes to ban Flock cameras on school grounds",
    outlet: "FOX 5 DC",
    url: "https://www.fox5dc.com/news/fairfax-county-public-schools-vote-banning-flock-cameras-school-grounds",
    people: [],
    scope: "local",
  },
  {
    id: "arlington-ballston-park-affordable-arlnow-2026-09-24",
    date: "2026-09-24",
    filed: "2026-09-25",
    headline:
      "County considers long-term future of expiring affordable units near Ballston",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/24/county-considers-long-term-future-of-expiring-affordable-units-near-ballston/",
    people: [],
    scope: "local",
  },
  {
    id: "arlington-noisy-vehicles-hold-arlnow-2026-09-24",
    date: "2026-09-24",
    filed: "2026-09-25",
    headline: "Arlington holds off on program to crack down on noisy vehicles",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/24/arlington-holds-off-on-program-to-crack-down-on-noisy-vehicles/",
    people: [
      { name: "Abigail Spanberger", office: "Governor" },
      { name: "Rip Sullivan", office: "State Delegate" },
    ],
    scope: "local",
  },

  {
    id: "hashmi-listening-tour-roanoke-cardinal-2026-09-25",
    date: "2026-09-25",
    headline:
      "Hashmi 'listening tour' on Dominion-NextEra proposal comes to Roanoke",
    outlet: "Cardinal News",
    url: "https://cardinalnews.org/2026/09/25/hashmi-listening-tour-on-dominion-nextera-proposal-comes-to-roanoke/",
    people: [{ name: "Ghazala Hashmi", office: "Lieutenant Governor" }],
    scope: "statewide",
  },
  {
    id: "descano-minter-petition-fox-2026-09-24",
    date: "2026-09-24",
    filed: "2026-09-25",
    headline:
      "Mom fights to oust DA after daughter's accused killer had 30-plus arrests",
    outlet: "Fox News",
    url: "https://www.foxnews.com/us/angel-mom-says-blue-state-das-putting-illegal-immigrant-criminals-before-public-safety",
    people: [{ name: "Steve Descano", office: "Fairfax Commonwealth's Attorney" }],
    scope: "local",
  },
  {
    id: "descano-dunn-pirio-primary-fox-2026-09-24",
    date: "2026-09-24",
    filed: "2026-09-25",
    headline: "Fairfax County prosecutor Descano challenged by ex-federal lawyer",
    outlet: "Fox News",
    url: "https://www.foxnews.com/politics/soros-linked-prosecutor-faces-primary-challenge-fellow-democrat-targets-record",
    people: [{ name: "Steve Descano", office: "Fairfax Commonwealth's Attorney" }],
    scope: "local",
  },
  {
    id: "fairfax-i495-southside-express-ffxnow-2026-09-24",
    date: "2026-09-24",
    filed: "2026-09-25",
    headline: "VDOT returns with revised plan for I-495 Southside Express Lanes",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/24/vdot-returns-with-revised-plan-for-i-495-southside-express-lanes/",
    people: [
      { name: "Jeff McKay", office: "Fairfax official" },
      { name: "Walter Alcorn", office: "Fairfax official" },
      { name: "Dan Storck", office: "Fairfax official" },
    ],
    scope: "local",
  },
  {
    id: "spanberger-brownfields-data-centers-cardinal-2026-09-24",
    date: "2026-09-24",
    filed: "2026-09-25",
    headline:
      "Spanberger wants state to study brownfields as potential data center sites. Here are some that might qualify.",
    outlet: "Cardinal News",
    url: "https://cardinalnews.org/2026/09/24/spanberger-wants-state-to-study-brownfields-as-potential-data-center-sites-here-are-some-that-might-qualify/",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
    advocacy: true,
  },


  {
    id: "jones-snap-deadline-ruling-mercury-2026-09-24",
    date: "2026-09-24",
    headline:
      "Federal judge strikes down SNAP deadline that put Virginia at risk of added costs",
    outlet: "Virginia Mercury",
    url: "https://virginiamercury.com/2026/09/24/federal-judge-strikes-down-snap-deadline-that-put-virginia-at-risk-of-added-costs/",
    people: [{ name: "Jay Jones", office: "Attorney General" }],
    scope: "statewide",
  },
  {
    id: "pwc-vint-hill-switching-station-insidenova-2026-09-23",
    date: "2026-09-23",
    filed: "2026-09-24",
    headline:
      "Prince William supervisors vote down Dominion's Vint Hill gas-insulated switching station",
    outlet: "InsideNoVa",
    url: "https://www.insidenova.com/news/prince_william/prince-william-supervisors-vote-down-dominions-vint-hill-gas-insulated-switching-station/article_c5206b11-1d48-417c-abd4-749971f54953.html",
    people: [
      { name: "Deshundra Jefferson", office: "Prince William official" },
      { name: "Kenny Boddye", office: "Prince William official" },
      { name: "George Stewart", office: "Prince William official" },
    ],
    scope: "local",
  },
  {
    id: "descano-insanity-pleas-examiner-2026-09-21",
    date: "2026-09-21",
    filed: "2026-09-24",
    headline: "How Fairfax County keeps letting killers off with insanity pleas",
    outlet: "Washington Examiner",
    url: "https://www.washingtonexaminer.com/news/investigations/4731672/fairfax-county-killers-insanity-pleas-descano/",
    people: [{ name: "Steve Descano", office: "Fairfax Commonwealth's Attorney" }],
    scope: "local",
  },

  {
    id: "fairfax-noisy-vehicles-pilot-ffxnow-2026-09-23",
    date: "2026-09-23",
    filed: "2026-09-24",
    headline:
      "Fairfax County to start electronic monitoring for noisy vehicles in early 2027",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/23/fairfax-county-to-start-electronic-monitoring-for-noisy-vehicles-in-early-2027/",
    people: [{ name: "Jeff McKay", office: "Fairfax official" }],
    scope: "local",
  },
  {
    id: "lcps-special-permissions-delay-loudounnow-2026-09-23",
    date: "2026-09-23",
    filed: "2026-09-24",
    headline: "School Board Delays Plan to Change Special Permissions Policies",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/school-board-delays-plan-to-change-special-permissions-policies/article_39cfb1fa-b480-4551-a4dd-52bd9800d365.html",
    people: [{ name: "April Chandler", office: "Loudoun official" }],
    scope: "local",
  },
  {
    id: "lcps-cultural-holidays-calendar-loudounnow-2026-09-23",
    date: "2026-09-23",
    filed: "2026-09-24",
    headline: "School Board to Keep Cultural Holidays in School Calendar",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/school-board-to-keep-cultural-holidays-in-school-calendar/article_58b32aaf-13b7-44b7-a666-bcdb7123311c.html",
    people: [{ name: "April Chandler", office: "Loudoun official" }],
    scope: "local",
  },
  {
    id: "purcellville-special-election-deadline-loudounnow-2026-09-23",
    date: "2026-09-23",
    filed: "2026-09-24",
    headline: "Deadline Passes for Purcellville Council to Push Special Election",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/deadline-passes-for-purcellville-council-to-push-special-election/article_449aad45-f22c-4402-884e-02f291c2bc36.html",
    people: [{ name: "Susan Khalil", office: "Loudoun official" }],
    scope: "local",
  },
  {
    id: "arlington-flock-police-pushback-arlnow-2026-09-23",
    date: "2026-09-23",
    filed: "2026-09-24",
    headline:
      "Police chief pushes back on County Board vote to end Flock camera use",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/23/police-chief-pushes-back-on-county-board-vote-to-end-flock-camera-use/",
    people: [],
    scope: "local",
  },
  {
    id: "descano-dunn-pirio-primary-ffxnow-2026-09-23",
    date: "2026-09-23",
    filed: "2026-09-24",
    headline:
      "Former DOJ prosecutor seeks to unseat Commonwealth’s Attorney Steve Descano",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/23/former-fairfax-prosecutor-seeks-to-unseat-commonwealths-attorney-steve-descano/",
    people: [{ name: "Steve Descano", office: "Fairfax Commonwealth's Attorney" }],
    scope: "local",
  },
  {
    id: "arlington-board-ice-forum-arlnow-2026-09-23",
    date: "2026-09-23",
    filed: "2026-09-24",
    headline:
      "County Board candidates divided over views on ICE, parking permit changes",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/23/county-board-candidates-divided-over-views-on-ice-parking-permit-changes/",
    people: [],
    scope: "local",
  },

  {
    id: "hashmi-classroom-literature-tour-cardinal-2026-09-23",
    date: "2026-09-23",
    headline:
      "Hashmi goes back to the classroom to talk about some important books",
    outlet: "Cardinal News",
    url: "https://cardinalnews.org/2026/09/23/hashmi-goes-back-to-the-classroom-to-talk-about-some-important-books/",
    people: [{ name: "Ghazala Hashmi", office: "Lieutenant Governor" }],
    scope: "statewide",
  },
  {
    id: "spanberger-ai-congress-letter-gov-2026-09-22",
    date: "2026-09-22",
    filed: "2026-09-23",
    headline:
      "Governor Spanberger Urges Congress to Act on Unprecedented AI Risks to Protect Privacy, Jobs, & Natural Resources",
    outlet: "Office of the Governor",
    url: "https://www.governor.virginia.gov/newsroom/news-releases/2026/september-releases/name-1123817-en.html",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "spanberger-wilson-pipe-norfolk-gov-2026-09-22",
    date: "2026-09-22",
    filed: "2026-09-23",
    headline:
      "Governor Spanberger Secures $3.5 Million Investment by Wilson Pipe & Fabrication to Quadruple Footprint in Norfolk",
    outlet: "Office of the Governor",
    url: "https://www.governor.virginia.gov/newsroom/news-releases/2026/september-releases/name-1123818-en.html",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "spanberger-phasecraft-arlington-gov-2026-09-21",
    date: "2026-09-21",
    filed: "2026-09-23",
    headline:
      "Governor Spanberger Announces Phasecraft to Establish U.S. Headquarters in Arlington",
    outlet: "Office of the Governor",
    url: "https://www.governor.virginia.gov/newsroom/news-releases/2026/september-releases/name-1123766-en.html",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },

  {
    id: "pwc-by-right-data-centers-vote-insidenova-2026-09-22",
    date: "2026-09-22",
    filed: "2026-09-23",
    headline:
      "Prince William supervisors vote to end by-right data center development countywide",
    outlet: "InsideNoVa",
    url: "https://www.insidenova.com/headlines/prince-william-supervisors-vote-to-end-by-right-data-center-development-countywide/article_d65ea72a-63a2-45c7-b0c0-3b6feb5fa7d4.html",
    people: [{ name: "Deshundra Jefferson", office: "Prince William official" }],
    scope: "local",
  },
  {
    id: "lcps-workers-comp-1-8m-loudounnow-2026-09-22",
    date: "2026-09-22",
    filed: "2026-09-23",
    headline:
      "School Board Approves $1.8M Transfer to Worker’s Comp Fund as Claims Rise",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/education/school-board-approves-1-8m-transfer-to-worker-s-comp-fund-as-claims-rise/article_a02a05b6-bdad-42c1-83ab-3b368a12a254.html",
    people: [{ name: "April Chandler", office: "Loudoun official" }],
    scope: "local",
  },
  {
    id: "arlington-safety-bozman-hq-arlnow-2026-09-22",
    date: "2026-09-22",
    filed: "2026-09-23",
    headline:
      "Arlington leaders acknowledge safety concerns around government headquarters",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/22/arlington-leaders-acknowledge-safety-concerns-around-government-headquarters/",
    people: [],
    scope: "local",
  },
  {
    id: "beckwith-subramanyam-chamber-debate-loudounnow-2026-09-22",
    date: "2026-09-22",
    filed: "2026-09-23",
    headline: "Beckwith, Subramanyam Face Off in Chamber Debate",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/beckwith-subramanyam-face-off-in-chamber-debate/article_123bb1f5-250a-4161-b094-eeb9b768d1a1.html",
    people: [{ name: "Suhas Subramanyam", office: "U.S. Representative" }],
    scope: "local",
  },

  {
    id: "warner-mizusawa-senate-race-cardinal-2026-09-22",
    date: "2026-09-22",
    headline:
      "Virginia’s Senate race is taking place outside the national spotlight",
    outlet: "Cardinal News",
    url: "https://cardinalnews.org/2026/09/22/virginias-senate-race-is-taking-place-outside-the-national-spotlight/",
    people: [{ name: "Mark Warner", office: "U.S. Senator" }],
    scope: "statewide",
  },
  {
    id: "jones-medicaid-cms-rule-oag-2026-09-21",
    date: "2026-09-21",
    filed: "2026-09-22",
    headline:
      "Attorney General Jay Jones Joins Coalition of States in Pushing Back on Federal Rule That Could Undermine Medicaid, Insurance Regulation, and Health Coverage",
    outlet: "Office of the Attorney General",
    url: "https://www.oag.state.va.us/media-center/news-releases/3123-attorney-general-jay-jones-joins-coalition-of-states-in-pushing-back-on-federal-rule-that-could-undermine-medicaid-insurance-regulation-and-health-coverage",
    people: [{ name: "Jay Jones", office: "Attorney General" }],
    scope: "statewide",
  },
  {
    id: "jimenez-improper-driving-annandale-2026-09-21",
    date: "2026-09-21",
    filed: "2026-09-22",
    headline: "Jimenez’ reckless driving charge reduced to ‘improper driving’",
    outlet: "Annandale Today",
    url: "https://annandaletoday.com/jimenez-reckless-driving-charge-reduced-to-improper-driving/",
    people: [{ name: "Andres Jimenez", office: "Fairfax official" }],
    scope: "local",
  },
  {
    id: "beyer-faa-ai-smart-wjla-2026-09-21",
    date: "2026-09-21",
    filed: "2026-09-22",
    headline:
      "FAA now using artificial intelligence in effort to reduce flight delays in the DC area",
    outlet: "WJLA",
    url: "https://wjla.com/news/local/faa-artificial-intelligence-smart-flight-delays-reagan-national-dulles-bwi-air-traffic-controllers-sean-duffy-bryan-bedford-don-beyer-washington-aviation-safety",
    people: [{ name: "Don Beyer", office: "U.S. Representative" }],
    scope: "local",
  },

  {
    id: "arlington-sanctuary-house-judiciary-arlnow-2026-09-21",
    date: "2026-09-21",
    filed: "2026-09-22",
    headline:
      "NEW: House committee blasts Arlington’s ‘sanctuary’ policies in latest escalation",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/21/new-house-committee-blasts-arlingtons-sanctuary-policies-in-latest-escalation/",
    people: [],
    scope: "local",
  },
  {
    id: "jones-dominion-nextera-clock-reset-mercury-2026-09-21",
    date: "2026-09-21",
    filed: "2026-09-22",
    headline:
      "‘A different deal on the table’: AG Jay Jones asks SCC to reset the clock on Dominion-NextEra merger",
    outlet: "Virginia Mercury",
    url: "https://virginiamercury.com/2026/09/21/a-different-deal-on-the-table-ag-jay-jones-asks-scc-to-reset-the-clock-on-dominion-nextera-merger/",
    people: [{ name: "Jay Jones", office: "Attorney General" }],
    scope: "statewide",
  },
  {
    id: "loudoun-missing-link-sidewalks-57m-loudounnow-2026-09-21",
    date: "2026-09-21",
    filed: "2026-09-22",
    headline:
      "Supervisors Approve $57M for 8 “Missing Link” Sidewalk Segments",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/supervisors-approve-57m-for-8-missing-link-sidewalk-segments/article_104694c5-86e6-4905-a45d-da6490fd91ba.html",
    people: [
      { name: "Phyllis Randall", office: "Loudoun Chair" },
      { name: "Koran Saines", office: "Loudoun Supervisor" },
      { name: "Laura TeKrony", office: "Loudoun Supervisor" },
    ],
    scope: "local",
  },
  {
    id: "loudoun-alpr-no-change-loudounnow-2026-09-21",
    date: "2026-09-21",
    filed: "2026-09-22",
    headline: "No Plans to Modify License Plate Reader Usage, Loudoun Police Say",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/no-plans-to-modify-license-plate-reader-usage-loudoun-police-say/article_9a71bc42-7251-4df0-bb98-b0d89f675855.html",
    people: [],
    scope: "local",
  },
  {
    id: "equality-arlington-marriage-amendment-arlnow-2026-09-21",
    date: "2026-09-21",
    filed: "2026-09-22",
    headline:
      "Equality Arlington joins statewide coalition supporting same-sex marriage",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/21/equality-arlington-joins-statewide-coalition-supporting-same-sex-marriage/",
    people: [],
    scope: "local",
  },
  {
    id: "malik-chamber-debate-subramanyam-loudounnow-2026-09-21",
    date: "2026-09-21",
    filed: "2026-09-22",
    headline: "Independent Candidate Dropped from Chamber’s Candidate Debate",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/independent-candidate-dropped-from-chamber-s-candidate-debate/article_14313856-a12c-4e5b-bae3-856d8f768056.html",
    people: [{ name: "Suhas Subramanyam", office: "U.S. Representative" }],
    scope: "local",
  },

  {
    id: "beyer-trump-arch-military-complex-arlnow-2026-09-20",
    date: "2026-09-20",
    filed: "2026-09-21",
    headline:
      "JUST IN: Trump says arch would become a 'military complex' able to host drones and snipers",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/20/just-in-trump-says-arch-would-become-a-military-complex-able-to-host-drones-and-snipers/",
    people: [{ name: "Don Beyer", office: "U.S. Representative" }],
    scope: "local",
  },

  {
    id: "wittman-taylor-va01-mercury-2026-09-21",
    date: "2026-09-21",
    headline:
      "With US House control hanging in the balance, Wittman faces Taylor in contentious VA-01 race",
    outlet: "Virginia Mercury",
    url: "https://virginiamercury.com/2026/09/21/with-us-house-control-hanging-in-the-balance-wittman-faces-taylor-in-contentious-va-01-race/",
    people: [],
    scope: "statewide",
  },
  {
    id: "spanberger-macy-grottoes-dnr-2026-09-20",
    date: "2026-09-20",
    filed: "2026-09-21",
    headline:
      "Gov. Spanberger campaigns with Sixth District candidate Beth Macy in Grottoes",
    outlet: "Daily News-Record",
    url: "https://www.dnronline.com/news/elections/gov-spanberger-campaigns-with-sixth-district-candidate-beth-macy-in-grottoes/article_8df7c5b4-237f-572d-a4db-10f721032ad8.html",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "pwc-by-right-data-centers-jefferson-wjla-2026-09-20",
    date: "2026-09-20",
    filed: "2026-09-21",
    headline:
      "Tuesday board of supervisors vote could impact future data center proposals",
    outlet: "WJLA",
    url: "https://wjla.com/news/local/prince-william-county-data-centers-by-right-development-board-supervisors-deshundra-jefferson-virginia-zoning-approval-energy-power-tax-revenue-tuesday-vote",
    people: [{ name: "Deshundra Jefferson", office: "Prince William official" }],
    scope: "local",
  },
  {
    id: "jones-cdl-injunction-oag-2026-09-18",
    date: "2026-09-18",
    filed: "2026-09-21",
    headline:
      "Attorney General Jones Secures Preliminary Injunction Over Trump Administration’s Unlawful Demand of CDL Drivers’ Personal Information",
    outlet: "Office of the Attorney General",
    url: "https://www.oag.state.va.us/media-center/news-releases/3122-attorney-general-jones-secures-preliminary-injunction-over-trump-administrations-unlawful-demand-of-cdl-drivers-personal-information",
    people: [{ name: "Jay Jones", office: "Attorney General" }],
    scope: "statewide",
  },
  {
    id: "spanberger-data-center-reaction-cardinal-2026-09-18",
    date: "2026-09-18",
    filed: "2026-09-21",
    headline:
      "Reaction to Spanberger’s data center plan runs from ‘too much’ to ‘not enough’",
    outlet: "Cardinal News",
    url: "https://cardinalnews.org/2026/09/18/reaction-to-spanbergers-data-center-plan-runs-from-too-much-to-not-enough/",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "jones-cac-settlement-oag-2026-09-17",
    date: "2026-09-17",
    filed: "2026-09-21",
    headline:
      "Attorney General Jay Jones Announces $694 Million Settlement with Subprime Auto Lender Credit Acceptance Corporation",
    outlet: "Office of the Attorney General",
    url: "https://www.oag.state.va.us/media-center/news-releases/3119-attorney-general-jay-jones-announces-694-million-settlement-with-subprime-auto-lender-credit-acceptance-corporation",
    people: [{ name: "Jay Jones", office: "Attorney General" }],
    scope: "statewide",
  },

  {
    id: "vdot-highway-maintenance-shortfall-mercury-2026-09-18",
    date: "2026-09-18",
    filed: "2026-09-19",
    headline:
      "Virginia confronts $1.7 billion shortfall in highway maintenance funding",
    outlet: "Virginia Mercury",
    url: "https://virginiamercury.com/2026/09/18/virginia-confronts-1-7-million-shortfall-in-highway-maintenance-funding/",
    people: [],
    scope: "statewide",
  },
  {
    id: "spanberger-data-center-accountability-eo22-mercury-2026-09-18",
    date: "2026-09-18",
    filed: "2026-09-19",
    headline:
      "Spanberger presents slate of data center regulation proposals, puts first directives in motion",
    outlet: "Virginia Mercury",
    url: "https://virginiamercury.com/2026/09/18/spanberger-presents-slate-of-data-center-regulation-proposals-puts-first-directives-in-motion/",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "loudoun-pc-route28-data-center-denial-loudountimes-2026-09-18",
    date: "2026-09-18",
    filed: "2026-09-19",
    headline: "Planning Commission recommends data center denial in close vote",
    outlet: "Loudoun Times-Mirror",
    url: "https://www.loudountimes.com/news/politics_and_government/levels_of_government/county/planning-commission-recommends-data-center-denial-in-close-vote/article_e1efe97a-9d68-4ef4-987e-82fd3c8a2c7c.html",
    people: [],
    scope: "local",
  },
  {
    id: "subramanyam-warner-data-centers-loudountimes-2026-09-17",
    date: "2026-09-17",
    filed: "2026-09-19",
    headline: "Subramanyam, Warner lock in on regulating data centers",
    outlet: "Loudoun Times-Mirror",
    url: "https://www.loudountimes.com/news/business_and_economy/subramanyam-warner-lock-in-on-regulating-data-centers/article_71e228ea-9952-4788-88a9-87e0c10181fb.html",
    people: [
      { name: "Suhas Subramanyam", office: "U.S. Representative" },
      { name: "Mark Warner", office: "U.S. Senator" },
    ],
    scope: "statewide",
  },
  {
    id: "hashmi-dominion-nextera-listening-wtop-2026-09-03",
    date: "2026-09-03",
    filed: "2026-09-19",
    headline:
      "Virginia's Lt. Gov. wants to know what citizens think of proposed power company merger",
    outlet: "WTOP",
    url: "https://wtop.com/virginia/2026/09/virginias-lt-gov-wants-to-know-what-citizens-think-of-proposed-power-company-merger/",
    people: [
      { name: "Ghazala Hashmi", office: "Lieutenant Governor" },
      { name: "Russet Perry", office: "State Senator" },
      { name: "Abigail Spanberger", office: "Governor" },
    ],
    scope: "statewide",
  },

  {
    id: "spanberger-perriello-rally-nbc29-2026-09-18",
    date: "2026-09-18",
    headline:
      "Gov. Spanberger rallies for Tom Perriello as early voting begins",
    outlet: "NBC29",
    url: "https://www.29news.com/2026/09/18/gov-spanberger-rallies-tom-perriello-early-voting-begins/",
    people: [
      { name: "Abigail Spanberger", office: "Governor" },
      { name: "James Walkinshaw", office: "U.S. Representative" },
    ],
    scope: "statewide",
  },
  {
    id: "spanberger-disaster-relief-fund-cardinal-2026-09-18",
    date: "2026-09-18",
    headline:
      "Changes to state disaster relief fund will streamline claims process, increase spending caps for Southwest Virginia flood victims, governor's office says",
    outlet: "Cardinal News",
    url: "https://cardinalnews.org/2026/09/18/changes-to-state-disaster-relief-fund-will-streamline-claims-process-increase-spending-caps-for-southwest-virginia-flood-victims-governors-office-says/",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "jones-warner-early-voting-mail-ballot-mercury-2026-09-18",
    date: "2026-09-18",
    headline:
      "Early voting begins in Virginia, as Trump mail-ballot restrictions remain blocked",
    outlet: "Virginia Mercury",
    url: "https://virginiamercury.com/2026/09/18/early-voting-begins-in-virginia-as-trump-mail-ballot-restrictions-remain-blocked/",
    people: [
      { name: "Jay Jones", office: "Attorney General" },
      { name: "Mark Warner", office: "U.S. Senator" },
    ],
    scope: "statewide",
  },
  {
    id: "mcclellan-murray-qa-vpm-2026-09-18",
    date: "2026-09-18",
    headline:
      "VPM News Q&A: Democrat Jennifer McClellan, Republican Robert Murray",
    outlet: "VPM",
    url: "https://www.vpm.org/elections/2026-09-18/va04-mcclellan-murray-candidate-survey/",
    people: [{ name: "Jennifer McClellan", office: "U.S. Representative" }],
    scope: "statewide",
  },
  {
    id: "jones-dhs-election-law-arlnow-2026-09-17",
    date: "2026-09-17",
    filed: "2026-09-18",
    headline:
      "Va. attorney general says DHS may have violated state election law after whistleblower report",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/17/va-attorney-general-says-dhs-may-have-violated-state-election-law-after-whistleblower-report/",
    people: [{ name: "Jay Jones", office: "Attorney General" }],
    scope: "statewide",
  },
  {
    id: "jones-price-gouging-drought-oag-2026-09-17",
    date: "2026-09-17",
    filed: "2026-09-18",
    headline:
      "Attorney General Jones Announces Price Gouging Protections in Effect Amid Prolonged and Severe Drought Conditions Across the Commonwealth",
    outlet: "Office of the Attorney General",
    url: "https://www.oag.state.va.us/media-center/news-releases/3117-attorney-general-jones-announces-price-gouging-protections-in-effect-amid-prolonged-and-severe-drought-conditions-across-the-commonwealth",
    people: [
      { name: "Jay Jones", office: "Attorney General" },
      { name: "Abigail Spanberger", office: "Governor" },
    ],
    scope: "statewide",
  },
  {
    id: "spanberger-recreational-pot-regs-wjla-2026-09-17",
    date: "2026-09-17",
    filed: "2026-09-18",
    headline: "Virginia is one step closer to allowing the sale of recreational pot",
    outlet: "WJLA",
    url: "https://wjla.com/news/local/virginia-one-step-closer-allowing-sale-recreational-pot-marijuana-weed-cannabis-dispensaries-shops-legal-commonwealth-abigail-spanberger-democratic-laws-shops",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "reaser-loudoun-license-plate-loudounnow-2026-09-17",
    date: "2026-09-17",
    filed: "2026-09-18",
    headline: "Reaser Launches Loudoun County License Plate Contest",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/reaser-launches-loudoun-county-license-plate-contest/article_bfc050f4-a840-49b9-a771-d1226806a5cf.html",
    people: [{ name: "Atoosa Reaser", office: "State Delegate" }],
    scope: "local",
  },
  {
    id: "bren-mar-data-center-rally-ffxnow-2026-09-17",
    date: "2026-09-17",
    filed: "2026-09-18",
    headline:
      "Pro-Trump group to rally against data centers in Bren Mar this afternoon",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/17/pro-trump-group-to-rally-against-data-centers-in-bren-mar-this-afternoon/",
    people: [],
    scope: "local",
  },
  {
    id: "beyer-ai-warning-shot-arlnow-2026-09-17",
    date: "2026-09-17",
    filed: "2026-09-18",
    headline:
      "Beyer warns Congress 'may not receive another warning shot' on AI",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/17/beyer-warns-congress-may-not-receive-another-warning-shot-on-ai/",
    people: [{ name: "Don Beyer", office: "U.S. Representative" }],
    scope: "statewide",
  },
  {
    id: "manassas-first-friday-future-insidenova-2026-09-17",
    date: "2026-09-17",
    filed: "2026-09-18",
    headline:
      "'It's just not a pleasant crowd later': Manassas officials, business owners grapple with future of 'First Friday'",
    outlet: "InsideNoVa",
    url: "https://www.insidenova.com/news/prince_william/its-just-not-a-pleasant-crowd-later-manassas-officials-business-owners-grapple-with-future-of/article_7ec5aef4-a11a-4cf0-90a3-a18f0c51ff00.html",
    people: [{ name: "Michelle Davis-Younger", office: "Prince William official" }],
    scope: "local",
  },
  {
    id: "fairfax-early-voting-ballot-ffxnow-2026-09-17",
    date: "2026-09-17",
    filed: "2026-09-18",
    headline:
      "What to expect as early voting for the 2026 election kicks off Friday in Fairfax",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/17/what-to-expect-as-early-voting-for-the-2026-election-kicks-off-friday-in-fairfax/",
    people: [
      { name: "Suhas Subramanyam", office: "U.S. Representative" },
      { name: "James Walkinshaw", office: "U.S. Representative" },
      { name: "Don Beyer", office: "U.S. Representative" },
    ],
    scope: "local",
  },
  {
    id: "loudoun-early-voting-ballot-patch-2026-09-17",
    date: "2026-09-17",
    filed: "2026-09-18",
    headline:
      "Early Voting For 2026 Election Begins: What's On The Loudoun County Ballot",
    outlet: "Patch (Ashburn)",
    url: "https://patch.com/virginia/ashburn/early-voting-2026-election-begins-whats-loudoun-county-ballot",
    people: [
      { name: "Mark Warner", office: "U.S. Senator" },
      { name: "Suhas Subramanyam", office: "U.S. Representative" },
    ],
    scope: "local",
  },

  {
    id: "spanberger-pridefest-grace-wetpants-restoration-2026-09-16",
    date: "2026-09-16",
    filed: "2026-09-18",
    headline: 'Abigail Spanberger Embraces "Grace Wetpants" at Pridefest',
    outlet: "Restoration News",
    url: "https://restoration-news.com/abigail-spanberger-embraces-grace-wetpants-at-pridefest",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
    advocacy: true,
  },


  {
    id: "fairfax-flock-suspend-ffxnow-2026-09-16",
    date: "2026-09-16",
    filed: "2026-09-17",
    headline:
      "Fairfax County board suspends Flock camera installations, as criticism grows in N. Va.",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/16/fairfax-county-board-suspends-flock-camera-installations-as-criticism-grows-in-n-va/",
    people: [{ name: "Jeff McKay", office: "Fairfax official" }],
    scope: "local",
  },
  {
    id: "aps-integration-station-phaseout-arlnow-2026-09-16",
    date: "2026-09-16",
    filed: "2026-09-17",
    headline:
      "APS announces plans to end Integration Station early-childhood program",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/16/aps-announces-plans-to-end-integration-station-early-childhood-program/",
    people: [],
    scope: "local",
  },
  {
    id: "loudoun-arson-crime-scene-neighbors-wtop-2026-09-14",
    date: "2026-09-14",
    filed: "2026-09-17",
    headline:
      "‘We’re tired of waiting’: Neighbors push to remove Loudoun County crime scene nearly one year after deadly arson",
    outlet: "WTOP",
    url: "https://wtop.com/virginia/2026/09/were-tired-of-waiting-neighbors-push-to-remove-loudoun-county-crime-scene-nearly-one-year-after-deadly-arson/",
    people: [{ name: "Juli Briskman", office: "Loudoun Supervisor" }],
    scope: "local",
  },

  {
    id: "spanberger-drought-emergency-mercury-2026-09-16",
    date: "2026-09-16",
    filed: "2026-09-17",
    headline:
      "Spanberger declares state of emergency as drought strains Virginia farmers",
    outlet: "Virginia Mercury",
    url: "https://virginiamercury.com/2026/09/16/spanberger-declares-state-of-emergency-as-drought-strains-virginia-farmers/",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "jones-fair-firearms-unit-centersquare-2026-09-16",
    date: "2026-09-16",
    filed: "2026-09-17",
    headline:
      "Virginia attorney general launches unit to enforce firearm industry law",
    outlet: "The Center Square",
    url: "https://www.thecentersquare.com/virginia/article_2702445c-6756-47da-83c5-f0d0e85cc895.html",
    people: [{ name: "Jay Jones", office: "Attorney General" }],
    scope: "statewide",
  },
  {
    id: "warner-subramanyam-data-center-bills-mercury-2026-09-16",
    date: "2026-09-16",
    filed: "2026-09-17",
    headline: "Virginia's federal lawmakers lock in on regulating data centers",
    outlet: "Virginia Mercury",
    url: "https://virginiamercury.com/2026/09/16/virginias-federal-lawmakers-lock-in-on-regulating-data-centers/",
    people: [
      { name: "Mark Warner", office: "U.S. Senator" },
      { name: "Suhas Subramanyam", office: "U.S. Representative" },
    ],
    scope: "statewide",
  },
  {
    id: "loudoun-valley-north-power-line-loudounnow-2026-09-16",
    date: "2026-09-16",
    filed: "2026-09-17",
    headline:
      "Loudoun Supervisors Approve Resolution Opposing Valley North Power Line",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/loudoun-supervisors-approve-resolution-opposing-valley-north-power-line/article_0c9245c4-c82e-453f-b2a3-c7faed9a662f.html",
    people: [
      { name: "Phyllis Randall", office: "Loudoun Chair" },
      { name: "Kristen Umstattd", office: "Loudoun Supervisor" },
      { name: "Michael Turner", office: "Loudoun Supervisor" },
    ],
    scope: "local",
  },
  {
    id: "loudoun-dulles-substation-deny-loudounnow-2026-09-16",
    date: "2026-09-16",
    filed: "2026-09-17",
    headline: "Supervisors Deny Plan for Dulles Area Substation",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/supervisors-deny-plan-for-dulles-area-substation/article_dd2c26fb-282c-4732-8b51-b89f57ba8ce0.html",
    people: [],
    scope: "local",
  },
  {
    id: "loudoun-ice-letter-endorse-ltm-2026-09-16",
    date: "2026-09-16",
    filed: "2026-09-17",
    headline:
      "Board formally endorses letter to Chapman on ICE notification policy",
    outlet: "Loudoun Times-Mirror",
    url: "https://www.loudountimes.com/news/continuing_coverage/board-formally-endorses-letter-to-chapman-on-ice-notification-policy/article_a1bd711c-b5d0-4056-a143-3b74fae49828.html",
    people: [
      { name: "Phyllis Randall", office: "Loudoun Chair" },
      { name: "Mike Chapman", office: "Loudoun official" },
    ],
    scope: "local",
  },
  {
    id: "fairfax-mckay-governance-advice-ffxnow-2026-09-16",
    date: "2026-09-16",
    filed: "2026-09-17",
    headline:
      "Fairfax chairman advises neighbor locality to think carefully about governance changes",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/16/fairfax-chairman-advises-neighbor-locality-to-think-carefully-about-governance-changes/",
    people: [{ name: "Jeff McKay", office: "Fairfax official" }],
    scope: "local",
  },
  {
    id: "fairfax-criminal-properties-ordinance-ffxnow-2026-09-16",
    date: "2026-09-16",
    filed: "2026-09-17",
    headline:
      "Fairfax County authorizes police to cite properties with recurring criminal activity",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/16/fairfax-county-authorizes-police-to-crack-down-on-properties-with-recurring-criminal-activity/",
    people: [{ name: "Daniel Storck", office: "Fairfax official" }],
    scope: "local",
  },

  {
    id: "arlington-flock-cameras-end-arlnow-2026-09-15",
    date: "2026-09-15",
    filed: "2026-09-16",
    headline:
      "BREAKING: County Board votes to end Arlington's use of Flock cameras",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/15/breaking-county-board-votes-to-end-arlingtons-use-of-flock-cameras/",
    people: [],
    scope: "local",
  },
  {
    id: "loudoun-data-center-pause-vote-nbc-2026-09-15",
    date: "2026-09-15",
    filed: "2026-09-16",
    headline: "Loudoun County board pauses data center applications",
    outlet: "NBC Washington",
    url: "https://www.nbcwashington.com/news/local/northern-virginia/loudoun-county-board-pauses-data-center-applications/4155005/",
    people: [
      { name: "Kristen Umstattd", office: "Loudoun Supervisor" },
      { name: "Caleb Kershner", office: "Loudoun Supervisor" },
    ],
    scope: "local",
  },
  {
    id: "deq-microsoft-leesburg-2-5m-loudounnow-2026-09-15",
    date: "2026-09-15",
    filed: "2026-09-16",
    headline:
      "DEQ Requires Microsoft to Pay $2.5M for Leesburg Data Center Air Pollution",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/deq-requires-microsoft-to-pay-2-5m-for-leesburg-data-center-air-pollution/article_1ea7d005-5c94-43d8-95ec-0cf060e13cbe.html",
    people: [{ name: "Koran Saines", office: "Loudoun Supervisor" }],
    scope: "local",
  },
  {
    id: "loudoun-ice-cooperation-exchange-loudounnow-2026-09-15",
    date: "2026-09-15",
    filed: "2026-09-16",
    headline: "Supervisors, Sheriff Continue Exchange Over ICE Cooperation",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/supervisors-sheriff-continue-exchange-over-ice-cooperation/article_746f7e8a-28c8-4fd0-940a-ca4c7b58a325.html",
    people: [
      { name: "Phyllis Randall", office: "Loudoun Chair" },
      { name: "Mike Chapman", office: "Loudoun official" },
    ],
    scope: "local",
  },
  {
    id: "lcps-budget-retreat-enrollment-ltm-2026-09-16",
    date: "2026-09-16",
    headline:
      "School Board budget retreat focused on lack of enrollment, money and time",
    outlet: "Loudoun Times-Mirror",
    url: "https://www.loudountimes.com/news/education/school-board-budget-retreat-focused-on-lack-of-enrollment-money-and-time/article_df03e16f-e926-4465-9c27-0b9c909c9bd9.html",
    people: [{ name: "Jonathan Pepper", office: "Loudoun official" }],
    scope: "local",
  },
  {
    id: "manassas-first-friday-pause-wtop-2026-09-14",
    date: "2026-09-14",
    filed: "2026-09-16",
    headline:
      "Manassas pauses October 'First Friday' festival after teen's shooting death",
    outlet: "WTOP",
    url: "https://wtop.com/virginia/2026/09/manassas-pauses-october-first-friday-festival-after-teens-sept-4-shooting-death/",
    people: [],
    scope: "local",
  },

  {
    id: "fairfax-flock-pause-fox5-2026-09-15",
    date: "2026-09-15",
    filed: "2026-09-16",
    headline:
      "Flock cameras paused for review in Fairfax County due to privacy, access concerns",
    outlet: "FOX 5 DC",
    url: "https://www.fox5dc.com/news/flock-cameras-paused-review-fairfax-county-due-privacy-access-concerns",
    people: [{ name: "Jeff McKay", office: "Fairfax official" }],
    scope: "local",
  },
  {
    id: "voting-disqualification-guidance-mercury-2026-09-15",
    date: "2026-09-15",
    filed: "2026-09-16",
    headline:
      "New guidance limits voting disqualifications to murder, manslaughter convictions",
    outlet: "Virginia Mercury",
    url: "https://virginiamercury.com/2026/09/15/new-guidance-limits-voting-disqualifications-to-murder-manslaughter-convictions/",
    people: [
      { name: "Jay Jones", office: "Attorney General" },
      { name: "Abigail Spanberger", office: "Governor" },
    ],
    scope: "statewide",
  },
  {
    id: "fairfax-crossing-guards-vote-ffxnow-2026-09-15",
    date: "2026-09-15",
    filed: "2026-09-16",
    headline:
      "UPDATED: Fairfax supervisors restore crossing guard funding after residents rally for action",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/15/fairfax-supervisors-expected-to-restore-crossing-guard-funding-as-residents-rally-for-action/",
    people: [{ name: "Jeff McKay", office: "Fairfax official" }],
    scope: "local",
  },
  {
    id: "descano-house-subpoena-wtop-2026-09-15",
    date: "2026-09-15",
    filed: "2026-09-16",
    headline:
      "Lawyers for Fairfax County prosecutor Steve Descano say House committee plans subpoena, expanding inquiry",
    outlet: "WTOP",
    url: "https://wtop.com/virginia/2026/09/lawyers-for-fairfax-county-prosecutor-steve-descano-say-house-committee-plans-subpoena-expanding-inquiry/",
    people: [{ name: "Steve Descano", office: "Fairfax Commonwealth's Attorney" }],
    scope: "local",
  },

  {
    id: "kaine-warner-dca-airport-mercury-2026-09-15",
    date: "2026-09-15",
    headline:
      "Va.'s US Sens. Kaine, Warner introduce bill to curb overcrowding at Reagan National Airport",
    outlet: "Virginia Mercury",
    url: "https://virginiamercury.com/2026/09/15/va-s-us-sens-kaine-warner-introduce-bill-to-curb-overcrowding-at-reagan-national-airport/",
    people: [
      { name: "Tim Kaine", office: "U.S. Senator" },
      { name: "Mark Warner", office: "U.S. Senator" },
    ],
    scope: "statewide",
  },
  {
    id: "tps-lcps-arcola-ltm-2026-09-15",
    date: "2026-09-15",
    headline:
      "What uncertainty around TPS could mean for some immigrants in Loudoun and DMV",
    outlet: "Loudoun Times-Mirror",
    url: "https://www.loudountimes.com/news/community/what-uncertainty-around-tps-could-mean-for-some-immigrants-in-loudoun-and-dmv/article_3b26fce8-1d33-472d-b0b3-3e8fe68bf441.html",
    people: [
      { name: "Suhas Subramanyam", office: "U.S. Representative" },
      { name: "Koran Saines", office: "Loudoun Supervisor" },
    ],
    scope: "local",
  },
  {
    id: "spanberger-trans-rulemaking-wvtf-2026-09-14",
    date: "2026-09-14",
    filed: "2026-09-15",
    headline:
      "Spanberger quietly kills Youngkin-era transgender rulemaking effort",
    outlet: "WVTF / Radio IQ",
    url: "https://www.wvtf.org/news/2026-09-14/spanberger-quietly-kills-youngkin-era-transgender-rulemaking-effort",
    people: [
      { name: "Abigail Spanberger", office: "Governor" },
      { name: "Jay Jones", office: "Attorney General" },
    ],
    scope: "statewide",
  },
  {
    id: "spanberger-parole-board-wjla-2026-09-14",
    date: "2026-09-14",
    filed: "2026-09-15",
    headline:
      "Spanberger's parole board grants significantly more requests than Youngkin's",
    outlet: "WJLA",
    url: "https://wjla.com/news/local/spanbergers-parole-board-grants-significantly-more-requests-than-youngkins",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "dominion-nextera-va-benefits-ffxnow-2026-09-14",
    date: "2026-09-14",
    filed: "2026-09-15",
    headline:
      "Dominion and NextEra seek to win Va. support for merger with plan for new jobs, bill credits",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/14/dominion-and-nextera-seek-to-win-va-support-for-merger-with-plan-for-new-jobs-bill-credits/",
    people: [
      { name: "Abigail Spanberger", office: "Governor" },
      { name: "Don Scott", office: "State Delegate" },
      { name: "Scott Surovell", office: "State Senator" },
    ],
    scope: "statewide",
  },
  {
    id: "fairfax-crossing-guards-restore-ffxnow-2026-09-14",
    date: "2026-09-14",
    filed: "2026-09-15",
    headline:
      "Fairfax County proposes high school crossing guard funding, safety improvements",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/14/new-fairfax-county-proposes-high-school-crossing-guard-funding-safety-improvements/",
    people: [{ name: "Walter Alcorn", office: "Fairfax official" }],
    scope: "local",
  },
  {
    id: "lcps-lgbtq-history-proclamation-ltm-2026-09-14",
    date: "2026-09-14",
    filed: "2026-09-15",
    headline: "After debate, School Board approves LGBTQ+ history proclamation",
    outlet: "Loudoun Times-Mirror",
    url: "https://www.loudountimes.com/news/education/after-debate-school-board-approves-lgbtq-history-proclamation/article_665ac029-5793-4211-857e-ed4d8d071a5f.html",
    people: [{ name: "April Chandler", office: "Loudoun official" }],
    scope: "local",
  },
  {
    id: "lcps-14m-state-funds-ltm-2026-09-14",
    date: "2026-09-14",
    filed: "2026-09-15",
    headline: "LCPS hopes to spend additional $14M in state funds",
    outlet: "Loudoun Times-Mirror",
    url: "https://www.loudountimes.com/news/education/lcps-hopes-to-spend-additional-14m-in-state-funds/article_d4725140-531e-4f30-adf1-74f4b455cfe0.html",
    people: [],
    scope: "local",
  },
  {
    id: "fcps-fy2028-budget-ffxnow-2026-09-14",
    date: "2026-09-14",
    filed: "2026-09-15",
    headline:
      "FCPS officials warn funding cuts likely needed with difficult budgetary year ahead",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/14/fcps-officials-warn-funding-cuts-likely-needed-with-difficult-budgetary-year-ahead/",
    people: [{ name: "Michelle Reid", office: "Fairfax official" }],
    scope: "local",
  },

  {
    id: "fairfax-crossing-guards-examiner-2026-09-14",
    date: "2026-09-14",
    headline:
      "String of students struck by cars, including one fatality, reignites outrage over Fairfax County’s removal of crossing guards",
    outlet: "Washington Examiner",
    url: "https://www.washingtonexaminer.com/policy/education/4724542/students-struck-by-cars-outrage-fairfax-county-removal-crossing-guards/",
    people: [{ name: "Jeff McKay", office: "Fairfax official" }],
    scope: "local",
  },
  {
    id: "saines-flock-chapman-loudounnow-2026-09-13",
    date: "2026-09-13",
    filed: "2026-09-14",
    headline:
      "Saines Seeks Data on Flock Cameras After Chapman Declines Invitation to Discuss Usage",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/saines-seeks-data-on-flock-cameras-after-chapman-declines-invitation-to-discuss-usage/article_65457e55-2944-4688-9368-fd177759c9f3.html",
    people: [{ name: "Koran Saines", office: "Loudoun Supervisor" }],
    scope: "local",
  },
  {
    id: "subramanyam-verizon-copper-insidenova-2026-09-13",
    date: "2026-09-13",
    filed: "2026-09-14",
    headline:
      "Congressman, local leaders push back against Verizon copper service landline discontinuation",
    outlet: "InsideNoVA",
    url: "https://www.insidenova.com/headlines/congressman-local-leaders-push-back-against-verizon-copper-service-landline-discontinuation/article_4a39da4a-7fba-4403-90b0-b5461fd85be8.html",
    people: [{ name: "Suhas Subramanyam", office: "U.S. Representative" }],
    scope: "statewide",
  },

  {
    id: "loudoun-data-center-pause-mercury-2026-09-14",
    date: "2026-09-14",
    headline: "Loudoun to consider data center pause, removing by-right grandfather clause",
    outlet: "Virginia Mercury",
    url: "https://virginiamercury.com/2026/09/14/loudoun-to-consider-data-center-pause-removing-by-right-grandfather-clause/",
    people: [
      { name: "Juli Briskman", office: "Loudoun Supervisor" },
      { name: "Laura TeKrony", office: "Loudoun Supervisor" },
      { name: "Abigail Spanberger", office: "Governor" },
      { name: "Rip Sullivan", office: "State Delegate" },
    ],
    scope: "local",
  },
  {
    id: "loudoun-gd-grant-loudounnow-2026-09-13",
    date: "2026-09-13",
    filed: "2026-09-14",
    headline: "Supervisors Eye Cash Grant to Retain G+D HQ Amid Data Center Land Squeeze",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/business/supervisors-eye-cash-grant-to-retain-g-d-hq-amid-data-center-land-squeeze/article_4634df98-919d-423e-a6ad-a2ef0c178d15.html",
    people: [{ name: "Phyllis Randall", office: "Loudoun Chair" }],
    scope: "local",
  },
  {
    id: "spanberger-osbourn-park-insidenova-2026-09-12",
    date: "2026-09-12",
    filed: "2026-09-14",
    headline: "Gov. Spanberger visits Manassas' Osbourn Park High School, hears student concerns",
    outlet: "InsideNoVa",
    url: "https://www.insidenova.com/news/prince_william/gov-spanberger-visits-manassas-osbourn-park-high-school-hears-student-concerns/article_a2b2d838-1001-4642-900b-9e382dab9600.html",
    people: [
      { name: "Abigail Spanberger", office: "Governor" },
      { name: "Briana Sewell", office: "State Delegate" },
    ],
    scope: "local",
  },
  {
    id: "spanberger-ebt-chip-cards-mercury-2026-09-11",
    date: "2026-09-11",
    filed: "2026-09-14",
    headline: "Virginia rolls out more secure EBT cards to curb SNAP benefit theft",
    outlet: "Virginia Mercury",
    url: "https://virginiamercury.com/2026/09/11/virginia-rolls-out-more-secure-ebt-cards-to-curb-snap-benefit-theft/",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "spanberger-tangier-bay-wmdt-2026-09-11",
    date: "2026-09-11",
    filed: "2026-09-14",
    headline: "Gov. Spanberger Highlights Bay Conservation Efforts in Trip to Tangier Island",
    outlet: "WMDT",
    url: "https://www.wmdt.com/2026/09/gov-spanberger-highlights-bay-conservation-efforts-in-trip-to-tangier-island/",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "chapman-declines-ice-bos-ltm-2026-09-10",
    date: "2026-09-10",
    filed: "2026-09-14",
    headline: "Chapman declines invitation to discuss ICE information sharing at Board of Supervisors meeting",
    outlet: "Loudoun Times-Mirror",
    url: "https://www.loudountimes.com/news/public_safety/crime_and_courts/chapman-declines-invitation-to-discuss-ice-information-sharing-at-board-of-supervisors-meeting/article_5002f6be-f3f6-4f22-bcc4-57fbca04ac9d.html",
    people: [{ name: "Phyllis Randall", office: "Loudoun Chair" }],
    scope: "local",
  },

  {
    id: "scc-nextera-inperson-hearings-vpm-2026-09-11",
    date: "2026-09-11",
    filed: "2026-09-13",
    headline: "State regulators add in-person hearings in Dominion–NextEra merger",
    outlet: "VPM",
    url: "https://www.vpm.org/news/2026-09-11/dominion-nextera-merger-scc-public-hearings-towell-energy-regulation/",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "alexandria-flock-gaskins-wtop-2026-09-11",
    date: "2026-09-11",
    filed: "2026-09-13",
    headline: "Alexandria mayor: No ‘role for Flock in this community’",
    outlet: "WTOP",
    url: "https://wtop.com/virginia/2026/09/alexandria-mayor-no-role-for-flock-in-this-community/",
    people: [],
    scope: "local",
  },
  {
    id: "pentagon-visitor-center-arlnow-2026-09-12",
    date: "2026-09-12",
    filed: "2026-09-13",
    headline: "Pentagon 9/11 memorial breaking ground on its first visitor center",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/12/pentagon-9-11-memorial-breaking-ground-on-its-first-visitor-center/",
    people: [{ name: "Mark Warner", office: "U.S. Senator" }],
    scope: "local",
  },
  {
    id: "mwcog-data-centers-ghg-ffxnow-2026-09-10",
    date: "2026-09-10",
    filed: "2026-09-13",
    headline:
      "Data centers hurting efforts to curtail greenhouse gas emissions, D.C. region leaders told",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/10/data-centers-hurting-efforts-to-curtail-greenhouse-gas-emissions-d-c-region-leaders-told/",
    people: [],
    scope: "local",
  },
  {
    id: "spanberger-paid-leave-manassas-gov-2026-09-10",
    date: "2026-09-10",
    filed: "2026-09-13",
    headline:
      "Governor Spanberger Celebrates Landmark Paid Family & Medical Leave, Paid Sick Leave Laws at Worker Roundtable in Manassas",
    outlet: "Office of the Governor",
    url: "https://www.governor.virginia.gov/newsroom/news-releases/2026/september-releases/name-1123394-en.html",
    people: [
      { name: "Abigail Spanberger", office: "Governor" },
      { name: "Jennifer Boysko", office: "State Senator" },
      { name: "Briana Sewell", office: "State Delegate" },
    ],
    scope: "statewide",
  },
  {
    id: "arlington-ice-thrive-grants-arlnow-2026-09-08",
    date: "2026-09-08",
    filed: "2026-09-13",
    headline:
      "Families of wage earners detained by ICE to receive up to $2K from Arlington County",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/08/families-of-wage-earners-detained-by-ice-to-receive-up-to-2k-from-arlington-county/",
    people: [],
    scope: "local",
  },
  {
    id: "lopez-tps-salvadoran-arlnow-2026-09-11",
    date: "2026-09-11",
    filed: "2026-09-13",
    headline:
      "Del. Lopez ‘incredibly grateful’ as protections for Salvadoran immigrants hold fast",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/11/del-lopez-incredibly-grateful-as-protections-for-salvadoran-immigrants-hold-fast/",
    people: [{ name: "Alfonso Lopez", office: "State Delegate" }],
    scope: "local",
  },
  {
    id: "va08-ai-data-centers-debate-ffxnow-2026-09-11",
    date: "2026-09-11",
    filed: "2026-09-13",
    headline:
      "Candidates for Virginia’s 8th District offer mixed views on tackling AI, data centers",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/11/candidates-for-virginias-8th-district-offer-mixed-views-on-tackling-ai-data-centers/",
    people: [{ name: "Don Beyer", office: "U.S. Representative" }],
    scope: "local",
  },
  {
    id: "lorton-usar-fire-arrests-ffxnow-2026-09-11",
    date: "2026-09-11",
    filed: "2026-09-13",
    headline:
      "Investigation of $1M fire at Fairfax search and rescue training facility leads to arrests",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/11/investigation-of-1m-fire-at-fairfax-search-and-rescue-training-facility-leads-to-arrests/",
    people: [],
    scope: "local",
  },
  {
    id: "early-voting-nov2026-elect-2026-09-11",
    date: "2026-09-11",
    filed: "2026-09-13",
    headline: "Early voting for 2026 November General Election begins Sept. 18",
    outlet: "Virginia Dept. of Elections",
    url: "https://www.elections.virginia.gov/news-releases/name-34420-en.html",
    people: [],
    scope: "statewide",
  },
  {
    id: "fairfax-budget-austerity-ffxnow-2026-09-08",
    date: "2026-09-08",
    filed: "2026-09-13",
    headline:
      "Fairfax County leaders expect more ‘trying times’ as new budget discussion kicks off",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/08/fairfax-county-leaders-expect-trying-times-to-continue-as-new-budget-discussion-kicks-off/",
    people: [],
    scope: "local",
  },
  {
    id: "democrats-senate-2027-virginia-scope-2026-09-10",
    date: "2026-09-10",
    filed: "2026-09-11",
    headline: "Democrats look to expand their majority in the state Senate",
    outlet: "Virginia Scope",
    url: "https://www.virginiascope.com/democrats-look-to-expand-their-majority-in-the-state-senate/",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
  },
  {
    id: "morrissey-taylor-ad-virginia-scope-2026-09-10",
    date: "2026-09-10",
    filed: "2026-09-11",
    headline:
      "Joe Morrissey responds to Shannon Taylor ad, accuses her of trying to preempt criticism",
    outlet: "Virginia Scope",
    url: "https://www.virginiascope.com/joe-morrissey-responds-to-shannon-taylor-ad-accuses-her-of-trying-to-preempt-criticism/",
    people: [],
    scope: "statewide",
  },
  {
    id: "greene-sheriff-jones-investigation-cbs19-2026-09-10",
    date: "2026-09-10",
    filed: "2026-09-11",
    headline: "Greene County sheriff pushes back against immigration investigation",
    outlet: "CBS19",
    url: "https://www.cbs19news.com/news/greene-county-sheriff-pushes-back-against-immigration-investigation/article_774f4fa7-5d8b-44a0-a61f-281570cf35a7.html",
    people: [{ name: "Jay Jones", office: "Attorney General" }],
    scope: "statewide",
  },
  {
    id: "data-center-backlash-midterms-axios-2026-09-09",
    date: "2026-09-09",
    filed: "2026-09-11",
    headline: "Virginia's data center backlash spills into midterms and 2027",
    outlet: "Axios Richmond",
    url: "https://www.axios.com/local/richmond/2026/09/09/virginia-data-centers-midterm-election-2026",
    people: [{ name: "Mark Warner", office: "U.S. Senator" }],
    scope: "statewide",
  },
  {
    id: "taylor-morrissey-prosecutor-ad-wapo-2026-09-08",
    date: "2026-09-08",
    filed: "2026-09-11",
    headline:
      "This House candidate wants you to know she helped imprison a fellow Democrat",
    outlet: "The Washington Post",
    url: "https://www.washingtonpost.com/politics/2026/09/08/democrat-shannon-taylor-touts-prosecutor-past-battleground-house-race/",
    people: [],
    scope: "statewide",
  },
  {
    id: "manassas-bond-ashworth-pwt-2026-09-08",
    date: "2026-09-08",
    filed: "2026-09-11",
    headline:
      "Alleged First Friday gunman was out on bond, wanted for arrest when teen was fatally shot",
    outlet: "Prince William Times",
    url: "https://www.princewilliamtimes.com/localnews/alleged-first-friday-gunman-was-out-on-bond-wanted-for-arrest-when-teen-was-fatally/article_61ceb4ab-4bad-4b13-b8ec-a70be88645dd.html",
    people: [
      { name: "Amy Ashworth", office: "Prince William Commonwealth's Attorney" },
    ],
    scope: "local",
  },
  {
    id: "ice-detainer-loudoun-overdose-wjla-2026-09-08",
    date: "2026-09-08",
    filed: "2026-09-11",
    headline:
      "ICE issues detainer against illegal immigrant linked to Virginia high school overdoses",
    outlet: "WJLA",
    url: "https://wjla.com/news/local/ice-agents-detainer-illegal-immigrant-virginia-high-school-overdose-loudoun-county-governor-spanberger-jay-jones-steve-descano-department-of-justice-doj-masks",
    people: [
      { name: "Abigail Spanberger", office: "Governor" },
      { name: "Jay Jones", office: "Attorney General" },
      { name: "Steve Descano", office: "Fairfax Commonwealth's Attorney" },
    ],
    scope: "statewide",
  },
  {
    id: "vdoe-911-video-restoration-news-2026-09-02",
    date: "2026-09-02",
    filed: "2026-09-10",
    headline:
      "The Public School Rewrite of 9/11: The Hijackers Weren't Terrorists",
    outlet: "Restoration News",
    url: "https://restoration-news.com/the-public-school-rewrite-of-9-11-the-hijackers-weren-t-terrorists",
    people: [{ name: "Abigail Spanberger", office: "Governor" }],
    scope: "statewide",
    advocacy: true,
  },
  {
    id: "arnoldi-hitler-retweet-arlnow-2026-09-09",
    date: "2026-09-09",
    filed: "2026-09-10",
    headline:
      "N. Va. congressional candidate retweets Hitler video after antisemitism allegations",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/09/n-va-congressional-candidate-retweets-hitler-video-after-antisemitism-allegations/",
    people: [],
    scope: "local",
  },
  {
    id: "fairfax-city-sales-tax-sessions-ffxnow-2026-09-09",
    date: "2026-09-09",
    filed: "2026-09-10",
    headline: "Fairfax City plans voter information meetings on sales tax referendum",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/09/fairfax-city-plans-voter-information-meetings-on-sales-tax-referendum/",
    people: [],
    scope: "local",
  },
  {
    id: "fcps-kiss-and-ride-ffxnow-2026-09-09",
    date: "2026-09-09",
    filed: "2026-09-10",
    headline:
      "Kiss-and-ride congestion a growing safety concern at Fairfax County schools, report finds",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/09/kiss-and-ride-congestion-a-growing-safety-concern-in-fairfax-county-schools-report-finds/",
    people: [],
    scope: "local",
  },
  {
    id: "arlington-board-debate-arlnow-2026-09-09",
    date: "2026-09-09",
    filed: "2026-09-10",
    headline:
      "County Board candidates debate tax burdens, housing and e-bikes at first debate",
    outlet: "ARLnow",
    url: "https://www.arlnow.com/2026/09/09/county-board-candidates-debate-tax-burdens-housing-and-e-bikes-at-first-debate/",
    people: [],
    scope: "local",
  },
  {
    id: "sullivan-vlcv-data-centers-ffxnow-2026-09-09",
    date: "2026-09-09",
    filed: "2026-09-10",
    headline:
      "Environmental group honors Del. Sullivan for work on clean energy, data centers",
    outlet: "FFXnow",
    url: "https://www.ffxnow.com/2026/09/09/environmental-group-honors-del-sullivan-for-work-on-clean-energy-data-centers/",
    people: [{ name: "Rip Sullivan", office: "State Delegate" }],
    scope: "local",
  },
  {
    id: "fcps-naming-rights-wtop-2026-09-08",
    date: "2026-09-08",
    filed: "2026-09-10",
    headline:
      "Fairfax Co. weighs next steps for selling naming rights to high school sports facilities",
    outlet: "WTOP",
    url: "https://wtop.com/virginia/2026/09/fairfax-co-weighs-next-steps-for-selling-naming-rights-to-high-school-sports-facilities-2/",
    people: [],
    scope: "local",
  },
  {
    id: "loudoun-tps-schools-nbcwashington-2026-09-08",
    date: "2026-09-08",
    filed: "2026-09-10",
    headline:
      "'Devastating': Loudoun elementary will lose employees for past 25 years if TPS expires",
    outlet: "NBC Washington",
    url: "https://www.nbcwashington.com/video/news/local/northern-virginia/principal-explains-how-el-salvador-tps-deadline-could-affect-local-schools/4151747/",
    people: [],
    scope: "local",
  },
  {
    id: "spanberger-ashworth-manassas-bond-wjla-2026-09-09",
    date: "2026-09-09",
    filed: "2026-09-10",
    headline:
      "New arrests made in deadly Manassas event shooting as bond decisions face questions",
    outlet: "WJLA",
    url: "https://wjla.com/news/local/manassas-deadly-shooting-bond-decisions-suspects-arrest-crime-charges-spanberger-douglas-wanzer-teen-davis-train-depot",
    people: [
      { name: "Abigail Spanberger", office: "Governor" },
      { name: "Amy Ashworth", office: "Prince William Commonwealth's Attorney" },
    ],
    scope: "statewide",
  },
  {
    id: "subramanyam-national-data-center-plan-loudounnow-2026-09-09",
    date: "2026-09-09",
    filed: "2026-09-10",
    headline: "Subramanyam Proposes National Data Center Plan",
    outlet: "Loudoun Now",
    url: "https://www.loudounnow.com/news/subramanyam-proposes-national-data-center-plan/article_0ed33672-1456-42ee-b764-a6e4ae4c8ed7.html",
    people: [
      { name: "Suhas Subramanyam", office: "U.S. Representative" },
      { name: "Russet Perry", office: "State Senator" },
      { name: "Laura TeKrony", office: "Loudoun Supervisor" },
    ],
    scope: "local",
  },
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
