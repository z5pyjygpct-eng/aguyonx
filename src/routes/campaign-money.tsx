import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CampaignMoneyLookup } from "@/components/site/campaign-money-lookup";
import type { OfficeKind } from "@/lib/campaign-money";

type Search = { q?: string; office?: OfficeKind; locality?: string };

function parseOffice(v: unknown): OfficeKind | undefined {
  if (v === "legislator" || v === "supervisor" || v === "school-board") return v;
  return undefined;
}

export const Route = createFileRoute("/campaign-money")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search.q === "string" ? search.q : undefined,
    office: parseOffice(search.office),
    locality: typeof search.locality === "string" ? search.locality : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Who is funding this campaign? · A Guy on X" },
      {
        name: "description",
        content:
          "Look up official campaign committees at the Virginia Department of Elections for House and Senate members, Board of Supervisors candidates, and school board candidates. You do not need the exact committee title.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { q, office, locality } = Route.useSearch();
  return (
    <SiteShell>
      <main className="agx-dark flex-1 bg-navy-800 text-white">
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8">
            <Breadcrumbs
              items={[
                { label: "General Assembly", to: "/dashboards/general-assembly" },
                { label: "Campaign money" },
              ]}
            />
            <p className="mt-6 font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">Campaign money</p>
            <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">
              Who is funding <span className="text-gold">this campaign?</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-on-dark-muted">
              This is the official campaign committee page at the Virginia Department of Elections, not the
              government's budget. Until we publish our own totals, each result opens that person's state committee
              page in a new tab. You can look up a House or Senate member, a Board of Supervisors candidate, or a
              school board candidate. You do not need the exact committee title.
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
          <CampaignMoneyLookup initialQuery={q ?? ""} initialKind={office ?? "all"} localityId={locality} />
          <p className="mt-6 text-xs text-night-muted">
            Source: Virginia Department of Elections campaign finance reports (cfreports.elections.virginia.gov).
            Committee matches were taken from the state's official report files, not from the Virginia Public Access Project.
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
