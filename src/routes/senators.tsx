import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { LegacyHero, LegacyV4 } from "@/components/site/legacy-v4";
import { SENATOR_FILES } from "@/content/senators";

export const Route = createFileRoute("/senators")({ component: SenatorsPage });

function SenatorsPage() {
  return (
    <SiteShell>
      <LegacyV4>
        <HomeSearch />
        <LegacyHero
          kicker={
            <>
              <p>Virginia</p>
              <p className="mt-2 font-mono text-xs tracking-widest">Senate of Virginia</p>
            </>
          }
          title="VA Senators"
        >
          <p className="text-lg">
            Democrat members with a tax or energy paper on the desk. A link is live only when the file
            exists.
          </p>
        </LegacyHero>
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8 sm:py-12">
          <ul className="grid gap-4 sm:grid-cols-2">
            {SENATOR_FILES.map((s) => (
              <li
                key={s.slug}
                className="flex items-center gap-4 rounded-xl border border-navy-line border-l-4 border-l-gold bg-navy-700 px-4 py-4 sm:px-5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold">
                  <User className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-sans text-base font-semibold text-white">
                    {s.name}
                    <span className="inline-flex size-5 items-center justify-center rounded-sm bg-[#1E4B8E] text-[11px] font-bold text-white ring-1 ring-white/30">
                      D
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm text-on-dark-muted">
                    Senator · {s.district}
                  </p>
                </div>
                <p className="shrink-0 font-sans text-xs font-semibold tracking-[0.14em] uppercase">
                  {s.tax ? (
                    <a href={s.tax} className="text-gold hover:text-gold-hover hover:underline" target="_blank" rel="noreferrer">
                      Taxes
                    </a>
                  ) : null}
                  {s.tax && s.energy ? <span className="px-1.5 text-on-dark-muted">|</span> : null}
                  {s.energy ? (
                    <a href={s.energy} className="text-gold hover:text-gold-hover hover:underline" target="_blank" rel="noreferrer">
                      Energy
                    </a>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </LegacyV4>
    </SiteShell>
  );
}
