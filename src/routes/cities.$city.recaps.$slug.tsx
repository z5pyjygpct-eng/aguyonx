import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Download, ExternalLink, PlayCircle } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { CityMissing } from "@/components/site/city-venue-page";
import {
  CITY_BY_ID,
  CITY_MEETING_BY_ID,
  CITY_VENUES,
  cityJumpUrl,
  type CityId,
} from "@/content/cities";
import { CITY_RECAP_BY_SLUG, type CityRecap } from "@/content/city-recaps";
import type { RecapLink } from "@/content/loudoun-recaps";
import { FTM_TRANSCRIPT_LABEL, ftmTranscriptFor } from "@/content/ftm-transcripts";

export const Route = createFileRoute("/cities/$city/recaps/$slug")({
  component: RecapPage,
  loader: ({ params }): { recap: CityRecap } => {
    const recap = CITY_RECAP_BY_SLUG[params.slug];
    if (!recap || CITY_VENUES[recap.venue].city !== params.city) throw notFound();
    return { recap };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `Recap: ${loaderData.recap.title}, ${loaderData.recap.dateLabel} · A Guy on X` }]
      : [],
  }),
  notFoundComponent: CityMissing,
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
        "inline-flex items-center gap-1 text-[#1E4B8E] underline-offset-2 hover:underline"
      }
    >
      {link.label}
      <ExternalLink className="size-3.5 shrink-0" aria-hidden />
    </a>
  );
}

function RecapPage() {
  const { recap } = Route.useLoaderData();
  const v = CITY_VENUES[recap.venue];
  const c = CITY_BY_ID[v.city as CityId];
  const meeting = CITY_MEETING_BY_ID[recap.meetingId];
  const transcript = ftmTranscriptFor(recap.meetingId);
  const jump = (sec: number) => (meeting ? cityJumpUrl(meeting, sec) : "#");
  const kicker = `${c.name} · ${v.boardLabel}`;
  const boardLabel = v.boardLabel;
  const boardLine = "see the official minutes for the members present";
  const videoNote = `Times are approximate and open the official meeting video (${v.videoHost}) at that point.`;

  return (
    <SiteShell>
      <HomeSearch />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          <Link to="/cities" className="hover:text-foreground hover:underline">
            VA Cities
          </Link>
          <span className="mx-2 text-border">/</span>
          <Link
            to={v.route}
            params={{ city: v.city }}
            className="hover:text-foreground hover:underline"
          >
            {v.name}
          </Link>
          <span className="mx-2 text-border">/</span>
          Meeting recap
        </p>
        <Kicker className="mt-4">{kicker}</Kicker>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
          {recap.title}, {recap.dateLabel}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{recap.whenWhere}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          {/* Left: decisions + votes + moments */}
          <div className="space-y-6">
            <section className="rounded-md border border-border bg-card px-4 py-5 sm:px-5">
              <Kicker>What was decided · How each member voted</Kicker>
              {recap.official.votesPosted && recap.decisions.length > 0 ? (
                <ul className="mt-3 space-y-3">
                  {recap.decisions.map((d) => (
                    <li key={`${d.item}-${d.action}`} className="text-sm">
                      <span className="font-mono text-xs font-semibold text-[#1E4B8E]">
                        {d.item}
                      </span>{" "}
                      {d.action}
                      {d.tally ? <span className="font-semibold"> · {d.tally}</span> : null}{" "}
                      <OutLink link={d.source} />
                    </li>
                  ))}
                </ul>
              ) : (
                <aside className="mt-3 rounded-r-md border-l-4 border-[#c47a3a] bg-[#fdf0e6] px-4 py-3 text-sm text-[#6b3a12]">
                  <strong className="font-semibold">Official vote record not yet posted.</strong>{" "}
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
                {boardLabel}: {boardLine}. Member-by-member votes will be listed here from the
                official record.
              </p>
            </section>

            <section className="rounded-md border border-border bg-card px-4 py-5 sm:px-5">
              <Kicker>Moments worth watching</Kicker>
              <ul className="mt-3 divide-y divide-border">
                {recap.moments.map((m) => (
                  <li key={m.seconds} className="flex items-start gap-3 py-2.5">
                    <a
                      href={jump(m.seconds)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#0d7377] px-2.5 py-1 font-mono text-xs font-semibold tabular-nums text-white hover:bg-[#095456]"
                      aria-label={`Jump to ${secToHms(m.seconds)} in the meeting video`}
                    >
                      <PlayCircle className="size-3.5" aria-hidden />
                      {secToHms(m.seconds)}
                    </a>
                    <p className="text-sm leading-snug">
                      {m.item ? (
                        <span className="font-mono text-xs font-semibold text-[#1E4B8E]">
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
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                {videoNote}
                {transcript ? (
                  <>
                    {" "}
                    Search every spoken word in{" "}
                    <Link
                      to={v.route}
                      params={{ city: v.city }}
                      className="text-[#1E4B8E] underline-offset-2 hover:underline"
                    >
                      Find the Moment
                    </Link>
                    . {FTM_TRANSCRIPT_LABEL}
                  </>
                ) : null}
              </p>
            </section>

            {recap.transcriptDownloads ? (
              <section className="rounded-md border border-border bg-card px-4 py-5 sm:px-5">
                <Kicker>Download full transcript</Kicker>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={recap.transcriptDownloads.pdfUrl}
                    download
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#1E4B8E] px-3 py-1.5 font-sans text-xs font-semibold tracking-wide text-white uppercase hover:bg-[#163a6e]"
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
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#1E4B8E] px-3 py-1.5 font-sans text-xs font-semibold tracking-wide text-[#1E4B8E] uppercase hover:bg-[#e8eef6]"
                  >
                    <Download className="size-3.5" aria-hidden />
                    Text
                  </a>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Machine transcript (speech-to-text) produced by Coraggio Consulting. Not an
                  official city record. Names and numbers may be misspelled; check the video at the
                  timestamp before quoting.
                </p>
              </section>
            ) : null}
          </div>

          {/* Right: agenda */}
          <section className="rounded-md border border-border bg-card px-4 py-5 sm:px-5">
            <Kicker>On the agenda</Kicker>
            <p className="mt-1 text-xs text-muted-foreground">
              Items as listed by the city, with staff reports. Not results.
            </p>
            {recap.agenda.map((g) => (
              <div key={g.heading} className="mt-4">
                <h2 className="font-sans text-sm font-semibold">{g.heading}</h2>
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
                          className="leading-5 text-foreground underline-offset-2 hover:text-[#1E4B8E] hover:underline"
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
      </main>
    </SiteShell>
  );
}
