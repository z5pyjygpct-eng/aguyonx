/** FY2027 Loudoun schools budget shelf — dollars from Loudoun County BOS adopted PDFs only. */

export type LcpsBudgetDoc = {
  label: string;
  dek: string;
  href: string;
  /** Human size hint for the download row */
  sizeLabel: string;
  source: string;
};

/** Key BOS Adopted FY2027 figures — cite Exec Summary / Budget in Brief. Proposed ≠ adopted. */
export const LCPS_BUDGET_FY27 = {
  fiscalYear: "FY2027",
  fiscalSpan: "July 1, 2026 – June 30, 2027",
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
} as const;

/** Hosted public PDFs under /files/lcps-budget/ */
export const LCPS_BUDGET_DOCS: LcpsBudgetDoc[] = [
  {
    label: "FY2027 Adopted Executive Summary",
    dek: "Board of Supervisors adopted book — Schedule of Appropriations, School Operating Fund, local tax transfer.",
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
];
