import { createFileRoute, notFound } from "@tanstack/react-router";
import { StoryMissing, StoryPage } from "@/components/story/story-page";
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
  return <StoryMissing to="/articles" label="Back to articles" />;
}
