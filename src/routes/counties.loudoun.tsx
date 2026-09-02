import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, User } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { LoudounMeetingSearch } from "@/components/site/loudoun-meeting-search";
import {
  LOUDOUN_BOS,
  LOUDOUN_OFFICIAL_DOORS,
} from "@/content/loudoun";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/counties/loudoun")({
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
          Search one public hearing, skim the Board of Supervisors, and open the official
          record. No dossiers.
        </p>

        <div className="mt-10">
          <LoudounMeetingSearch />
        </div>

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
          <h2 className="mt-2 font-serif text-3xl font-medium">Out to the record</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            County and Granicus links only. Listen on their player.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LOUDOUN_OFFICIAL_DOORS.map((door) => (
              <li key={door.href}>
                <a
                  href={door.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col rounded-md border border-border bg-card px-5 py-5 transition-[background-color] duration-150 hover:bg-wash"
                >
                  <span className="inline-flex items-center gap-2 font-serif text-xl font-medium">
                    {door.label}
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </span>
                  <span className="mt-2 text-sm text-muted-foreground">{door.dek}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </SiteShell>
  );
}
