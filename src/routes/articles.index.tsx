import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { V4Main } from "@/components/site/lcps-v4";
import { STORY_TILE, StoryHero, StoryMeta } from "@/components/story/story-page";
import { ARTICLES } from "@/content/articles";

export const Route = createFileRoute("/articles/")({ component: ArticlesIndex });

function ArticlesIndex() {
  return (
    <SiteShell>
      <V4Main>
        <HomeSearch />
        <StoryHero kicker="The desk" title="Articles">
          X Articles from @VaChangeAgent. These are pieces published on X — not invented desk copy.
        </StoryHero>
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 sm:py-12">
          <ul className="grid gap-4">
            {ARTICLES.map((a) => (
              <li key={a.slug}>
                <Link to="/articles/$slug" params={{ slug: a.slug }} className={STORY_TILE}>
                  <ArrowRight className="absolute top-4 right-4 size-5 text-gold transition-transform group-hover:translate-x-0.5" aria-hidden />
                  <img
                    src={a.image}
                    alt={a.imageAlt}
                    className="aspect-video w-full rounded-md object-cover ring-1 ring-navy-line sm:col-span-4"
                  />
                  <div className="min-w-0 sm:col-span-8">
                    <StoryMeta kicker={a.kicker} date={a.displayDate} />
                    <h2 className="mt-3 font-serif text-2xl font-bold leading-tight sm:text-[1.7rem]">{a.title}</h2>
                    {a.dek !== "Published as an X Article." ? (
                      <p className="mt-2 text-sm leading-relaxed text-on-dark-muted sm:text-base">{a.dek}</p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </V4Main>
    </SiteShell>
  );
}
