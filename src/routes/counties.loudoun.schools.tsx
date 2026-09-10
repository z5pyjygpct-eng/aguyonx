import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, FileText, User } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { LcpsMeetingSearch } from "@/components/site/lcps-meeting-search";
import { LcpsPolicySearch } from "@/components/site/lcps-policy-search";
import {
  LCPS_MEETINGS,
  LCPS_OFFICIAL_DOORS,
  LCPS_SCHOOL_BOARD,
} from "@/content/lcps";
import { LCPS_POLICY_BOOK, lcpsPolicyCount, lcpsPolicyHostedCount } from "@/content/lcps-policies";
import { LCPS_BUDGET_DOCS, LCPS_BUDGET_FY27 } from "@/content/lcps-budget";

export const Route = createFileRoute("/counties/loudoun/schools")({
  component: LoudounSchoolsPage,
});

function LoudounSchoolsPage() {
  return (
    <SiteShell>
      <HomeSearch />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          <Link to="/counties" className="hover:text-foreground hover:underline">
            VA Counties
          </Link>
          <span className="mx-2 text-border">/</span>
          <Link to="/counties/loudoun" className="hover:text-foreground hover:underline">
            Loudoun
          </Link>
          <span className="mx-2 text-border">/</span>
          Schools
        </p>
        <Kicker className="mt-4">Virginia · Northern Virginia</Kicker>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Loudoun Schools
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          <span className="font-medium text-foreground">Find the Moment</span> for Loudoun County
          Public Schools School Board — {LCPS_MEETINGS.length} full Board meetings indexed (2026
          YTD). Captions are an index, not quotes. County Board of Supervisors lives on the{" "}
          <Link
            to="/counties/loudoun"
            className="text-[#1E4B8E] underline-offset-2 hover:underline"
          >
            Loudoun County
          </Link>{" "}
          door.
        </p>

        <div className="mt-10">
          <LcpsMeetingSearch />
          <p className="mt-4 text-sm text-muted-foreground">
            <Link
              to="/counties/loudoun/find-the-moment"
              className="text-[#1E4B8E] underline-offset-2 hover:underline"
            >
              Also search County in the same box →
            </Link>
          </p>
        </div>

        <section className="mt-14">
          <Kicker>School Board</Kicker>
          <h2 className="mt-2 font-serif text-3xl font-medium">Thin roster</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Name, district, role. No bios, no finance, no person pages.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {LCPS_SCHOOL_BOARD.map((m) => (
              <li
                key={m.name}
                className="flex items-center gap-4 rounded-md border border-border bg-card px-4 py-4 sm:px-5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#1E4B8E]/30 text-[#1E4B8E]">
                  <User className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-base font-semibold">{m.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {m.role} · {m.district}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14" id="budget">
          <Kicker>Budget</Kicker>
          <h2 className="mt-2 font-serif text-3xl font-medium">Schools money, kitchen-table</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Loudoun schools run July–June. {LCPS_BUDGET_FY27.fiscalYear} is{" "}
            {LCPS_BUDGET_FY27.fiscalSpan}. The Superintendent proposes. The School Board revises and
            sends a request. The{" "}
            <span className="font-medium text-foreground">Board of Supervisors appropriates</span>{" "}
            the local dollars. Schools here are fiscally dependent on the county — they don’t set
            the property tax. Proposed is not adopted. Dollars below are from Loudoun County’s
            adopted books.
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            <li className="rounded-md border border-border bg-card px-5 py-5">
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                School Operating · BOS Adopted
              </p>
              <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-[#1E4B8E]">
                {LCPS_BUDGET_FY27.schoolOperatingAdoptedLabel}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Day-to-day run for one year — not the building plan. Local tax funding transferred
                to schools:{" "}
                <span className="font-medium text-foreground">
                  {LCPS_BUDGET_FY27.localTaxFundingLabel}
                </span>
                . Rest is state and other sources on the same schedule.
              </p>
            </li>
            <li className="rounded-md border border-border bg-card px-5 py-5">
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                Capital · first year appropriated
              </p>
              <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-[#1E4B8E]">
                {LCPS_BUDGET_FY27.schoolCapitalProjectsLabel}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                School Capital Projects Fund (CIP year one). School CAPP (preservation):{" "}
                <span className="font-medium text-foreground">
                  {LCPS_BUDGET_FY27.schoolCappLabel}
                </span>
                . Six-year plan; later years can change.
              </p>
            </li>
          </ul>

          <div className="mt-6 rounded-md border border-border bg-wash px-5 py-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Year-over-year (operating, BOS adopted):</span>{" "}
              FY2026 {LCPS_BUDGET_FY27.fy26OperatingAdoptedLabel} → {LCPS_BUDGET_FY27.fiscalYear}{" "}
              {LCPS_BUDGET_FY27.schoolOperatingAdoptedLabel} (
              {LCPS_BUDGET_FY27.yoyChangeLabel}). Don’t mix last year’s Superintendent ask with this
              year’s county appropriation.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Honest caveat:</span> We have the
              county’s adopted {LCPS_BUDGET_FY27.fiscalYear} school fund totals. We do{" "}
              <span className="font-medium text-foreground">not</span> yet have the FY2027 LCPS SEON
              or School Board Adopted budget book on file for this shelf — so we are not claiming
              what the division “asked for” in FY2027 from LCPS PDFs. Mid-year amendments after
              April 2026 are also unverified here.
            </p>
          </div>

          <p className="mt-8 font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Hosted source PDFs
          </p>
          <ul className="mt-3 space-y-2">
            {LCPS_BUDGET_DOCS.map((doc) => (
              <li key={doc.href}>
                <a
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-md border border-border bg-paper px-4 py-3 transition-[background-color] duration-150 hover:bg-wash"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-[#1E4B8E]/30 text-[#1E4B8E]">
                    <FileText className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="font-sans text-base font-semibold text-foreground">
                        {doc.label}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {doc.sizeLabel} · {doc.source}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{doc.dek}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Sources: Loudoun County FY2027 Adopted Budget Executive Summary and Budget in Brief.
            Official county budget door:{" "}
            <a
              href="https://www.loudoun.gov/budget"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1E4B8E] underline-offset-2 hover:underline"
            >
              loudoun.gov/budget
            </a>
            . Longer kitchen-table walk-through:{" "}
            <a
              href="/files/lcps-budget/LCPS-budget-kitchen-table.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1E4B8E] underline-offset-2 hover:underline"
            >
              plain-English guide
            </a>
            .
          </p>
        </section>

        <section className="mt-14">
          <Kicker>Policies</Kicker>
          <h2 className="mt-2 font-serif text-3xl font-medium">Policies</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Current BoardDocs book — {LCPS_POLICY_BOOK}. {lcpsPolicyCount()} active
            policies; {lcpsPolicyHostedCount()} with hosted PDFs (full current book).
          </p>
          <div className="mt-8">
            <LcpsPolicySearch />
          </div>
        </section>

        <section className="mt-14">
          <Kicker>Official doors</Kicker>
          <h2 className="mt-2 font-serif text-3xl font-medium">Out to the record</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            BoardDocs packets and LCPS-TV. Jump links open Vimeo from Find the Moment.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {LCPS_OFFICIAL_DOORS.map((door) => (
              <li key={door.href}>
                <a
                  href={door.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col rounded-md border border-border bg-card px-5 py-5 transition-[background-color] duration-150 hover:bg-wash"
                >
                  <span className="inline-flex items-center gap-2 font-serif text-xl font-medium">
                    {door.label}
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </span>
                  <span className="mt-2 text-sm text-muted-foreground">{door.dek}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </SiteShell>
  );
}
