import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Citations, SourceDocs, StoryBody } from "@/components/story/body";
import { SaveButton } from "@/components/story/save-button";
import type { Story } from "@/content/types";

export function StoryPage({ story }: { story: Story }) {
  const xCite = story.citations.find((c) => c.href?.includes("x.com/"));
  const pdf = story.documents.find((d) => d.kind === "pdf");
  const placeholderDek = story.dek === "Published as an X Article.";
  const showBody = story.body.some(
    (b) => b.type === "p" && b.text !== "Published as an X Article." && b.text !== "The full piece is on X.",
  ) || story.body.some((b) => b.type !== "p");

  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-8">
          {story.kind === "investigation" ? (
            <Link to="/investigations">
              <ArrowLeft className="size-4" />
              All investigations
            </Link>
          ) : (
            <Link to="/articles">
              <ArrowLeft className="size-4" />
              All articles
            </Link>
          )}
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{story.kicker}</Badge>
          <span className="font-mono text-xs text-muted-foreground">{story.displayDate}</span>
          {story.kicker !== "X Article" && !pdf ? (
            <span className="font-mono text-xs text-muted-foreground">
              {story.readMinutes} min
            </span>
          ) : null}
        </div>
        <h1 className="mt-4 font-serif text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
          {story.title}
        </h1>
        {!placeholderDek ? <p className="mt-4 text-lg text-muted-foreground">{story.dek}</p> : null}
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
        <img
          src={story.image}
          alt={story.imageAlt}
          className={
            pdf
              ? "mt-10 w-full outline outline-1 -outline-offset-1 outline-foreground/10"
              : "mt-10 aspect-video w-full object-cover outline outline-1 -outline-offset-1 outline-foreground/10"
          }
        />
        {showBody ? (
          <article className="mt-10">
            <StoryBody blocks={story.body} citations={story.citations} />
          </article>
        ) : null}
        <SourceDocs items={story.documents} />
        <Citations items={story.citations} />
      </main>
    </SiteShell>
  );
}
