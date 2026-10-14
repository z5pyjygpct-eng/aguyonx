import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, User } from "lucide-react";
import { dateMeta, useMeetingFilters } from "@/components/site/meeting-filters";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { LoudounMeetingSearch } from "@/components/site/loudoun-meeting-search";
import { LoudounStats } from "@/components/site/loudoun-stats";
import {
  LOUDOUN_BOS,
  LOUDOUN_MEETINGS,
  LOUDOUN_OFFICIAL_DOORS,
  loudounMeetingType,
} from "@/content/loudoun";
import { LOUDOUN_RECAPS } from "@/content/loudoun-recaps";

const BOS_RECAPS = LOUDOUN_RECAPS.filter((r) => (r.venue ?? "loudoun-bos") === "loudoun-bos");
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/counties/loudoun/")({
  component: LoudounCountyPage,
});

function partyBadge(party: "D" | "R") {
  return (
    <span
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-sm text-[11px] font-bold text-white",
        party === "D" ? "bg-[#1E4B8E]" : "bg-[#B31942]",
      )}
    >
      {party}
    </span>
  );
}

function LoudounCountyPage() {
  return (
    <SiteShell>
      <HomeSearch />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          <Link to="/counties" className="hover:text-foreground hover:underline">
            VA Counties
          </Link>
          <span className="mx-2 text-border">/</span>
          Loudoun
        </p>
        <Kicker className="mt-4">Virginia · Northern Virginia</Kicker>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Loudoun County
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          <span className="font-medium text-foreground">Find the Moment</span> — search{" "}
          {LOUDOUN_MEETINGS.length} Board of Supervisors meetings (Granicus + eScribe), skim the BOS roster,
          and open the official record. School Board lives on the{" "}
          <Link
            to="/counties/loudoun/schools"
            className="text-[#1E4B8E] underline-offset-2 hover:underline"
          >
            Loudoun Schools
          </Link>{" "}
          door.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
        <div>
          <LoudounMeetingSearch />
          <p className="mt-4 text-sm text-muted-foreground">
            <Link
              to="/counties/loudoun/find-the-moment"
              className="text-[#1E4B8E] underline-offset-2 hover:underline"
            >
              Also search Schools in the same box →
            </Link>
          </p>
        </div>
        <LoudounStats />
        </div>

        {BOS_RECAPS.length > 0 ? <RecapList /> : null}

        <section className="mt-14">
          <Kicker>Board of Supervisors</Kicker>
          <h2 className="mt-2 font-serif text-3xl font-medium">Thin roster</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Name, party, district, role. No bios, no finance, no person pages.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {LOUDOUN_BOS.map((m) => (
              <li
                key={m.name}
                className="flex items-center gap-4 rounded-md border border-border bg-card px-4 py-4 sm:px-5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#1E4B8E]/30 text-[#1E4B8E]">
                  <User className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-sans text-base font-semibold">
                    {m.name}
                    {partyBadge(m.party)}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {m.role} · {m.district}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <Kicker>Official doors</Kicker>
          <h2 className="mt-2 font-serif text-3xl font-medium">Meeting videos</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Indexed Granicus and eScribe meetings plus county links. Listen on their player.
          </p>
          <MeetingDoors />
        </section>
      </main>
    </SiteShell>
  );
}

type Door = (typeof LOUDOUN_OFFICIAL_DOORS)[number];
const meta = (d: Door) => {
  const date = "date" in d ? d.date : undefined;
  return dateMeta(date, "type" in d ? d.type : undefined);
};
function MeetingDoors() {
  const meetings = LOUDOUN_OFFICIAL_DOORS.filter((d) => "date" in d);
  const links = LOUDOUN_OFFICIAL_DOORS.filter((d) => !("date" in d));
  const { filtered, controls } = useMeetingFilters(meetings, meta, "meetings");
  const shown = [...filtered, ...links];
  return (
    <>
      {controls}
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {shown.map((door) => (
              <li key={door.href}>
                <a
                  href={door.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col rounded-md border border-border bg-card px-5 py-5 transition-[background-color] duration-150 hover:bg-wash"
                >
                  {"thumb" in door && door.thumb ? (
                    <img
                      src={door.thumb}
                      alt=""
                      loading="lazy"
                      width={640}
                      height={360}
                      className="-mx-5 -mt-5 mb-4 aspect-video w-[calc(100%+2.5rem)] max-w-none rounded-t-md object-cover"
                    />
                  ) : null}
                  <span className="inline-flex items-center gap-2 font-serif text-xl font-medium">
                    {door.label}
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </span>
                  <span className="mt-2 text-sm text-muted-foreground">{door.dek}</span>
                </a>
              </li>
            ))}
          </ul>
    </>
  );
}

const recapMeta = (r: (typeof BOS_RECAPS)[number]) => dateMeta(r.dateLabel, loudounMeetingType(r.title));
function RecapList() {
  const { filtered, controls } = useMeetingFilters(BOS_RECAPS, recapMeta, "recaps");
  return (
          <section className="mt-10">
            <h2 className="mt-2 font-serif text-3xl font-medium">Meeting recaps</h2>
            {controls}
            <ul className="mt-4 space-y-2">
              {filtered.map((r) => (
                <li key={r.slug}>
                  <Link
                    to="/counties/loudoun/recaps/$slug"
                    params={{ slug: r.slug }}
                    className="font-serif text-lg text-[#1E4B8E] underline-offset-2 hover:underline"
                  >
                    {r.dateLabel} · {r.title}
                  </Link>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {(r.venue ?? "loudoun-bos") === "loudoun-lcps" ? "School Board · " : "BOS · "}
                    {r.official.votesPosted ? "Official votes posted" : "Official votes not yet posted"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
  );
}
