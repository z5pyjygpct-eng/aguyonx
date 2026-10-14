import { isoMeta, useMeetingFilters } from "@/components/site/meeting-filters";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FtmThumb } from "@/components/site/ftm-thumb";
import { ExternalLink } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { HouseMeetingSearch } from "@/components/site/house-meeting-search";
import { VenueStats } from "@/components/site/loudoun-stats";
import { FTM_TRANSCRIPTS } from "@/content/ftm-transcripts";
import {
  LIS_HOUSE_MINUTES,
  HOUSE_MEETINGS,
  HOUSE_RECAP_BY_MEETING,
  HOUSE_RECAPS,
  HOUSE_VENUE,
  HOUSE_YOUTUBE,
  DELEGATES,
  lisMemberUrl,
  houseProfileUrl,
  houseVideoUrl,
} from "@/content/va-house";

export const Route = createFileRoute("/general-assembly/house/")({
  component: HousePage,
  head: () => ({
    meta: [{ title: "Virginia House of Delegates floor sessions · Find the Moment · A Guy on X" }],
  }),
});

const PARTY_BG: Record<string, string> = { D: "bg-[#1E4B8E]", R: "bg-[#b42318]" };

const floorType = (t: string) =>
  /joint/i.test(t) ? "Joint Assembly" : /special/i.test(t) ? "Special Session" : /reconven/i.test(t) ? "Reconvened Session" : /pro forma/i.test(t) ? "Pro forma" : "Regular Session";

function HousePage() {
  const recapF = useMeetingFilters(HOUSE_RECAPS, (r) => isoMeta(r.date, undefined), "recaps");
  const videoF = useMeetingFilters(HOUSE_MEETINGS, (m) => isoMeta(m.date, floorType(m.title)), "meetings");
  const has = new Set(
    FTM_TRANSCRIPTS.filter((t) => t.venue === HOUSE_VENUE).map((t) => t.meetingId),
  );
  return (
    <SiteShell>
      <HomeSearch />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          <Link to="/general-assembly" className="hover:text-foreground hover:underline">
            General Assembly
          </Link>
          <span className="mx-2 text-border">/</span>House
        </p>
        <Kicker className="mt-4">Virginia · General Assembly</Kicker>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Virginia House of Delegates floor sessions
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Find the Moment: search what was said in {HOUSE_MEETINGS.length} 2026 House floor
          sessions and jump straight to the official House video.
        </p>

        <section className="mt-10">
          <h2 className="font-serif text-2xl font-medium">Find the Moment</h2>
          <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
            <div>
              <HouseMeetingSearch />
            </div>
            <VenueStats
              heading="By the numbers · Virginia House"
              meetings={HOUSE_MEETINGS}
              recapCount={HOUSE_RECAPS.length}
              recapSub="votes from official LIS roll calls"
              note={FTM_TRANSCRIPTS.some((t) => t.venue === HOUSE_VENUE) ? undefined : "No House machine transcripts have posted yet; floor sessions are queued. Searchable, transcript, and hour counts fill in as they post."}
            />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl font-medium">Delegates</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The {DELEGATES.length} current members. Names link to each delegate’s page in the Legislative Information
            System (LIS); party and district from the House’s own member directory.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {DELEGATES.map((s) => (
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
                      href={houseProfileUrl(s)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      House member page
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
          {recapF.controls}
          <ul className="mt-4 space-y-2">
            {recapF.filtered.map((r) => (
              <li key={r.slug}>
                <Link
                  to="/general-assembly/house/recaps/$slug"
                  params={{ slug: r.slug }}
                  className="text-[#1E4B8E] underline-offset-2 hover:underline"
                >
                  House Floor Session, {r.dateLabel}
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
          <h2 className="font-serif text-2xl font-medium">Meeting videos</h2>
          <p className="mt-1 text-sm text-muted-foreground">2026 floor sessions.</p>
          {videoF.controls}
          <ul className="mt-4 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {videoF.filtered.map((m) => {
              const recap = HOUSE_RECAP_BY_MEETING[m.id];
              return (
                <li
                  key={m.id}
                  className="flex h-full flex-col gap-1.5 rounded-md border border-border bg-card px-4 py-4 text-sm"
                >
                  <FtmThumb top venue="va-house-floor" meetingId={m.id} href={houseVideoUrl(m)} />
                  <span className="font-mono text-xs text-muted-foreground">
                    {m.dateLabel}
                  </span>
                  <a
                    href={houseVideoUrl(m)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-serif text-lg font-medium leading-snug text-foreground underline-offset-2 hover:text-[#1E4B8E] hover:underline"
                  >
                    {m.title}
                  </a>
                  <span className="text-xs text-muted-foreground">{m.duration}</span>
                  {recap ? (
                    <Link
                      to="/general-assembly/house/recaps/$slug"
                      params={{ slug: recap.slug }}
                      className="text-xs text-[#1E4B8E] hover:underline"
                    >
                      Recap
                    </Link>
                  ) : null}
                  <span className="mt-auto pt-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
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
                label: "House of Delegates video archive (official)",
                href: HOUSE_YOUTUBE,
              },
              { label: "House floor minutes (LIS)", href: LIS_HOUSE_MINUTES },
              {
                label: "House video archive, 2017–2025 (Granicus)",
                href: "https://virginia-house.granicus.com/ViewPublisher.php?view_id=3",
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
