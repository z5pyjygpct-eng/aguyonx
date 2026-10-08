import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink, PlayCircle } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { LOUDOUN_BOS, LOUDOUN_MEETING_BY_ID, loudounMeetingJumpUrl } from "@/content/loudoun";
import { LOUDOUN_RECAP_BY_SLUG, type RecapLink } from "@/content/loudoun-recaps";
import { FTM_TRANSCRIPT_LABEL, ftmTranscriptFor } from "@/content/ftm-transcripts";

export const Route = createFileRoute("/counties/loudoun/recaps/$slug")({
  component: RecapPage,
  loader: ({ params }) => {
    const recap = LOUDOUN_RECAP_BY_SLUG[params.slug];
    if (!recap) throw notFound();
    return { recap };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: `Recap: Loudoun ${loaderData.recap.title}, ${loaderData.recap.dateLabel} · A Guy on X`,
          },
        ]
      : [],
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
  const meeting = LOUDOUN_MEETING_BY_ID[recap.meetingId];
  const transcript = ftmTranscriptFor(recap.meetingId);
  const jump = (sec: number) => (meeting ? loudounMeetingJumpUrl(meeting, sec) : "#");

  return (
    <SiteShell>
      <HomeSearch />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          <Link to="/counties" className="hover:text-foreground hover:underline">
            VA Counties
          </Link>
          <span className="mx-2 text-border">/</span>
          <Link to="/counties/loudoun" className="hover:text-foreground hover:underline">
            Loudoun
          </Link>
          <span className="mx-2 text-border">/</span>
          Meeting recap
        </p>
        <Kicker className="mt-4">Loudoun County · Board of Supervisors</Kicker>
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
                Board:{" "}
                {LOUDOUN_BOS.map((m) => `${m.name.split(" ").slice(-1)[0]} (${m.party})`).join(
                  ", ",
                )}
                . Member-by-member votes will be listed here from the county record.
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
                Times are approximate and open the county’s meeting video (eScribe / ISI) at that
                point.
                {transcript ? (
                  <>
                    {" "}
                    Search every spoken word in{" "}
                    <Link
                      to="/counties/loudoun"
                      className="text-[#1E4B8E] underline-offset-2 hover:underline"
                    >
                      Find the Moment
                    </Link>
                    . {FTM_TRANSCRIPT_LABEL}
                  </>
                ) : null}
              </p>
            </section>
          </div>

          {/* Right: agenda */}
          <section className="rounded-md border border-border bg-card px-4 py-5 sm:px-5">
            <Kicker>On the agenda</Kicker>
            <p className="mt-1 text-xs text-muted-foreground">
              Items as listed by the county, with staff reports. Not results.
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

function Missing() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-medium">No recap for that meeting yet</h1>
        <p className="mt-4">
          <Link
            to="/counties/loudoun"
            className="text-[#1E4B8E] underline-offset-2 hover:underline"
          >
            Back to Loudoun County
          </Link>
        </p>
      </main>
    </SiteShell>
  );
}
