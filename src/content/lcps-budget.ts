/** FY2027 Loudoun schools budget shelf — dollars from Loudoun County / LCPS PDFs on file. */

export type LcpsBudgetDoc = {
  label: string;
  dek: string;
  href: string;
  /** Human size hint for the download row */
  sizeLabel: string;
  source: string;
};

/** Key FY2027 figures — cite named PDFs. Proposed ≠ School Board Adopted ≠ BOS Adopted. */
export const LCPS_BUDGET_FY27 = {
  fiscalYear: "FY2027",
  fiscalSpan: "July 1, 2026 – June 30, 2027",
  /** SEON, School Board Adopted Exec Summary, and BOS Adopted Schedule all print this operating total. */
  schoolOperatingAdopted: 2_066_954_668,
  schoolOperatingAdoptedLabel: "$2,066,954,668",
  schoolOperatingShort: "$2.07B",
  localTaxFunding: 1_484_949_364,
  localTaxFundingLabel: "$1,484,949,364",
  schoolCapitalProjects: 71_170_000,
  schoolCapitalProjectsLabel: "$71,170,000",
  schoolCapp: 53_130_000,
  schoolCappLabel: "$53,130,000",
  fy26OperatingAdopted: 1_962_144_782,
  fy26OperatingAdoptedLabel: "$1,962,144,782",
  yoyChange: 104_809_886,
  yoyChangeLabel: "+$104,809,886",
  /** May 12, 2026 School Board post-April amendment (agenda excerpt + LCPS news). */
  may12OperatingAmendmentLabel: "+$6.2M",
} as const;

/** Hosted public files under /files/lcps-budget/ — keep status labels honest. */
export const LCPS_BUDGET_DOCS: LcpsBudgetDoc[] = [
  {
    label: "FY2027 Superintendent’s Estimate of Needs (SEON)",
    dek: "Proposed to School Board — full operating book. School Operating Fund headline $2,066,954,668 (same dollar as later BOS adopted; still a proposed book).",
    href: "/files/lcps-budget/FY2027-lcps-superintendent-estimate-of-needs.pdf",
    sizeLabel: "6.3 MB",
    source: "LCPS / BoardDocs",
  },
  {
    label: "FY2027 School Board Adopted Executive Summary",
    dek: "School Board adopted (Feb 2026) — operating $2,066,954,668; LTF transfer request $1,484,949,364. Not the county appropriation.",
    href: "/files/lcps-budget/FY2027-lcps-school-board-adopted-executive-summary.pdf",
    sizeLabel: "2.8 MB",
    source: "LCPS / BoardDocs",
  },
  {
    label: "FY2027 School Board Budget Resolution (Adopted)",
    dek: "Official fund-by-fund totals the School Board approved Feb 3, 2026.",
    href: "/files/lcps-budget/FY2027-lcps-budget-resolution-adopted.pdf",
    sizeLabel: "229 KB",
    source: "LCPS",
  },
  {
    label: "FY2027 School Board Adopted — presented to BOS",
    dek: "Feb 9, 2026 slide deck presenting the School Board adopted budget to the Board of Supervisors — not a full multi-section adopted book.",
    href: "/files/lcps-budget/FY2027-lcps-school-board-adopted-budget-presented-to-bos.pdf",
    sizeLabel: "12 MB",
    source: "LCPS",
  },
  {
    label: "FY2027 BOS Adopted Executive Summary",
    dek: "Board of Supervisors adopted book — Schedule of Appropriations, School Operating Fund, local tax transfer. County appropriation.",
    href: "/files/lcps-budget/FY2027-loudoun-adopted-executive-summary.pdf",
    sizeLabel: "2.5 MB",
    source: "Loudoun County",
  },
  {
    label: "FY2027 Budget in Brief",
    dek: "Plain-language fund totals, including school operating, capital projects, and CAPP.",
    href: "/files/lcps-budget/FY2027-loudoun-budget-in-brief.pdf",
    sizeLabel: "15 MB",
    source: "Loudoun County",
  },
  {
    label: "FY2027 School Projects CIP",
    dek: "Adopted six-year school capital plan; only year one is appropriated.",
    href: "/files/lcps-budget/FY2027-loudoun-adopted-school-projects-CIP.pdf",
    sizeLabel: "954 KB",
    source: "Loudoun County",
  },
  {
    label: "FY2026 School Board Adopted Budget (full book)",
    dek: "Prior-year full multi-section School Board adopted book — School Operating Fund $1,962,144,782. FY27 has no comparable full adopted book posted yet.",
    href: "/files/lcps-budget/FY2026-lcps-school-board-adopted-budget.pdf",
    sizeLabel: "18 MB",
    source: "LCPS",
  },
  {
    label: "FY2027 May 12 operating amendment (excerpt)",
    dek: "Post-April School Board action: +$6.2M to FY27 School Operating Fund to recognize state compensation funding already in the adopted budget. Agenda excerpt — not a standalone amendment PDF.",
    href: "/files/lcps-budget/FY2027-lcps-may12-operating-fund-amendment-excerpt.txt",
    sizeLabel: "2 KB",
    source: "BoardDocs / LCPS news",
  },
];
