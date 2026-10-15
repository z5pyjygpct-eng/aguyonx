/**
 * v4 dashboards: one shared template, one config per body.
 * Links point at existing pages; `to: null` renders a "Coming soon" tile.
 * FOIA URLs were fetched and confirmed as each jurisdiction's official FOIA
 * request page on 2026-10-14 (see docs/redesign-v4.md).
 */
export type DashTile = { label: string; icon: "play" | "list" | "money" | "people" | "book"; to: string | null; hash?: string };
export type DashFoia = { label: string; href: string };
export type DashColumn = { name: string; sub?: string; tiles: DashTile[]; foia: DashFoia };
export type Dashboard = { slug: string; short: string; title: string; group: "local" | "state"; columns: DashColumn[] };

const soon = (label: string, icon: DashTile["icon"]): DashTile => ({ label, icon, to: null });

export const FOIA = {
  loudoun: { label: "FOIA to Loudoun County", href: "https://www.loudoun.gov/974/Submit-a-Request-for-Public-Records" },
  lcps: { label: "FOIA to LCPS", href: "https://www.lcps.org/foia" },
  fairfaxCity: { label: "FOIA to the City of Fairfax", href: "https://www.fairfaxva.gov/Government/Records" },
  fairfaxCitySchools: {
    label: "FOIA to City of Fairfax Schools",
    href: "https://www.cityoffairfaxschools.org/apps/pages/index.jsp?pREC_ID=1810815&type=d&uREC_ID=1662475",
  },
  albemarle: { label: "FOIA to Albemarle County", href: "https://www.albemarle.org/government/county-attorney/freedom-of-information-act" },
  acps: { label: "FOIA to Albemarle County Public Schools", href: "https://www.k12albemarle.org/our-division/foia-requests" },
  manassas: { label: "FOIA to the City of Manassas", href: "https://www.manassasva.gov/connect/city_manager_s_office/foia_requests.php" },
  mcps: { label: "FOIA to Manassas City Public Schools", href: "https://www.mcpsva.org/page/requests-for-informationfoia/" },
  house: { label: "FOIA to the House Clerk's Office", href: "https://vga.virginia.gov/help/foia/" },
  senate: { label: "FOIA to the Senate Clerk's Office", href: "https://apps.senate.virginia.gov/Senator/PDFs/SenateFOIARequest.pdf" },
  vdoe: { label: "FOIA to the Virginia Department of Education", href: "https://www.doe.virginia.gov/about-vdoe/foia-requests" },
} satisfies Record<string, DashFoia>;

function cityCols(base: string, council: string, schools: string, f1: DashFoia, f2: DashFoia): DashColumn[] {
  return [
    {
      name: council,
      tiles: [
        { label: "Find the Moment", icon: "play", to: base },
        { label: "Meeting Recaps", icon: "list", to: base },
        soon("Budget/Finances", "money"),
        soon("Members", "people"),
      ],
      foia: f1,
    },
    {
      name: schools,
      tiles: [
        { label: "Find the Moment", icon: "play", to: `${base}/schools` },
        { label: "Meeting Recaps", icon: "list", to: `${base}/schools` },
        soon("Budget/Finances", "money"),
        soon("Policies", "book"),
        soon("Members", "people"),
      ],
      foia: f2,
    },
  ];
}

export const DASHBOARDS: Dashboard[] = [
  {
    slug: "loudoun",
    short: "Loudoun",
    title: "Loudoun County",
    group: "local",
    columns: [
      {
        name: "Loudoun County Board of Supervisors",
        tiles: [
          { label: "Find the Moment", icon: "play", to: "/counties/loudoun/find-the-moment" },
          { label: "Meeting Recaps", icon: "list", to: "/counties/loudoun" },
          soon("Budget/Finances", "money"),
          { label: "Members", icon: "people", to: "/counties/loudoun" },
        ],
        foia: FOIA.loudoun,
      },
      {
        name: "Loudoun County Public Schools",
        tiles: [
          { label: "Find the Moment", icon: "play", to: "/dashboards/loudoun/schools/find-the-moment" },
          { label: "Meeting Recaps", icon: "list", to: "/dashboards/loudoun/schools/recaps" },
          { label: "Budget/Finances", icon: "money", to: "/counties/loudoun/schools", hash: "budget" },
          { label: "Policies", icon: "book", to: "/counties/loudoun/schools" },
          { label: "Members", icon: "people", to: "/counties/loudoun/schools" },
        ],
        foia: FOIA.lcps,
      },
    ],
  },
  {
    slug: "fairfax-city",
    short: "City of Fairfax",
    title: "City of Fairfax",
    group: "local",
    columns: cityCols("/cities/fairfax-city", "City of Fairfax City Council", "City of Fairfax School Board", FOIA.fairfaxCity, FOIA.fairfaxCitySchools),
  },
  {
    slug: "albemarle",
    short: "Albemarle",
    title: "Albemarle County",
    group: "local",
    columns: cityCols("/cities/albemarle", "Albemarle County Board of Supervisors", "Albemarle County School Board", FOIA.albemarle, FOIA.acps),
  },
  {
    slug: "manassas",
    short: "Manassas",
    title: "City of Manassas",
    group: "local",
    columns: cityCols("/cities/manassas", "Manassas City Council", "Manassas City School Board", FOIA.manassas, FOIA.mcps),
  },
  {
    slug: "house",
    short: "House of Delegates",
    title: "Virginia House of Delegates",
    group: "state",
    columns: [
      {
        name: "Virginia House of Delegates",
        tiles: [
          { label: "Find the Moment", icon: "play", to: "/general-assembly/house" },
          { label: "Meeting Recaps", icon: "list", to: "/general-assembly/house" },
          soon("Budget/Finances", "money"),
          { label: "Members", icon: "people", to: "/delegates" },
        ],
        foia: FOIA.house,
      },
    ],
  },
  {
    slug: "senate",
    short: "State Senate",
    title: "Senate of Virginia",
    group: "state",
    columns: [
      {
        name: "Senate of Virginia",
        tiles: [
          { label: "Find the Moment", icon: "play", to: "/general-assembly/senate" },
          { label: "Meeting Recaps", icon: "list", to: "/general-assembly/senate" },
          soon("Budget/Finances", "money"),
          { label: "Members", icon: "people", to: "/senators" },
        ],
        foia: FOIA.senate,
      },
    ],
  },
  {
    slug: "board-of-education",
    short: "Board of Education",
    title: "Virginia Board of Education",
    group: "state",
    columns: [
      {
        name: "Virginia Board of Education",
        tiles: [
          { label: "Find the Moment", icon: "play", to: "/board-of-education" },
          soon("Meeting Recaps", "list"),
          soon("Policies", "book"),
          soon("Members", "people"),
        ],
        foia: FOIA.vdoe,
      },
    ],
  },
];

export const DASHBOARD_BY_SLUG: Record<string, Dashboard> = Object.fromEntries(DASHBOARDS.map((d) => [d.slug, d]));
export const COMING_SOON_LOCALITIES = ["Chesterfield", "Hanover", "Henrico"];
