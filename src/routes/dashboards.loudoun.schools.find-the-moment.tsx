import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { LcpsMeetingSearch } from "@/components/site/lcps-meeting-search";
import { FtmThumb } from "@/components/site/ftm-thumb";
import { dateMeta, useMeetingFilters } from "@/components/site/meeting-filters";
import { LCPS_MEETINGS } from "@/content/lcps";
import { FoiaLcps, Pager, V4Hero, V4Main, pageCount, pageSlice, parseDate } from "@/components/site/lcps-v4";

const KIND: Record<string, string> = { full_board: "Full board", committee: "Committee", appeals: "Appeals", closed: "Closed session", other: "Other" };
const kind = (k?: string) => KIND[k ?? "full_board"] ?? k ?? "Other";

export const Route = createFileRoute("/dashboards/loudoun/schools/find-the-moment")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Math.max(1, Number(s.page) || 1) }),
  head: () => ({ meta: [{ title: "LCPS Find the Moment · A Guy on X" }] }),
  component: Page,
});

function Page() {
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const sorted = useMemo(() => [...LCPS_MEETINGS].sort((a, b) => parseDate(b.dateLabel) - parseDate(a.dateLabel)), []);
  const f = useMeetingFilters(sorted, (m) => dateMeta(m.dateLabel, kind(m.kind)), "meetings");
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
        <V4Hero kicker="Find the Moment" crumb="Find the Moment" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
          <div className="lcps-v4-search rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-1 sm:p-2">
            <LcpsMeetingSearch />
          </div>
          <p className="mt-2 text-xs text-night-muted">Captions are an index, not quotes. Verify on the video.</p>
          <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif text-3xl font-semibold uppercase">Meeting videos</h2>
            <FoiaLcps />
          </div>
          {f.controls}
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {rows.map((m) => (
              <li key={m.id} className="overflow-hidden rounded-xl border border-navy-line bg-navy-700">
                <a href={m.playerUrl} target="_blank" rel="noreferrer" className="block">
                  <div className="relative aspect-video border-b-[3px] border-gold bg-gradient-to-br from-navy-900 to-navy-600">
                    <FtmThumb venue="loudoun-lcps" meetingId={m.id} top={false} className="!absolute inset-0 !w-full" />
                    <span className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-0.5 font-serif text-xs">{m.duration}</span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold">{m.dateLabel.replace(/^[A-Za-z]+, /, "")} · {kind(m.kind)}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-on-dark-muted">{m.committeeName ?? m.title}</p>
                    <p className="mt-1 text-xs text-night-muted">Vimeo · {m.duration}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
          <Pager page={cur} pages={pages} onGo={go} />
        </div>
      </V4Main>
    </SiteShell>
  );
}
