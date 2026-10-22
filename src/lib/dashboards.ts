/**
 * v4 dashboards: one shared template, one config per body.
 * Links point at existing pages; `to: null` renders a "Coming soon" tile.
 * FOIA URLs were fetched and confirmed as each jurisdiction's official FOIA
 * request page on 2026-10-14 (see docs/redesign-v4.md).
 */
export type DashTile = { label: string; icon: "play" | "list" | "money" | "people" | "book"; to: string | null; hash?: string; accentIcon?: boolean };
export type DashFoia = { label: string; href: string };
export type DashColumn = { name: string; sub?: string; tiles: DashTile[]; foia: DashFoia };
export type Dashboard = { slug: string; short: string; title: string; group: "local" | "state"; columns: DashColumn[] };

const soon = (label: string, icon: DashTile["icon"]): DashTile => ({ label, icon, to: null });

export const FOIA = {
  loudoun: { label: "FOIA to Loudoun County", href: "https://www.loudoun.gov/974/Submit-a-Request-for-Public-Records" },
  lcps: { label: "FOIA to LCPS", href: "https://www.lcps.org/foia" },
  fairfaxCity: { label: "FOIA to City of Fairfax", href: "https://www.fairfaxva.gov/Government/Records" },
  fairfaxCitySchools: {
    label: "FOIA to Fairfax City Schools",
    href: "https://www.cityoffairfaxschools.org/apps/pages/index.jsp?pREC_ID=1810815&type=d&uREC_ID=1662475",
  },
  albemarle: { label: "FOIA to Albemarle County", href: "https://www.albemarle.org/government/county-attorney/freedom-of-information-act" },
  acps: { label: "FOIA to ACPS", href: "https://www.k12albemarle.org/our-division/foia-requests" },
  manassas: { label: "FOIA to Manassas", href: "https://www.manassasva.gov/connect/city_manager_s_office/foia_requests.php" },
  mcps: { label: "FOIA to MCPS", href: "https://www.mcpsva.org/page/requests-for-informationfoia/" },
  house: { label: "FOIA to House of Delegates", href: "https://publications.virginiageneralassembly.gov/download_publication/156" },
  senate: { label: "FOIA to Senate", href: "https://apps.senate.virginia.gov/Senator/PDFs/SenateFOIARequest.pdf" },
  hanover: { label: "FOIA to Hanover County", href: "https://www.hanovercounty.gov/356/Make-a-Public-Records-FOIA-Request" },
  chesterfield: { label: "FOIA to Chesterfield County", href: "https://www.chesterfield.gov/FOIA" },
  vdoe: { label: "FOIA to Board of Education", href: "https://www.doe.virginia.gov/about-vdoe/foia-requests" },
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
          { label: "Find the Moment", icon: "play", to: "/dashboards/loudoun/bos/find-the-moment" },
          { label: "Meeting Recaps", icon: "list", to: "/dashboards/loudoun/bos/recaps" },
          { label: "Budget/Finances", icon: "money", to: "/dashboards/loudoun/bos/budget" },
          { label: "Members", icon: "people", to: "/dashboards/loudoun/bos/members" },
        ],
        foia: FOIA.loudoun,
      },
      {
        name: "Loudoun County Public Schools",
        tiles: [
          { label: "Find the Moment", icon: "play", to: "/dashboards/loudoun/schools/find-the-moment" },
          { label: "Meeting Recaps", icon: "list", to: "/dashboards/loudoun/schools/recaps" },
          { label: "Budget/Finances", icon: "money", to: "/dashboards/loudoun/schools/budget" },
          { label: "Policies", icon: "book", to: "/dashboards/loudoun/schools/policies" },
          { label: "Members", icon: "people", to: "/dashboards/loudoun/schools/members" },
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
    columns: [
      {
        name: "City of Fairfax City Council",
        tiles: [
          { label: "Find the Moment", icon: "play", to: "/dashboards/fairfax-city/council/find-the-moment" },
          { label: "Meeting Recaps", icon: "list", to: "/dashboards/fairfax-city/council/recaps" },
          { label: "Budget/Finances", icon: "money", to: "/dashboards/fairfax-city/council/budget" },
          { label: "Members", icon: "people", to: "/dashboards/fairfax-city/council/members" },
        ],
        foia: FOIA.fairfaxCity,
      },
      {
        name: "Fairfax City Schools",
        tiles: [
          { label: "Find the Moment", icon: "play", to: "/dashboards/fairfax-city/schools/find-the-moment" },
          { label: "Meeting Recaps", icon: "list", to: "/dashboards/fairfax-city/schools/recaps" },
          { label: "Budget/Finances", icon: "money", to: "/dashboards/fairfax-city/schools/budget" },
          { label: "Policies", icon: "book", to: "/dashboards/fairfax-city/schools/policies" },
          { label: "Members", icon: "people", to: "/dashboards/fairfax-city/schools/members" },
        ],
        foia: FOIA.fairfaxCitySchools,
      },
    ],
  },
  {
    slug: "albemarle",
    short: "Albemarle",
    title: "Albemarle County",
    group: "local",
    columns: [
      {
        name: "Albemarle County Board of Supervisors",
        tiles: [
          { label: "Find the Moment", icon: "play", to: "/dashboards/albemarle/bos/find-the-moment" },
          { label: "Meeting Recaps", icon: "list", to: "/dashboards/albemarle/bos/recaps" },
          { label: "Budget/Finances", icon: "money", to: "/dashboards/albemarle/bos/budget" },
          { label: "Members", icon: "people", to: "/dashboards/albemarle/bos/members" },
        ],
        foia: FOIA.albemarle,
      },
      {
        name: "Albemarle County Public Schools",
        tiles: [
          { label: "Find the Moment", icon: "play", to: "/dashboards/albemarle/schools/find-the-moment" },
          { label: "Meeting Recaps", icon: "list", to: "/dashboards/albemarle/schools/recaps" },
          { label: "Budget/Finances", icon: "money", to: "/dashboards/albemarle/schools/budget" },
          { label: "Policies", icon: "book", to: "/dashboards/albemarle/schools/policies" },
          { label: "Members", icon: "people", to: "/dashboards/albemarle/schools/members" },
        ],
        foia: FOIA.acps,
      },
    ],
  },
  {
    slug: "hanover",
    short: "Hanover",
    title: "Hanover County",
    group: "local",
    columns: [
      {
        name: "Hanover County Board of Supervisors",
        tiles: [
          { label: "Find the Moment", icon: "play", to: "/dashboards/hanover/bos/find-the-moment" },
          { label: "Meeting Recaps", icon: "list", to: "/dashboards/hanover/bos/recaps" },
          { label: "Budget/Finances", icon: "money", to: "/dashboards/hanover/bos/budget" },
          { label: "Members", icon: "people", to: "/dashboards/hanover/bos/members" },
        ],
        foia: FOIA.hanover,
      },
    ],
  },
  {
    slug: "chesterfield",
    short: "Chesterfield",
    title: "Chesterfield County",
    group: "local",
    columns: [
      {
        name: "Chesterfield County Board of Supervisors",
        tiles: [
          { label: "Find the Moment", icon: "play", to: "/dashboards/chesterfield/bos/find-the-moment" },
          { label: "Meeting Recaps", icon: "list", to: "/dashboards/chesterfield/bos/recaps" },
          { label: "Budget/Finances", icon: "money", to: "/dashboards/chesterfield/bos/budget" },
          { label: "Members", icon: "people", to: "/dashboards/chesterfield/bos/members" },
        ],
        foia: FOIA.chesterfield,
      },
    ],
  },
  {
    slug: "manassas",
    short: "Manassas",
    title: "City of Manassas",
    group: "local",
    columns: [
      {
        name: "Manassas City Council",
        tiles: [
          { label: "Find the Moment", icon: "play", to: "/dashboards/manassas/council/find-the-moment" },
          { label: "Meeting Recaps", icon: "list", to: "/dashboards/manassas/council/recaps" },
          { label: "Budget/Finances", icon: "money", to: "/dashboards/manassas/council/budget" },
          { label: "Members", icon: "people", to: "/dashboards/manassas/council/members" },
        ],
        foia: FOIA.manassas,
      },
      {
        name: "Manassas City Public Schools",
        tiles: [
          { label: "Find the Moment", icon: "play", to: "/dashboards/manassas/schools/find-the-moment" },
          { label: "Meeting Recaps", icon: "list", to: "/dashboards/manassas/schools/recaps" },
          { label: "Budget/Finances", icon: "money", to: "/dashboards/manassas/schools/budget" },
          { label: "Policies", icon: "book", to: "/dashboards/manassas/schools/policies" },
          { label: "Members", icon: "people", to: "/dashboards/manassas/schools/members" },
        ],
        foia: FOIA.mcps,
      },
    ],
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
          { label: "Find the Moment", icon: "play", to: "/dashboards/house/find-the-moment" },
          { label: "Meeting Recaps", icon: "list", to: "/dashboards/house/recaps" },
          { label: "Budget/Finances", icon: "money", to: "/dashboards/house/budget" },
          { label: "Policies", icon: "book", to: "/dashboards/house/policies" },
          { label: "Members", icon: "people", to: "/dashboards/house/members" },
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
          { label: "Find the Moment", icon: "play", to: "/dashboards/senate/find-the-moment" },
          { label: "Meeting Recaps", icon: "list", to: "/dashboards/senate/recaps" },
          { label: "Budget/Finances", icon: "money", to: "/dashboards/senate/budget" },
          { label: "Policies", icon: "book", to: "/dashboards/senate/policies" },
          { label: "Members", icon: "people", to: "/dashboards/senate/members" },
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
          { label: "Find the Moment", icon: "play", to: "/dashboards/board-of-education/find-the-moment" },
          { label: "Meeting Recaps", icon: "list", to: "/dashboards/board-of-education/recaps" },
          { label: "Budget/Finances", icon: "money", to: "/dashboards/board-of-education/budget" },
          { label: "Policies", icon: "book", to: "/dashboards/board-of-education/policies" },
          { label: "Members", icon: "people", to: "/dashboards/board-of-education/members" },
        ],
        foia: FOIA.vdoe,
      },
    ],
  },
];

export const DASHBOARD_BY_SLUG: Record<string, Dashboard> = Object.fromEntries(DASHBOARDS.map((d) => [d.slug, d]));
export const COMING_SOON_LOCALITIES = ["Henrico"];
