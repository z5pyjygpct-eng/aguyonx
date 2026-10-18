import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
import { Button } from "@/components/ui/button";
import { Citations, SourceDocs, StoryBody } from "@/components/story/body";
import { SaveButton } from "@/components/story/save-button";
import type { Story } from "@/content/types";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

/** v4 list tile for article / investigation indexes. */
export const STORY_TILE =
  "group relative grid gap-5 rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-4 pr-12 text-white transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:grid-cols-12 sm:items-center sm:gap-6 sm:p-5 sm:pr-14";

/** Navy v4 hero with flag bar, used by the story indexes. */
export function StoryHero({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
      <div className="mx-auto max-w-6xl px-5 pt-6 pb-10 sm:px-8">
        <Breadcrumbs items={[{ label: title }]} className="mb-6" />
        <p className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase sm:text-base">{kicker}</p>
        <h1 className="mt-2 font-serif text-5xl font-bold uppercase leading-[1.05] sm:text-6xl">{title}</h1>
        {children ? <p className="mt-3 max-w-2xl text-base text-[#F6F3EA] sm:text-lg">{children}</p> : null}
      </div>
    </section>
  );
}

/** Kicker badge + date (+ optional read time) in v4 colors. */
export function StoryMeta({ kicker, date, extra }: { kicker: string; date: string; extra?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center rounded-sm bg-gold px-2 py-0.5 font-mono text-xs font-bold tracking-[0.14em] text-navy-900 uppercase">
        {kicker}
      </span>
      <span className="font-mono text-xs text-on-dark-muted">{date}</span>
      {extra}
    </div>
  );
}

/** "Not in the folder" page for both story routes. */
export function StoryMissing({ to, label }: { to: "/articles" | "/investigations"; label: string }) {
  return (
    <SiteShell>
      <V4Main>
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-xl px-4 py-24 text-center">
            <Breadcrumbs items={[{ label: to === "/investigations" ? "Investigations" : "Articles", to }, { label: "Not in the folder" }]} className="mb-8 [&_ol]:justify-center" />
            <h1 className="font-serif text-4xl font-bold uppercase">Not in the folder</h1>
            <Button asChild className="mt-8">
              <Link to={to}>{label}</Link>
            </Button>
          </div>
        </section>
      </V4Main>
    </SiteShell>
  );
}

export function StoryPage({ story }: { story: Story }) {
  const xCite = story.citations.find((c) => c.href?.includes("x.com/"));
  const pdf = story.documents.find((d) => d.kind === "pdf");
  const placeholderDek = story.dek === "Published as an X Article.";
  const showBody = story.body.some(
    (b) => b.type === "p" && b.text !== "Published as an X Article." && b.text !== "The full piece is on X.",
  ) || story.body.some((b) => b.type !== "p");

  return (
    <SiteShell>
      <V4Main>
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto w-full max-w-3xl px-5 pt-6 pb-10 sm:px-8">
            <Breadcrumbs
              items={[
                story.kind === "investigation" ? { label: "Investigations", to: "/investigations" } : { label: "Articles", to: "/articles" },
                { label: story.title },
              ]}
              className="mb-4"
            />
            <Link
              to={story.kind === "investigation" ? "/investigations" : "/articles"}
              className="-ml-1 inline-flex min-h-10 items-center gap-2 rounded px-1 text-sm font-semibold text-gold hover:text-gold-hover"
            >
              <ArrowLeft className="size-4" />
              {story.kind === "investigation" ? "All investigations" : "All articles"}
            </Link>
            <div className="mt-6">
              <StoryMeta
                kicker={story.kicker}
                date={story.displayDate}
                extra={
                  story.kicker !== "X Article" && !pdf ? (
                    <span className="font-mono text-xs text-on-dark-muted">{story.readMinutes} min</span>
                  ) : null
                }
              />
            </div>
            <h1 className="mt-4 font-serif text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl">
              {story.title}
            </h1>
            {!placeholderDek ? <p className="mt-4 text-lg leading-relaxed text-[#F6F3EA]">{story.dek}</p> : null}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <SaveButton refId={{ kind: story.kind, slug: story.slug }} />
              {pdf ? (
                <Button asChild>
                  <a href={pdf.href} target="_blank" rel="noreferrer">
                    Open the file
                  </a>
                </Button>
              ) : null}
              {xCite?.href ? (
                <Button asChild>
                  <a href={xCite.href} target="_blank" rel="noreferrer">
                    Read on X
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </section>
        <div className="mx-auto w-full max-w-3xl px-5 pt-8 pb-14 sm:px-8 sm:pt-10">
          {pdf ? (
            // Document/chart graphics are drawn for a light page: show them on a light card.
            <div className="rounded-lg bg-white p-2 shadow-lg ring-1 ring-navy-line sm:p-3">
              <img src={story.image} alt={story.imageAlt} className="w-full" />
            </div>
          ) : (
            <img
              src={story.image}
              alt={story.imageAlt}
              className="aspect-video w-full rounded-lg object-cover ring-1 ring-navy-line"
            />
          )}
          {showBody ? (
            <article className="mt-10 max-w-[68ch]">
              <StoryBody blocks={story.body} citations={story.citations} />
            </article>
          ) : null}
          <SourceDocs items={story.documents} />
          <Citations items={story.citations} />
        </div>
      </V4Main>
    </SiteShell>
  );
}
