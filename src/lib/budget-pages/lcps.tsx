import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Bar, YoyBars, type BudgetPageData } from "@/components/site/budget-page";
import { LcpsBudgetSearch } from "@/components/site/lcps-budget-search";
import { LCPS_BUDGET_DOCS, LCPS_BUDGET_FY27 as B } from "@/content/lcps-budget";

const pct = (n: number) => `${((n / B.schoolOperatingAdopted) * 100).toFixed(1)}%`;
const other = B.schoolOperatingAdopted - B.localTaxFunding;
const SEON_PDF = "/files/lcps-budget/FY2027-lcps-superintendent-estimate-of-needs.pdf";

// Virginia state spending categories, FY27 SEON "Expenditures by State Category", FY27 column (display only).
const CATEGORIES = [
  { name: "Instruction", short: "$1.61B", pct: "78.0%", value: 1_612_910_188 },
  { name: "Operation & Maintenance", short: "$178.5M", pct: "8.6%", value: 178_524_084 },
  { name: "Pupil Transportation", short: "$97.4M", pct: "4.7%", value: 97_367_661 },
  { name: "Technology", short: "$73.2M", pct: "3.5%", value: 73_248_625 },
  { name: "Administration", short: "$57.2M", pct: "2.8%", value: 57_156_692 },
  { name: "Attendance & Health", short: "$40.1M", pct: "1.9%", value: 40_077_274 },
  { name: "Facilities", short: "$7.7M", pct: "0.4%", value: 7_670_145 },
];
// FY27 operating-fund departments, SEON p.20 Budget Summary (Operating column).
// cats = state categories each department feeds, per SEON p.64 "Reconciliation of School Funds to State Mandated
// Categories" (that table lists Administration, Attendance and Health as one row, so both chips use it).
// Non-Departmental, Charter School and School Board are not named in that table: shown under All only.
const AAH = ["Administration", "Attendance & Health"];
const DEPARTMENTS = [
  { name: "School Leadership", page: 157, value: 788_560_281, pct: "38.2%", cats: ["Instruction", ...AAH] },
  { name: "Student Services", page: 167, value: 421_085_534, pct: "20.4%", cats: ["Instruction", ...AAH] },
  { name: "Support Services", page: 193, value: 265_249_703, pct: "12.8%", cats: [...AAH, "Pupil Transportation", "Operation & Maintenance", "Facilities"] },
  { name: "Teaching and Learning", page: 207, value: 264_953_026, pct: "12.8%", cats: ["Instruction", ...AAH] },
  { name: "Non-Departmental", page: 145, value: 153_933_036, pct: "7.4%", cats: [] },
  { name: "Digital Innovation", page: 125, value: 73_248_625, pct: "3.5%", cats: ["Technology"] },
  { name: "Office of the Superintendent", page: 183, value: 29_228_953, pct: "1.4%", cats: [...AAH, "Pupil Transportation", "Operation & Maintenance"] },
  { name: "HR & Talent Dev", page: 135, value: 25_182_188, pct: "1.2%", cats: [...AAH] },
  { name: "Business & Financial Services", page: 97, value: 13_217_533, pct: "0.6%", cats: [...AAH] },
  { name: "Academics", page: 91, value: 13_099_848, pct: "0.6%", cats: [...AAH] },
  { name: "Communications & Community Engagement", page: 113, value: 9_070_338, pct: "0.4%", cats: [...AAH] },
  { name: "Charter School", page: 103, value: 8_378_039, pct: "0.4%", cats: [] },
  { name: "School Board", page: 151, value: 1_747_563, pct: "0.1%", cats: [] },
];
// Highlight callouts (Scott-approved wording). #page = PDF page index (printed + 9).
const CALLOUTS = [
  { title: "Administration", key: ["$57.2M"], text: "$57.2M for administration (2.8% of operating): central office policy, leadership, HR, finance and communications.", href: `${SEON_PDF}#page=82`,
    source: "FY27 SEON p.73, Expenditures by State Category, Administration $57,156,692." },
  { title: "Special Education", key: ["$421M Student Services", "2,649 positions"], text: "2,649 special education positions (about 1,024 teachers and 1,150 assistants) inside a $421M Student Services budget (20.4% of operating).", href: `${SEON_PDF}#page=178`,
    source: "SEON Dept of Student Services, budget total $421,085,534 (p.169) and Special Education Program staffing of 2,649.0 FTE (p.173)." },
  { title: "English Learner", key: ["515 staff"], text: "515 English learner staff, including 450 teachers, serving about 11,900 students, plus $4.2M in new English learner staffing in FY27.", href: `${SEON_PDF}#page=221`,
    source: "SEON Teaching & Learning, English Learner Programs 515.3 FTE / Teacher, EL 450.3 (pp.212–213); 11,890 EL students served 2024-25 (statistics page); FY27 EL enhancements $2,691,158 + $936,443 + $545,439." },
];

export const LCPS_BUDGET_PAGE: BudgetPageData = {
  venue: "loudoun-lcps",
  hero: {
    label: `${B.fiscalYear} school operating fund · BOS Adopted`,
    amountLabel: B.schoolOperatingAdoptedLabel,
    body: <>
      One year of day-to-day school spending ({B.fiscalSpan}), as appropriated by the Board of Supervisors.
      Up <span className="font-mono text-gold">{B.yoyChangeLabel}</span> from FY2026. Buildings are budgeted separately.
    </>,
    note: "Per-pupil cost not shown: no sourced FY27 enrollment figure on file.",
  },
  callouts: CALLOUTS,
  categories: {
    ariaLabel: "Spending by Virginia state category",
    items: CATEGORIES,
    source: "Source: FY27 SEON p.73, Expenditures by State Category (FY27 Budget column), categories required by Code of Virginia §22.1-115.",
  },
  departments: {
    heading: "By LCPS Department",
    chipGroupLabel: "Filter by state category",
    items: DEPARTMENTS,
    allNote: "All 13 operating-fund departments.",
    filterNote: (cat) => `Departments that feed ${cat}, per the SEON reconciliation table (p.64).`,
    spanNote: "Amounts are full department totals; a department can span several state categories, and the SEON does not split department dollars by category.",
    pageHref: (p) => `${SEON_PDF}#page=${p + 9}`,
    source: "Source: FY27 SEON p.20, Budget Summary (Operating column); category links from SEON p.64, Reconciliation of School Funds to State Mandated Categories. Operating fund only; School Nutrition (Food Services) excluded. Page = start of department section, FY27 SEON table of contents.",
  },
  questions: [
    { q: "Where does the money come from?", body: <>
      <Bar parts={[
        { label: "Local tax funding (county transfer)", value: B.localTaxFunding, color: "#F5B82E" },
        { label: "State, federal & other", value: other, color: "#2C4F86" },
      ]} />
      <p className="mt-3 text-sm text-night-muted">About {pct(B.localTaxFunding)} is local tax. "State, federal & other" is the remainder of the operating total, not a separately printed line.</p>
    </> },
    { q: "Where does it go?", body: <>
      <Bar parts={[
        { label: "School operating (salaries, programs, buses)", value: B.schoolOperatingAdopted, color: "#F5B82E" },
        { label: "School capital projects (CIP yr 1)", value: B.schoolCapitalProjects, color: "#C8102E" },
        { label: "CAPP (preserving buildings)", value: B.schoolCapp, color: "#6E8FC4" },
      ]} />
      <p className="mt-3 text-sm text-night-muted">Operating vs. capital. A line-by-line split of operating spending isn't in our data yet.</p>
    </> },
    { q: "What's changing year over year?", body: <>
      <YoyBars max={B.schoolOperatingAdopted} rows={[{ y: "FY2026", v: B.fy26OperatingAdopted }, { y: "FY2027", v: B.schoolOperatingAdopted, current: true }]} />
      <p className="mt-4 font-serif text-3xl font-bold text-gold tabular-nums">{B.yoyChangeLabel}</p>
      <p className="text-sm text-night-muted">+{((B.yoyChange / B.fy26OperatingAdopted) * 100).toFixed(1)}% operating, adopted to adopted. Plus a May 12, 2026 School Board amendment of {B.may12OperatingAmendmentLabel} (state compensation), not in these bars.</p>
    </> },
  ],
  how: {
    steps: [["Proposed", "Superintendent's Estimate of Needs (SEON)"], ["School Board Adopted", "School Board revises and adopts a request (Feb 2026)"], ["BOS Adopted", "Board of Supervisors appropriates the local dollars (Apr 2026)"]],
    note: <>Loudoun schools are fiscally dependent on the county; they don't set the property tax. SEON, School Board Adopted Executive Summary and BOS Adopted Schedule all print {B.schoolOperatingAdoptedLabel}, but each PDF is still what it is. Still missing: a full multi-section FY27 School Board Adopted book (like FY26) and the FY27 BOS appropriations resolution packet.</>,
  },
  search: <LcpsBudgetSearch />,
  files: {
    docs: LCPS_BUDGET_DOCS,
    footer: <>
      Official doors: <a className="text-gold hover:underline" href="https://www.lcps.org/budget" target="_blank" rel="noreferrer">lcps.org/budget <ExternalLink className="inline size-3" /></a> · <a className="text-gold hover:underline" href="https://www.loudoun.gov/budget" target="_blank" rel="noreferrer">loudoun.gov/budget <ExternalLink className="inline size-3" /></a> · <a className="text-gold hover:underline" href="/files/lcps-budget/LCPS-budget-kitchen-table.md" target="_blank" rel="noreferrer">plain-English guide</a> · <Link to="/dashboards/loudoun/schools/policies" className="text-gold hover:underline">LCPS policies →</Link>
    </>,
  },
};
