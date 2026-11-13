import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CampaignMoneyLookup } from "@/components/site/campaign-money-lookup";
import { DonorView } from "@/components/site/donor-view";
import { CampaignMoneySection, FeaturedMoneyTeaser } from "@/components/site/money-card";
import type { OfficeKind } from "@/lib/campaign-money";
import { FEATURED_MONEY_SLUG, profileMoneyHref } from "@/lib/finance-summaries";
import { findIndexRow, loadFinanceIndex, loadFinanceSummary } from "@/lib/finance-summaries-load";

type Search = { q?: string; office?: OfficeKind; locality?: string; donor?: string; member?: string };

function parseOffice(v: unknown): OfficeKind | undefined {
  if (v === "legislator" || v === "supervisor" || v === "school-board") return v;
  return undefined;
}

export const Route = createFileRoute("/campaign-money")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search.q === "string" ? search.q : undefined,
    office: parseOffice(search.office),
    locality: typeof search.locality === "string" ? search.locality : undefined,
    donor: typeof search.donor === "string" ? search.donor : undefined,
    member: typeof search.member === "string" ? search.member : undefined,
  }),
  loaderDeps: ({ search }: { search: Search }) => ({ member: search.member }),
  loader: async ({ deps }) => {
    const index = await loadFinanceIndex();
    const featured = findIndexRow(index, FEATURED_MONEY_SLUG) ?? null;
    const picked = deps.member ? findIndexRow(index, deps.member) ?? null : null;
    const summary = picked ? await loadFinanceSummary(picked.slug) : null;
    return { featured, picked, summary };
  },
  head: () => ({
    meta: [
      { title: "Campaign money · A Guy on X" },
      {
        name: "description",
        content:
          "See who funds Virginia delegates, senators, supervisors, and school board candidates, from official Virginia Department of Elections filings. Search a name, a district, a donor, or a dollar amount such as $15,000 or $10k+.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { q, office, locality, donor, member } = Route.useSearch();
  const { featured, picked, summary } = Route.useLoaderData();
  const memberSlug = picked?.slug ?? (member || undefined);
  const billsHref = picked ? `${profileMoneyHref(picked.chamber, picked.slug).replace("#campaign-money", "")}#bills` : "#bills";
  const votesHref = picked ? `${profileMoneyHref(picked.chamber, picked.slug).replace("#campaign-money", "")}#votes` : "#votes";

  return (
    <SiteShell>
      <main className="agx-dark flex-1 bg-navy-800 text-white">
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-[#164A3A]" />
          <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-10 sm:px-6">
            <Breadcrumbs
              items={[
                { label: "General Assembly", to: "/dashboards/general-assembly" },
                { label: "Campaign money" },
              ]}
            />
            <p className="mt-6 font-serif text-sm font-semibold tracking-[0.18em] text-[#8FCB9B] uppercase">
              State filings · Official records
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">
              Campaign <span className="text-gold">Money</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-on-dark-muted">
              See who funds Virginia delegates, senators, supervisors, and school board candidates — from the state's own
              campaign finance reports. Search a person, a district, a committee, a donor like Clean Virginia, or a dollar
              amount such as $15,000, 50k, or $10k+. This is not the government's budget.
            </p>
          </div>
        </section>
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
          <CampaignMoneyLookup initialQuery={q ?? ""} initialKind={office ?? "all"} localityId={locality} />

          {donor ? <div className="mt-8"><DonorView donorId={donor} /></div> : null}

          {memberSlug && picked ? (
            <div className="mt-8 mb-8">
              <CampaignMoneySection
                slug={memberSlug}
                summary={summary}
                billsHref={billsHref}
                votesHref={votesHref}
                officialHref={picked.committeeId ? `https://cfreports.elections.virginia.gov/Committee/Index/${picked.committeeId}` : undefined}
                variant="hub"
              />
            </div>
          ) : featured && featured.status === "ready" && featured.cashOnHandCents != null ? (
            <div className="mt-8 mb-8">
              <FeaturedMoneyTeaser
                name={featured.name}
                honorific={featured.honorific}
                district={featured.district}
                chamber={featured.chamber}
                cashOnHandCents={featured.cashOnHandCents}
                raisedCycleCents={featured.raisedCycleCents ?? 0}
                spentCycleCents={featured.spentCycleCents ?? 0}
                asOf={featured.asOf}
                memberSlug={FEATURED_MONEY_SLUG}
              />
              <p className="mt-3 text-sm text-on-dark-muted">
                Featured example: {featured.honorific} {featured.name} ({featured.chamber === "house" ? "HD" : "SD"} {featured.district}).
                The same layout is used for every legislator.{" "}
                <Link to="/dashboards/house/members/$slug" params={{ slug: "terry-g-kilgore" }} className="font-semibold text-gold hover:underline">
                  Open his profile
                </Link>
                .
              </p>
            </div>
          ) : null}

          <p className="mt-6 text-xs text-night-muted">
            Source: Virginia Department of Elections campaign finance reports (cfreports.elections.virginia.gov).
            Totals use the latest amendment of each official report. Committee matches were taken from the state's
            official report files, not from the Virginia Public Access Project.
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
