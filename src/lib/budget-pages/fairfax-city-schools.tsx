/**
 * City of Fairfax Schools (City School Board) budget page, FY2027 School Board Approved.
 * Figures: /workspace/budget-fairfax-city-schools/REPORT.md only. Slide number = PDF page.
 * FCPS operates the City's schools, so there's no special ed / English learner / department data.
 * The School Board's approved $79,386,084 is never combined with the City book's $77,684,433 (different basis).
 */
import { Bar, YoyBars, type BudgetPageData } from "@/components/site/budget-page";
import { pctOf, S, Ext, vdoc, venueSearch } from "@/lib/budget-pages/shared";

const V = "fairfax-city-schools";
const WS = "https://4.files.edl.io/57aa/02/10/26/183512-51ffd6ba-25f6-4136-a20a-c42eb1e6528f.pdf";
const PROP = "https://4.files.edl.io/fb01/01/07/26/192823-0cf1f7bf-556c-4ba5-942a-9ec5145258b7.pdf";
const RELEASE = "https://www.cityoffairfaxschools.org/apps/news/article/2165234";
const CITY_BOOK = "https://opendatastorageprodus.blob.core.windows.net/fairfaxva-pdf-9e6056fe-8306-4878-8c83-a29d45ce3c8d/fy-2027-adopted-budget---city-of-fairfax.pdf";
const ws = (n: number) => `${WS}#page=${n}`;
const pp = (n: number) => `${PROP}#page=${n}`;
const W = ({ n }: { n: number }) => <S href={ws(n)}>Jan 26 slide {n}</S>;
const Pr = ({ n }: { n: number }) => <S href={pp(n)}>Jan 5 slide {n}</S>;
const TOTAL = 79_386_084;
const OPS = 1_274_429;

const LINES: [string, string, number][] = [
  ["FCPS tuition (net)", "$73.8M", 73_754_574], ["Debt service", "$4.3M", 4_337_081], ["Operating costs", "$1.3M", 1_274_429], ["Improvements", "$20K", 20_000],
];
const OPLINES: [string, number][] = [
  ["Salaries", 587_035], ["Contract services", 480_770], ["Benefits", 143_124], ["Regional agency fees", 20_420],
  ["Training & travel", 13_300], ["Other services", 12_500], ["Dues & subscriptions", 12_280], ["Office supplies", 5_000],
];

const DOCS = [
  vdoc(V, "FY27-budget-work-session-2026-01-26", { label: "FY2027 Budget Work Session (Jan 26, 2026)", kind: "School Board", dek: "Revised figures that match the approved $79,386,084: budget summary (slide 6), operating costs (slides 8–9), tuition outlook (slide 10).", bytes: 4_947_720, official: WS, source: "cityoffairfaxschools.org" }),
  vdoc(V, "FY27-superintendent-proposed-presentation-2026-01-05", { label: "FY2027 Superintendent's Proposed Budget (Jan 5, 2026)", kind: "Proposed", dek: "First proposal ($80,189,606), how the FCPS agreement works (slides 6–7), tuition history (slide 10), state revenue (slide 16).", bytes: 12_571_955, official: PROP, source: "cityoffairfaxschools.org" }),
];

export const FAIRFAX_CITY_SCHOOLS_BUDGET_PAGE: BudgetPageData = {
  venue: V,
  hero: {
    label: "FY2027 School Board Approved Budget (unanimous)",
    amountLabel: "$79,386,084",
    body: <>
      City of Fairfax Schools doesn't run its own schools. Under a 1962 agreement, Fairfax County Public Schools (FCPS) runs the four City-owned schools, hires the staff and sets the curriculum, so most of this budget is tuition paid to FCPS.
      Up <span className="font-mono text-gold">+$5,063,509</span> (+6.8%, our calc) from the FY2026 estimate of $74,322,575.
    </>,
    note: <>There is no School Board budget book or adopted budget document. The approved total comes from the School Board's <S href={RELEASE}>news release</S> and the <W n={6} />. The agreement is described on <Pr n={6} />.</>,
  },
  callouts: [
    { title: "FCPS Tuition", key: ["$73.8M", "92.9%"], href: ws(6),
      text: "$73,754,574 in tuition to FCPS, after the classroom rental credit and year-end true-up: 92.9% of the budget (our calc), up $4,908,864. FCPS expects 3,103 City students and about $77.0 million in tuition from the City. Cost per student was $22,374 in FY2026 (estimate).",
      source: "Work session Jan 26, 2026, slide 6 (budget summary) and slide 10 (FCPS outlook); proposed Jan 5, 2026, slide 10 (cost per student)." },
    { title: "Debt Service", key: ["$4.3M"], href: ws(6),
      text: "$4,337,081 for debt payments, 5.5% of the budget (our calc), down $6,731 from FY2026's $4,343,812.",
      source: "Work session Jan 26, 2026, slide 6." },
    { title: "Operations", key: ["$1.27M", "+$161,376"], href: ws(8),
      text: "$1,274,429 to run the small central office and support the schools, up $161,376. It includes $285,000 in supplemental and instructional funds sent straight to schools, up from $209,381. Special education and English learner services come from FCPS and aren't broken out for City students.",
      source: "Work session Jan 26, 2026, slides 6, 8 and 9; proposed Jan 5, 2026, slide 7 (City students use FCPS special education services)." },
  ],
  categories: {
    ariaLabel: "Approved budget by line",
    items: LINES.map(([name, short, value]) => ({ name, short, value, pct: pctOf(value, TOTAL) })),
    gridClass: "lg:grid-cols-4",
    source: <>Source: <W n={6} />, Operating Budget Summary (the four lines add to $79,386,084; tuition is "inclusive of tuition, classroom rental credit, and year end true up"). % is our calc. Only four lines exist, so there are four boxes.</>,
  },
  departments: {
    heading: "Operating Costs, Line by Line",
    chips: [],
    chipGroupLabel: "",
    items: OPLINES.map(([name, value]) => ({ name, page: 8, pageLabel: "slide 8", value, cats: [], pct: pctOf(value, OPS) })),
    allNote: "There are no departments: these are the eight lines of the $1,274,429 operating budget. % is share of operating costs (our calc).",
    filterNote: () => "",
    spanNote: "Contract services include grounds, legal, facility and communications support, and the $285,000 for schools (slide 9).",
    pageHref: ws,
    source: <>Source: <W n={8} /> (FY2027 column, which matches the approved operating total) and <W n={9} /> (contract services).</>,
  },
  questions: [
    { q: "Where does the money come from?", body: <>
      <Bar parts={[
        { label: "State: basic aid", value: 9_526_349, color: "#F5B82E" },
        { label: "State: sales tax", value: 4_965_922, color: "#C8102E" },
        { label: "Everything else (mostly the City)", value: TOTAL - 14_492_271, color: "#6E8FC4" },
      ]} />
      <p className="mt-3 text-sm text-night-muted">State revenue $14,492,271 (<Pr n={16} />), about 18.3% of the approved budget (our calc). The schools' documents publish no full revenue table, so "everything else" is our calc; it comes mostly from the City's General Fund.</p>
    </> },
    { q: "Where does it go?", body: <>
      <Bar parts={LINES.map(([label, , value], i) => ({ label, value, color: ["#F5B82E", "#C8102E", "#6E8FC4", "#9AA9C2"][i]! }))} />
      <p className="mt-3 text-sm text-night-muted">From the <W n={6} />. The City's four schools: Fairfax High (with the Fairfax Academy), Katherine Johnson Middle, Daniels Run Elementary and Providence Elementary (<Pr n={3} />).</p>
    </> },
    { q: "What's changing year over year?", body: <>
      <YoyBars max={TOTAL} rows={[{ y: "FY2025 actual", v: 71_672_441 }, { y: "FY2026 est.", v: 74_322_575 }, { y: "FY2027", v: TOTAL, current: true }]} />
      <p className="mt-4 font-serif text-3xl font-bold text-gold tabular-nums">+$5,063,509</p>
      <p className="text-sm text-night-muted">+6.8% over the FY2026 estimate (our calc; <W n={6} />). Tuition per student went from $14,436 in FY2017 to $22,374 in FY2026 (estimate) (<Pr n={10} />).</p>
    </> },
  ],
  how: {
    steps: [
      ["Proposed", "Superintendent presents the proposed budget (Jan 5, 2026)"],
      ["Work session", "School Board work session with revised figures (Jan 26, 2026)"],
      ["School Board Approved", "School Board approves the budget unanimously (about Feb 9, 2026)"],
    ],
    note: <>The approval date is our reading of the <S href={RELEASE}>release</S>, which says "last night" and is dated Feb 10, 2026; the slide timeline had planned Feb 2. After that, the money goes through the City's budget: the City Manager presented on Feb 24, a joint work session with City Council was Mar 3, and Council adopted the City budget on May 5, 2026 (<S href={`${CITY_BOOK}#page=11`}>City book p.11</S>).</>,
  },
  search: venueSearch(V, DOCS, {
    chips: [{ label: "Tuition", query: "tuition" }, { label: "ADM", query: "ADM" }, { label: "Special education", query: "special education" }, { label: "Debt", query: "debt" }, { label: "State revenue", query: "state" }],
    srLabel: "Search the City of Fairfax Schools budget records", placeholder: "tuition, ADM, 285,000…", tokens: "tuition, ADM, debt",
  }),
  files: {
    heading: "Source files",
    docs: DOCS,
    footer: <>No School Board budget book or adopted budget PDF exists. Also: <Ext href={RELEASE}>School Board approval release</Ext> · <Ext href={`${CITY_BOOK}#page=313`}>City budget book, School Board section (pp.313–322)</Ext></>,
  },
  caveats: [
    "No approved or adopted budget document exists; the approved total comes from the news release and the Jan 26 work session slides.",
    "The Jan 5 proposal was $80,189,606 (tuition $74,534,096). The Jan 26 revision, $79,386,084, is what the School Board approved.",
    <>The City's own budget shows a different number for schools, $77,684,433 (<S href={`${CITY_BOOK}#page=314`}>City book p.314</S>), because it counts tuition before credits ($76,429,791) and budgets school debt separately ($4,904,843). We don't mix the two on this page.</>,
    <>The City book's performance table (<S href={`${CITY_BOOK}#page=316`}>p.316</S>) shows 3,050 students and $19,284 per student, flat for three years, which doesn't match the 3,103 students and $22,310–$22,374 per student in the school slides.</>,
  ],
};
