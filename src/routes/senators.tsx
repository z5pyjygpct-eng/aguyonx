import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { Kicker } from "@/components/site/kicker";
import { SENATOR_FILES } from "@/content/senators";

export const Route = createFileRoute("/senators")({ component: SenatorsPage });

function SenatorsPage() {
  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <Kicker>Virginia</Kicker>
        <p className="mt-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
          Senate of Virginia
        </p>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          VA Senators
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Democrat members with a tax or energy paper on the desk. A link is live only when the file
          exists.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {SENATOR_FILES.map((s) => (
            <li
              key={s.slug}
              className="flex items-center gap-4 rounded-md border border-border bg-card px-4 py-4 sm:px-5"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#1E4B8E]/30 text-[#1E4B8E]">
                <User className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-sans text-base font-semibold">
                  {s.name}
                  <span className="inline-flex size-5 items-center justify-center rounded-sm bg-[#1E4B8E] text-[11px] font-bold text-white">
                    D
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Senator · {s.district}
                </p>
              </div>
              <p className="shrink-0 font-sans text-xs font-semibold tracking-[0.14em] text-foreground uppercase">
                {s.tax ? (
                  <a href={s.tax} className="hover:underline" target="_blank" rel="noreferrer">
                    Taxes
                  </a>
                ) : null}
                {s.tax && s.energy ? <span className="px-1.5 text-muted-foreground">|</span> : null}
                {s.energy ? (
                  <a href={s.energy} className="hover:underline" target="_blank" rel="noreferrer">
                    Energy
                  </a>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      </main>
    </SiteShell>
  );
}
