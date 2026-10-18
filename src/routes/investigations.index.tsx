import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { V4Main } from "@/components/site/lcps-v4";
import { STORY_TILE, StoryHero, StoryMeta } from "@/components/story/story-page";
import { INVESTIGATIONS } from "@/content/investigations";

export const Route = createFileRoute("/investigations/")({ component: InvestigationsIndex });

function InvestigationsIndex() {
  return (
    <SiteShell>
      <V4Main>
        <HomeSearch />
        <StoryHero kicker="The file" title="Investigations">
          Long-form research with citations, source documents, and the public trail. Method first.
        </StoryHero>
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 sm:py-12">
          {INVESTIGATIONS.length === 0 ? (
            <p className="text-on-dark-muted">Nothing on this shelf yet.</p>
          ) : (
            <ul className="grid gap-4">
              {INVESTIGATIONS.map((a) => (
                <li key={a.slug}>
                  <Link to="/investigations/$slug" params={{ slug: a.slug }} className={STORY_TILE}>
                    <ArrowRight className="absolute top-4 right-4 size-5 text-gold transition-transform group-hover:translate-x-0.5" aria-hidden />
                    {/* Investigation covers are light chart/document graphics: keep them on a light card. */}
                    <div className="rounded-md bg-white p-1.5 sm:col-span-4">
                      <img src={a.image} alt={a.imageAlt} className="w-full" />
                    </div>
                    <div className="min-w-0 sm:col-span-8">
                      <StoryMeta kicker={a.kicker} date={a.displayDate} />
                      <h2 className="mt-3 font-serif text-2xl font-bold leading-tight sm:text-[1.7rem]">{a.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-on-dark-muted sm:text-base">{a.dek}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </V4Main>
    </SiteShell>
  );
}
