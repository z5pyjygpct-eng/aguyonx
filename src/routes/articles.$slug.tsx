import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { Button } from "@/components/ui/button";
import { StoryPage } from "@/components/story/story-page";
import { articleBySlug } from "@/content/articles";

export const Route = createFileRoute("/articles/$slug")({
  component: ArticlePage,
  loader: ({ params }) => {
    const story = articleBySlug(params.slug);
    if (!story) throw notFound();
    return { story };
  },
  notFoundComponent: Missing,
});

function ArticlePage() {
  const { story } = Route.useLoaderData();
  return <StoryPage story={story} />;
}

function Missing() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-medium">Not in the folder</h1>
        <Button asChild className="mt-8">
          <Link to="/articles">Back to articles</Link>
        </Button>
      </main>
    </SiteShell>
  );
}
