import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
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
      <HomeSearch />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <Kicker>Virginia · Public meetings</Kicker>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Find the Moment
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Search what was said. Jump to the video. Pick a board below.
        </p>
        {groups.map((g) => (
          <section key={g} className="mt-10">
            <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{g}</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {entries
                .filter((e) => e.group === g)
                .map((e) => (
                  <a
                    key={e.key}
                    href={e.href}
                    className="group flex flex-col rounded-md border border-border bg-card px-5 py-5 transition-colors hover:border-[#1E4B8E]"
                  >
                    <span
                      className={`font-mono text-[11px] tracking-widest uppercase ${e.status === "live" ? "text-[#0d7377]" : "text-amber-700"}`}
                    >
                      {e.status === "live" ? "Live" : "Transcripts in progress"}
                    </span>
                    <span className="mt-1 font-serif text-2xl font-medium tracking-tight group-hover:text-[#1E4B8E]">
                      {e.name}
                    </span>
                    <span className="mt-2 text-sm text-muted-foreground">{e.description}</span>
                    <span className="mt-3 font-mono text-xs text-muted-foreground">
                      {e.meetingCount} meetings
                      {e.transcriptCount !== undefined ? ` · ${e.transcriptCount} transcribed` : ""}
                      {e.range ? ` · ${e.range}` : ""}
                    </span>
                    <span className="mt-4 font-sans text-sm font-semibold tracking-[0.14em] text-[#1E4B8E] uppercase">
                      {e.status === "live" ? "Search →" : "View →"}
                    </span>
                  </a>
                ))}
            </div>
          </section>
        ))}
      </main>
    </SiteShell>
  );
}
