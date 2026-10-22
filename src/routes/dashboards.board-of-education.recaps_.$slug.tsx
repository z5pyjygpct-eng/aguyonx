import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Download, ExternalLink, PlayCircle } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
import { Kicker } from "@/components/site/kicker";
import { ShareMoment } from "@/components/site/share-moment";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { FoiaButton } from "@/components/site/venue-v4";
import { FOIA } from "@/lib/dashboards";
import { VBOE_MEETINGS, vboeVideoUrl } from "@/content/va-boe";
import { VBOE_RECAP_BY_SLUG } from "@/content/vboe-recaps";
import type { RecapLink } from "@/content/loudoun-recaps";

const MEETING_BY_ID = Object.fromEntries(VBOE_MEETINGS.map((m) => [m.id, m]));
const CRUMBS = [
  { label: "Virginia Department of Education" },
  { label: "Board of Education", to: "/dashboards/$body", params: { body: "board-of-education" } },
  { label: "Meeting Recaps", to: "/dashboards/board-of-education/recaps" },
];

export const Route = createFileRoute("/dashboards/board-of-education/recaps_/$slug")({
  component: RecapPage,
  loader: ({ params }) => {
    const recap = VBOE_RECAP_BY_SLUG[params.slug];
    if (!recap) throw notFound();
    return { recap };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `Recap: Board of Education ${loaderData.recap.title}, ${loaderData.recap.dateLabel} · A Guy on X` }] : [],
  }),
  notFoundComponent: Missing,
});

function secToHms(raw: number): string {
  const s = Math.floor(raw);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function OutLink({ link, className }: { link: RecapLink; className?: string }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ??
        "inline-flex items-center gap-1 text-gold underline-offset-2 hover:underline"
      }
    >
      {link.label}
      <ExternalLink className="size-3.5 shrink-0" aria-hidden />
    </a>
  );
}

function RecapPage() {
  const { recap } = Route.useLoaderData();
  const meeting = MEETING_BY_ID[recap.meetingId];
  const jump = (sec: number) => (meeting ? vboeVideoUrl(meeting, sec) : "#");
  const share = `Va. Board of Education, ${recap.dateLabel}`;
  return (
    <SiteShell>
      <V4Main>
      <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
        <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
        <div className="mx-auto max-w-6xl px-5 pt-6 pb-10 sm:px-8">
            <Breadcrumbs items={[...CRUMBS, { label: recap.dateLabel }]} />
            <Kicker className="mt-6 font-serif text-sm font-semibold tracking-[0.18em] text-gold sm:text-base">Virginia · Board of Education</Kicker>
            <h1 className="mt-2 font-serif text-3xl font-bold uppercase leading-[1.08] sm:text-5xl">
              {recap.dateLabel} · {recap.title}
            </h1>
            <p className="mt-3 text-sm text-on-dark-muted sm:text-base">{recap.whenWhere}</p>
            <div className="mt-5"><FoiaButton foia={FOIA.vdoe} /></div>

        </div>
      </section>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
            {/* Left: decisions + votes + moments */}
            <div className="space-y-6">
              <section className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 px-4 py-5 sm:px-6">
                <Kicker className="text-gold">What was decided · How each member voted</Kicker>
                {recap.official.votesPosted && recap.decisions.length > 0 ? (
                  <ul className="mt-3 space-y-3">
                    {recap.decisions.map((d) => (
                      <li key={`${d.item}-${d.action}`} className="text-sm">
                        <span className="font-mono text-xs font-semibold text-gold">
                          {d.item}
                        </span>{" "}
                        {d.action}
                        {d.tally ? <span className="font-semibold"> · {d.tally}</span> : null}{" "}
                        <OutLink link={d.source} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <aside className="mt-3 rounded-r-md border-l-4 border-gold bg-gold/10 px-4 py-3 text-sm text-[#F6F3EA]">
                    <strong className="font-semibold">
                      {recap.official.votesPosted
                        ? "No votes recorded in the official record."
                        : "Official vote record not yet posted."}
                    </strong>{" "}
                    {recap.official.note.replace(/^Official vote record not yet posted\.\s*/, "")}
                    <span className="mt-1 block text-xs">
                      Last checked {recap.official.checkedLabel}.
                    </span>
                  </aside>
                )}
                <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                  {recap.official.links.map((l) => (
                    <li key={l.href}>
                      <OutLink link={l} />
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  Source: official minutes posted by VDOE on Virginia Regulatory Town Hall. Motion text is quoted; where
                  the minutes give a roll call or names, it appears in the quoted text. Teacher-license cases are counted, not named.
                </p>
              </section>

              <section className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 px-4 py-5 sm:px-6">
                <Kicker className="text-gold">Moments worth watching</Kicker>
                <ul className="mt-3 divide-y divide-border">
                  {recap.moments.map((m) => (
                    <li key={m.seconds} className="flex items-start gap-3 py-2.5">
                      <a
                        href={jump(m.seconds)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-gold px-2.5 py-1 font-mono text-xs font-semibold tabular-nums text-navy-900 hover:brightness-110"
                        aria-label={`Jump to ${secToHms(m.seconds)} in the meeting video`}
                      >
                        <PlayCircle className="size-3.5" aria-hidden />
                        {secToHms(m.seconds)}
                      </a>
                      <p className="text-sm leading-snug">
                        {m.item ? (
                          <span className="font-mono text-xs font-semibold text-gold">
                            Item {m.item}
                          </span>
                        ) : null}{" "}
                        {m.label}
                        {m.quote ? (
                          <span className="mt-1 block text-muted-foreground">
                            “{m.quote}”{" "}
                            <em className="text-xs">(machine-transcribed; check the video)</em>
                          </span>
                        ) : null}
                        {(
                          <ShareMoment
                            videoUrl={jump(m.seconds)}
                            recapUrl={`https://aguyonx.com/dashboards/board-of-education/recaps/${recap.slug}`}
                            text={m.item ? `Item ${m.item}: ${m.label}` : m.label}
                            context={share}
                            time={secToHms(m.seconds).replace(/^0/, "")}
                          />
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">
                  Times are approximate and open VDOE’s official YouTube video at that point. Moments were found in the
                  machine transcript; labels describe the topic only. Search every spoken word in{" "}
                  <Link to="/dashboards/board-of-education/find-the-moment" search={{ page: 1 }} className="text-gold underline-offset-2 hover:underline">Find the Moment</Link>.
                </p>
              </section>

              {recap.transcriptDownloads ? (
                <section className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 px-4 py-5 sm:px-6">
                  <Kicker className="text-gold">Download full transcript</Kicker>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={recap.transcriptDownloads.pdfUrl}
                      download
                      className="inline-flex items-center gap-1.5 rounded-md bg-gold px-3 py-1.5 font-sans text-xs font-semibold tracking-wide text-navy-900 uppercase hover:brightness-110"
                    >
                      <Download className="size-3.5" aria-hidden />
                      PDF
                      {recap.transcriptDownloads.pdfNote ? (
                        <span className="font-normal normal-case opacity-80">
                          · {recap.transcriptDownloads.pdfNote}
                        </span>
                      ) : null}
                    </a>
                    <a
                      href={recap.transcriptDownloads.txtUrl}
                      download
                      className="inline-flex items-center gap-1.5 rounded-md border border-gold px-3 py-1.5 font-sans text-xs font-semibold tracking-wide text-gold uppercase hover:bg-gold/10"
                    >
                      <Download className="size-3.5" aria-hidden />
                      Text
                    </a>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Machine transcript (speech-to-text) produced by Coraggio Consulting. Not an
                    official VDOE record. Names and numbers may be misspelled; check the video at
                    the timestamp before quoting.
                  </p>
                </section>
              ) : null}
            </div>

            {/* Right: agenda */}
            <section className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 px-4 py-5 sm:px-6">
              <Kicker className="text-gold">On the agenda</Kicker>
              <p className="mt-1 text-xs text-muted-foreground">
                Lettered items as recorded in the official minutes. Not results.
              </p>
              {recap.agenda.map((g) => (
                <div key={g.heading} className="mt-4">
                  <h2 className="font-serif text-base font-semibold tracking-wide text-white uppercase">{g.heading}</h2>
                  {g.dek ? <p className="text-xs text-muted-foreground">{g.dek}</p> : null}
                  <ul className="mt-1.5 space-y-1 text-sm">
                    {g.items.map((it) => (
                      <li key={it.num} className="flex gap-2">
                        <span className="w-14 shrink-0 font-mono text-xs leading-5 text-muted-foreground">
                          {it.num}
                        </span>
                        {it.href ? (
                          <a
                            href={it.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="leading-5 text-foreground underline-offset-2 hover:text-gold hover:underline"
                          >
                            {it.title}
                          </a>
                        ) : (
                          <span className="leading-5">{it.title}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {recap.context.length > 0 ? (
                <div className="mt-5 border-t border-border pt-3">
                  {recap.context.map((c) => (
                    <p key={c.text} className="text-xs text-muted-foreground">
                      {c.text} Source: <OutLink link={c.source} />
                    </p>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
      </div>
      </V4Main>
    </SiteShell>
  );
}

function Missing() {
  return (
    <SiteShell>
      <V4Main>
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <Breadcrumbs items={[...CRUMBS, { label: "Recap not found" }]} className="mb-8 [&_ol]:justify-center" />
          <h1 className="font-serif text-3xl font-medium">No recap for that meeting yet</h1>
          <p className="mt-4"><Link to="/dashboards/board-of-education/recaps" search={{ page: 1 }} className="text-gold underline-offset-2 hover:underline">Back to Board of Education recaps</Link></p>
        </div>
      </V4Main>
    </SiteShell>
  );
}
