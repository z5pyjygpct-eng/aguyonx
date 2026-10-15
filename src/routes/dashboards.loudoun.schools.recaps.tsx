import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { dateMeta, useMeetingFilters } from "@/components/site/meeting-filters";
import { LCPS_MEETINGS } from "@/content/lcps";
import { LOUDOUN_RECAPS } from "@/content/loudoun-recaps";
import { FoiaLcps, Pager, V4Hero, V4Main, pageCount, pageSlice, parseDate } from "@/components/site/lcps-v4";

const KIND: Record<string, string> = { full_board: "Full board", committee: "Committee", appeals: "Appeals", closed: "Closed session", other: "Other" };
const MEETING = Object.fromEntries(LCPS_MEETINGS.map((m) => [m.id, m]));
const kind = (id: string) => KIND[MEETING[id]?.kind ?? "full_board"] ?? "Other";

export const Route = createFileRoute("/dashboards/loudoun/schools/recaps")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Math.max(1, Number(s.page) || 1) }),
  head: () => ({ meta: [{ title: "LCPS Meeting Recaps · A Guy on X" }] }),
  component: Page,
});

function Page() {
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const list = useMemo(
    () => LOUDOUN_RECAPS.filter((r) => r.venue === "loudoun-lcps").sort((a, b) => parseDate(b.dateLabel) - parseDate(a.dateLabel)),
    [],
  );
  const f = useMeetingFilters(list, (r) => dateMeta(r.dateLabel, kind(r.meetingId)), "recaps");
  const pages = pageCount(f.filtered.length);
  const cur = Math.min(page, pages);
  const { rows } = pageSlice(f.filtered, cur);
  const go = (p: number) => {
    navigate({ search: { page: p } });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };
  return (
    <SiteShell>
      <V4Main>
        <V4Hero kicker="Meeting Recaps" crumb="Meeting Recaps" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif text-3xl font-semibold uppercase">Meeting Recaps</h2>
            <FoiaLcps />
          </div>
          {f.controls}
          <ul className="mt-6 flex flex-col gap-3">
            {rows.map((r) => {
              const [wd, ...rest] = r.dateLabel.split(", ");
              return (
                <li key={r.slug}>
                  <Link to="/counties/loudoun/recaps/$slug" params={{ slug: r.slug }} className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-navy-line border-l-4 border-l-gold bg-navy-700 px-5 py-4 hover:bg-navy-600">
                    <span className="w-36 shrink-0">
                      <span className="block font-serif text-xs tracking-[0.16em] text-gold uppercase">{wd}</span>
                      <span className="block font-serif text-lg">{rest.join(", ")}</span>
                    </span>
                    <span className="min-w-0 flex-1 basis-60 font-semibold">{r.title}</span>
                    {r.official.votesPosted ? (
                      <span className="rounded-full border border-[#2e8f5e] bg-[#2eb46e]/15 px-3 py-1.5 text-xs font-semibold text-[#7be0ae]">✓ Official votes posted</span>
                    ) : (
                      <span className="rounded-full border border-flag bg-flag/15 px-3 py-1.5 text-xs font-semibold text-[#ffb3bf]" title="Votes are added only from the official minutes. Not posted for this meeting yet.">Official votes not yet posted</span>
                    )}
                    <ArrowRight className="size-5 text-gold" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
          <Pager page={cur} pages={pages} onGo={go} />
        </div>
      </V4Main>
    </SiteShell>
  );
}
