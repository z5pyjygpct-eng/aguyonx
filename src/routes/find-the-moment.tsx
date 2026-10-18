import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { V4Main } from "@/components/site/lcps-v4";
import { ftmHubEntries } from "@/content/ftm-hub";

export const Route = createFileRoute("/find-the-moment")({
  head: () => ({
    meta: [
      { title: "Find the Moment — A Guy on X" },
      { name: "description", content: "Search what was said in Virginia public meetings. Jump to the video." },
    ],
  }),
  component: FindTheMomentHub,
});

function FindTheMomentHub() {
  const entries = ftmHubEntries();
  const groups = [...new Set(entries.map((e) => e.group))];
  return (
    <SiteShell>
      <V4Main>
        <HomeSearch />
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-8 pb-10 sm:px-8">
            <p className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase sm:text-base">Virginia · Public meetings</p>
            <h1 className="mt-2 font-serif text-5xl font-bold uppercase leading-[1.05] sm:text-6xl">
              Find the <span className="text-gold">Moment</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base text-[#F6F3EA] sm:text-lg">
              Search what was said. Jump to the video. Pick a board below.
            </p>
          </div>
        </section>
        <div className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-8">
          {groups.map((g) => (
            <section key={g} className="mt-10">
              <h2 className="font-serif text-2xl font-semibold tracking-wide text-gold uppercase sm:text-3xl">{g}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {entries
                  .filter((e) => e.group === g)
                  .map((e) => (
                    <a
                      key={e.key}
                      href={e.href}
                      className="group relative flex flex-col rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 pr-12 text-white transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:p-6 sm:pr-14"
                    >
                      <ArrowRight className="absolute top-4 right-4 size-5 text-gold transition-transform group-hover:translate-x-0.5" aria-hidden />
                      <span
                        className={`inline-flex w-fit items-center rounded px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-widest uppercase ${e.status === "live" ? "bg-gold text-navy-900" : "border border-gold/60 text-gold"}`}
                      >
                        {e.status === "live" ? "Live" : "Transcripts in progress"}
                      </span>
                      <span className="mt-2 font-serif text-2xl font-bold uppercase leading-tight">
                        {e.name}
                      </span>
                      <span className="mt-2 text-sm text-on-dark-muted">{e.description}</span>
                      <span className="mt-3 font-mono text-xs text-on-dark-muted">
                        {e.meetingCount} meetings
                        {e.transcriptCount !== undefined ? ` · ${e.transcriptCount} transcribed` : ""}
                        {e.range ? ` · ${e.range}` : ""}
                      </span>
                      <span className="mt-auto pt-4 font-serif text-sm font-semibold tracking-[0.14em] text-gold uppercase">
                        {e.status === "live" ? "Search →" : "View →"}
                      </span>
                    </a>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </V4Main>
    </SiteShell>
  );
}
