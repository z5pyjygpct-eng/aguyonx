import { createFileRoute, notFound } from "@tanstack/react-router";
import { StoryMissing, StoryPage } from "@/components/story/story-page";
import { investigationBySlug } from "@/content/investigations";

export const Route = createFileRoute("/investigations/$slug")({
  component: InvestigationPage,
  loader: ({ params }) => {
    const story = investigationBySlug(params.slug);
    if (!story) throw notFound();
    return { story };
  },
  notFoundComponent: Missing,
});

function InvestigationPage() {
  const { story } = Route.useLoaderData();
  return <StoryPage story={story} />;
}

function Missing() {
  return <StoryMissing to="/investigations" label="Back to investigations" />;
}
