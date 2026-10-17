/**
 * Albemarle County Public Schools budget page (FY2026/27 School Board Adopted, Apr 23, 2026).
 * Figures: /workspace/budget-albemarle-schools/REPORT.md only. The book restarts page labels per section;
 * PDF page = section page + offset (A+1, B+43, C+69, D+88, E+165, F+200, G+241).
 */
import { Bar, YoyBars, type BudgetPageData } from "@/components/site/budget-page";
import { pctOf, S, Ext, vdoc, venueSearch } from "@/lib/budget-pages/shared";

const V = "albemarle-schools";
const BOOK = "https://www.k12albemarle.org/fs/resource-manager/view/87aa1cdb-71bd-40bf-99d3-8eb39f154c28";
const BRIEF = `/files/${V}-budget/${V}-FY27-ACPS-budget-in-brief.pdf`;
const OFF: Record<string, number> = { A: 1, B: 43, C: 69, D: 88, E: 165, F: 200, G: 241 };
/** "E-11" → PDF page 176 */
const pdf = (label: string) => { const [s, n] = label.split("-"); return Number(n) + OFF[s!]!; };
const at = (pdfPage: number) => `${BOOK}#page=${pdfPage}`;
const L = ({ l }: { l: string }) => <S href={at(pdf(l))}>{l}</S>;
const Br = ({ p }: { p: number }) => <S href={`${BRIEF}#page=${p}`}>Budget in Brief p.{p}</S>;
const SF = 308_067_157;
const SF26 = 284_194_448;

const CATS: [string, string, number][] = [
  ["Instruction", "$215.9M", 215_871_314], ["Building Services (O&M)", "$30.5M", 30_453_148], ["Transportation", "$20.0M", 20_037_083],
  ["Admin/Attendance & Health", "$19.7M", 19_732_844], ["Transfers", "$11.9M", 11_876_219], ["Technology", "$10.1M", 10_096_549],
];
const DEP = "Departments", SCH = "Schools";
const UNITS: [string, string, number, string][] = [
  ["Albemarle High", "D-58", 22_535_787, SCH], ["Transportation", "E-29", 19_588_432, DEP], ["Building Services", "E-31", 16_977_605, DEP],
  ["Western Albemarle High", "D-62", 15_953_964, SCH], ["Monticello High", "D-60", 15_802_868, SCH], ["Multi-School Services", "D-76", 13_335_652, SCH],
  ["Non-Departmental (incl. transfers)", "E-26", 11_608_487, DEP], ["Henley Middle", "D-48", 10_109_972, SCH], ["Journey Middle", "D-50", 9_892_338, SCH],
  ["Baker-Butler Elementary", "D-14", 9_715_336, SCH], ["Woodbrook Elementary", "D-42", 9_040_668, SCH], ["Greer Elementary", "D-22", 8_403_988, SCH],
  ["Agnor Elementary", "D-12", 7_948_611, SCH], ["Technology", "E-35", 7_693_790, DEP], ["Burley Middle", "D-46", 7_654_352, SCH],
  ["Lakeside Middle", "D-52", 7_558_477, SCH], ["Instructional Support (Dept of Instruction)", "E-7", 7_342_421, DEP], ["Brownsville Elementary", "D-18", 7_080_142, SCH],
  ["Special Education (department)", "E-11", 6_708_748, DEP], ["Mountain View Primary", "D-28", 6_620_102, SCH], ["Mountain View Upper Elementary (new)", "D-30", 6_557_546, SCH],
  ["Stone-Robinson Elementary", "D-38", 6_551_877, SCH], ["Hollymead Elementary", "D-24", 6_448_402, SCH], ["Crozet Elementary", "D-20", 6_397_636, SCH],
  ["Walton Middle", "D-54", 6_275_214, SCH], ["ACE Academy – Lambs Lane (new)", "D-70", 5_147_105, SCH], ["Ivy Elementary", "D-26", 4_735_837, SCH],
  ["Human Resources", "E-17", 4_680_047, DEP], ["Broadus Wood Elementary", "D-16", 4_677_705, SCH], ["Murray Elementary", "D-32", 4_250_312, SCH],
  ["Stony Point Elementary", "D-40", 4_173_816, SCH], ["Red Hill Elementary", "D-34", 3_866_576, SCH], ["Scottsville Elementary", "D-36", 3_770_353, SCH],
  ["Community Lab School (charter)", "D-66", 3_605_603, SCH], ["Specialized Academic Center", "D-74", 3_433_781, SCH], ["Fiscal Services", "E-24", 2_932_342, DEP],
  ["Professional Development", "E-9", 2_353_539, DEP], ["ACE Academy – Seminole Place", "D-68", 1_740_363, SCH], ["Division Support", "E-5", 1_300_172, DEP],
  ["Strategic Planning", "E-23", 1_133_047, DEP], ["Office of the School Board", "E-6", 981_802, DEP], ["Student Services", "E-13", 929_023, DEP],
  ["Communications", "E-21", 840_330, DEP], ["International & English Learners", "E-15", 820_428, DEP], ["Community Engagement", "E-19", 671_459, DEP],
  ["Center for Learning & Growth", "D-72", 633_505, SCH], ["Safety and Security", "E-33", 620_597, DEP], ["Lapse Factor (vacancy savings)", "E-25", -3_033_000, DEP],
];

const DOCS = [
  vdoc(V, "FY27-ACPS-budget-in-brief", { label: "FY 26/27 Adopted Budget in Brief", kind: "School Board Adopted", dek: "Four pages: totals, what changed, staffing and pay.", bytes: 208_278, source: "k12albemarle.org" }),
  vdoc(V, "FY27-ACPS-adopted-budget-full", { label: "2026-27 School Board's Adopted Budget (complete, Sections A–G, 286 pp)", kind: "School Board Adopted", dek: "Overview (A), revenues (B), every school (D) and department (E), special revenue funds (F). Too big to host (99 MB).", bytes: 98_951_342, official: BOOK, source: "k12albemarle.org" }),
  vdoc(V, "FY27-ACPS-staffing-standards", { label: "FY27 Staffing Standards", kind: "School Board Adopted", dek: "How many staff each school gets, and why.", bytes: 2_066_220, source: "k12albemarle.org" }),
];

export const ALBEMARLE_SCHOOLS_BUDGET_PAGE: BudgetPageData = {
  venue: V,
  hero: {
    label: "FY2026/27 School Fund · School Board Adopted (Apr 23, 2026)",
    amountLabel: "$308,067,157",
    body: <>
      One year of day-to-day spending for Albemarle County Public Schools. Up <span className="font-mono text-gold">+$23,872,709</span> (+8.4%) from FY2026's $284,194,448.
      About $22,346 per student, up from $20,591.
    </>,
    note: <>Sources: <L l="A-26" />, <L l="A-17" />, <Br p={1} />. Total ACPS budget, with special revenue funds (net of transfers): $333,621,867 (<L l="A-25" />). The County's certified budget resolution (Apr 22, 2026) shows the same $308,067,157 School Fund.</>,
  },
  callouts: [
    { title: "Administration", key: ["$19.7M"], href: at(pdf("A-27")),
      text: "$19,732,844 in the state category Admin/Attendance & Health: 6.4% of the School Fund, up $1,985,941 (+11.2%). Central offices in it include Human Resources ($4,680,047), Fiscal Services ($2,932,342), Division Support ($1,300,172) and the School Board office ($981,802).",
      source: "Adopted book A-27 (PDF p.28); departments E-17, E-24, E-5, E-6." },
    { title: "Special Education", key: ["13.9% of students", "$6.7M department"], href: at(pdf("E-11")),
      text: "13.9% of students have disabilities. The Department of Special Education has $6,708,748 (−0.3%), including $3,130,000 sent to the Children's Services Act for private day and residential placements. New this year: $325,531 for 3 special education staff. Teachers in schools are in school budgets, so there's no single total.",
      source: "Adopted book A-16 (fall 2025), E-11 (PDF p.176); Budget in Brief p.3 (new positions)." },
    { title: "English Learners", key: ["11.4% of students", "$820K department"], href: at(pdf("E-15")),
      text: "11.4% of students are English learners, from 97 countries. The International & English Learners department has $820,428, up 12.5%, and the state sends $1,825,465 for English learner instruction. EL teachers in schools are in school budgets, so there's no single total.",
      source: "Adopted book A-16 (fall 2025), E-15 (PDF p.180), B-10 (PDF p.53, state SOQ English as a second language)." },
  ],
  categories: {
    ariaLabel: "School Fund spending by Virginia state category",
    items: CATS.map(([name, short, value]) => ({ name, short, value, pct: pctOf(value, SF) })),
    gridClass: "lg:grid-cols-6",
    source: <>Source: Adopted book <L l="A-27" />, School Fund by state category (sums to $308,067,157). % is our calc and matches the Budget in Brief.</>,
  },
  departments: {
    heading: "By ACPS School & Department",
    chips: [SCH, DEP],
    chipGroupLabel: "Filter schools or departments",
    items: UNITS.map(([name, label, value, c]) => ({ name, page: pdf(label), pageLabel: label, value, cats: [c], pct: pctOf(value, SF) })),
    allNote: "All 30 schools and programs and 18 departments and lines in the School Fund.",
    filterNote: (cat) => (cat === SCH ? "Schools: $223,917,888, up 7.3% (D-10)." : "Departments: $84,149,269, up 11.3% (E-3)."),
    spanNote: "The Newcomer Learning Community ($552,320 last year) is discontinued and not listed.",
    pageHref: at,
    source: <>Source: Adopted book, schools <L l="D-10" />, departments <L l="E-3" />. Page labels are the book's own (each section restarts at 1); links open the right PDF page. % is our calc.</>,
  },
  questions: [
    { q: "Where does the money come from?", body: <>
      <Bar parts={[
        { label: "Albemarle County transfer", value: 218_283_112, color: "#F5B82E" },
        { label: "State", value: 83_107_547, color: "#C8102E" },
        { label: "Other local (incl. one-time fund balance)", value: 6_176_498, color: "#6E8FC4" },
        { label: "Federal (Medicaid)", value: 500_000, color: "#2C4F86" },
      ]} />
      <p className="mt-3 text-sm text-night-muted">Source: <L l="A-26" />, <L l="B-6" />. "Other local" is our calc (local $224,459,610 minus the County transfer). State money grows 16.5%; state Basic Aid alone is up 32.2% (<L l="B-10" />).</p>
    </> },
    { q: "Where does it go?", body: <>
      <Bar parts={[
        { label: "Schools", value: 223_917_888, color: "#F5B82E" },
        { label: "Departments (incl. transfers)", value: 84_149_269, color: "#6E8FC4" },
      ]} />
      <p className="mt-3 text-sm text-night-muted">From <L l="D-10" /> and <L l="E-3" />. By type: salaries $171,675,027 (55.7%) and benefits $81,651,199 (26.5%) (<L l="A-26" />).</p>
    </> },
    { q: "What's changing year over year?", body: <>
      <YoyBars max={SF} rows={[{ y: "FY2025 actual", v: 275_060_629 }, { y: "FY2026", v: SF26 }, { y: "FY2027", v: SF, current: true }]} />
      <p className="mt-4 font-serif text-3xl font-bold text-gold tabular-nums">+$23,872,709</p>
      <p className="text-sm text-night-muted">+8.4% (<L l="A-27" />). The biggest pieces: workforce +$11.8M and two new schools +$4.3M, offset by $2.8M in service reductions (<Br p={2} />). Raises of 3.75% to 4.25% by group (<Br p={3} />).</p>
    </> },
  ],
  how: {
    steps: [
      ["Proposed", "Superintendent presents the Draft Funding Request (Feb 12, 2026)"],
      ["Funding Request", "School Board approves its funding request to the County (Mar 12, 2026)"],
      ["School Board Adopted", "After the Board of Supervisors appropriates on Apr 22, the School Board adopts (Apr 23, 2026)"],
    ],
    note: <>Albemarle schools get most of their local money from the County; the Board of Supervisors sets the tax rate. Work sessions were Feb 19 and Feb 26, with a public hearing Feb 26; the request went to the Board of Supervisors on Mar 16 (calendar, <L l="A-24" />). The calendar has two typos: "March 5, 2025" (should be 2026) and "the FY 26 Budget" (should be FY 27).</>,
  },
  search: venueSearch(V, DOCS, {
    chips: [
      { label: "Special education", query: "special education" }, { label: "English learners", query: "English learner" }, { label: "New schools", query: "Mountain View" },
      { label: "Staffing", query: "FTE" }, { label: "Transportation", query: "transportation" }, { label: "Fund balance", query: "fund balance" },
    ],
    srLabel: "Search the Albemarle County Public Schools budget records", placeholder: "special education, FTE, Mountain View…", tokens: "FTE, ESOL, CSA",
  }),
  files: {
    heading: "Source files",
    docs: DOCS,
    footer: <>The 99 MB book links to ACPS's own copy. Official door: <Ext href="https://www.k12albemarle.org/our-departments/fiscal-services/budget">k12albemarle.org budget</Ext></>,
  },
  caveats: [
    "There's no all-in special education or English learner total: those teachers are inside each school's budget.",
    <>Fund balance: the <Br p={1} /> says $3.3M; the revenue change table shows $3,150,000 one-time (<L l="A-28" />). We didn't confirm the difference.</>,
    <>Language counts differ: 81 home languages (<L l="A-16" />) vs "78 languages" (<L l="E-14" />).</>,
    "Admin/Attendance & Health is $19,732,844 for the School Fund and $19,777,844 for all funds; both are right for their scope, and this page uses the School Fund.",
  ],
};
