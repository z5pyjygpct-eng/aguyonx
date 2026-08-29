import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Citations, SourceDocs, StoryBody } from "@/components/story/body";
import { SaveButton } from "@/components/story/save-button";
import type { Story } from "@/content/types";

export function StoryPage({ story }: { story: Story }) {
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
          <span className="font-mono text-xs text-muted-foreground">
            {story.readMinutes} min
          </span>
        </div>
        <h1 className="mt-4 font-serif text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
          {story.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{story.dek}</p>
        <div className="mt-6">
          <SaveButton refId={{ kind: story.kind, slug: story.slug }} />
        </div>
        <img
          src={story.image}
          alt={story.imageAlt}
          className="mt-10 aspect-video w-full object-cover outline outline-1 -outline-offset-1 outline-foreground/10"
        />
        <article className="mt-10">
          <StoryBody blocks={story.body} citations={story.citations} />
        </article>
        <SourceDocs items={story.documents} />
        <Citations items={story.citations} />
      </main>
    </SiteShell>
  );
}
