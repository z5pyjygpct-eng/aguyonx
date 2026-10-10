import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { SenateMeetingSearch } from "@/components/site/senate-meeting-search";
import { FTM_TRANSCRIPTS } from "@/content/ftm-transcripts";
import {
  LIS_SENATE_MINUTES,
  SENATE_MEETINGS,
  SENATE_RECAP_BY_MEETING,
  SENATE_RECAPS,
  SENATE_VENUE,
  SENATE_YOUTUBE,
  SENATORS,
  lisMemberUrl,
  senateProfileUrl,
  senateVideoUrl,
} from "@/content/va-senate";

export const Route = createFileRoute("/general-assembly/senate/")({
  component: SenatePage,
  head: () => ({
    meta: [{ title: "Senate of Virginia floor sessions · Find the Moment · A Guy on X" }],
  }),
});

const PARTY_BG: Record<string, string> = { D: "bg-[#1E4B8E]", R: "bg-[#b42318]" };

function SenatePage() {
  const has = new Set(
    FTM_TRANSCRIPTS.filter((t) => t.venue === SENATE_VENUE).map((t) => t.meetingId),
  );
  return (
    <SiteShell>
      <HomeSearch />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          <Link to="/general-assembly" className="hover:text-foreground hover:underline">
            General Assembly
          </Link>
          <span className="mx-2 text-border">/</span>Senate
        </p>
        <Kicker className="mt-4">Virginia · General Assembly</Kicker>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Senate of Virginia floor sessions
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Find the Moment: search what was said in {SENATE_MEETINGS.length} 2026 Senate floor
          sessions and jump straight to the official Senate video.
        </p>

        <section className="mt-10">
          <h2 className="font-serif text-2xl font-medium">Find the Moment</h2>
          <div className="mt-4">
            <SenateMeetingSearch />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl font-medium">Senators</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The 40 current members. Names link to each senator’s page in the Legislative Information
            System (LIS); party and district from the Senate’s own member directory.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SENATORS.map((s) => (
              <li
                key={s.lisId}
                className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5"
              >
                <span
                  className={`inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-[11px] font-bold text-white ${PARTY_BG[s.party] ?? "bg-muted-foreground"}`}
                  aria-label={
                    s.party === "D" ? "Democrat" : s.party === "R" ? "Republican" : s.party
                  }
                >
                  {s.party}
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={lisMemberUrl(s)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-foreground underline-offset-2 hover:text-[#1E4B8E] hover:underline"
                  >
                    {s.name}
                  </a>
                  <p className="text-xs text-muted-foreground">
                    District {s.district} ·{" "}
                    <a
                      href={senateProfileUrl(s)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Senate profile
                    </a>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl font-medium">Meeting recaps</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            One recap per floor day. Votes come only from official LIS roll-call records, never from
            the video or transcript.
          </p>
          <ul className="mt-4 space-y-2">
            {SENATE_RECAPS.map((r) => (
              <li key={r.slug}>
                <Link
                  to="/general-assembly/senate/recaps/$slug"
                  params={{ slug: r.slug }}
                  className="text-[#1E4B8E] underline-offset-2 hover:underline"
                >
                  Senate Floor Session, {r.dateLabel}
                </Link>
                <span className="ml-2 text-xs text-muted-foreground">
                  {r.rollCallCount
                    ? `${r.rollCallCount} roll calls · ${r.billCount} bills`
                    : "no LIS roll calls recorded"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl font-medium">Floor sessions (2026)</h2>
          <ul className="mt-4 divide-y divide-border rounded-md border border-border bg-card">
            {SENATE_MEETINGS.map((m) => {
              const recap = SENATE_RECAP_BY_MEETING[m.id];
              return (
                <li
                  key={m.id}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2.5 text-sm"
                >
                  <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
                    {m.dateLabel}
                  </span>
                  <a
                    href={senateVideoUrl(m)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline-offset-2 hover:text-[#1E4B8E] hover:underline"
                  >
                    {m.title}
                  </a>
                  <span className="text-xs text-muted-foreground">{m.duration}</span>
                  {recap ? (
                    <Link
                      to="/general-assembly/senate/recaps/$slug"
                      params={{ slug: recap.slug }}
                      className="text-xs text-[#1E4B8E] hover:underline"
                    >
                      Recap
                    </Link>
                  ) : null}
                  <span className="ml-auto font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                    {has.has(m.id) ? "Transcribed" : "Queued"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-12">
          <Kicker>Official doors</Kicker>
          <ul className="mt-3 space-y-1.5 text-sm">
            {[
              {
                label: "Senate of Virginia video (official YouTube streams)",
                href: SENATE_YOUTUBE,
              },
              { label: "Senate floor minutes (LIS)", href: LIS_SENATE_MINUTES },
              {
                label: "Senate video archive, 2017–2025 (Granicus)",
                href: "https://virginia-senate.granicus.com/ViewPublisher.php?view_id=3",
              },
            ].map((d) => (
              <li key={d.href}>
                <a
                  href={d.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#1E4B8E] underline-offset-2 hover:underline"
                >
                  {d.label}
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </SiteShell>
  );
}
