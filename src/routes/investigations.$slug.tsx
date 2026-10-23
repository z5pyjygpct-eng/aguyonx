import { createFileRoute, notFound } from "@tanstack/react-router";
import { StoryMissing, StoryPage } from "@/components/story/story-page";
import { investigationBySlug } from "@/content/investigations";

const PAGE_OG_IMAGES: Record<string, string> = {
  "lucas-indictment-senator-who-legalized-pot-2026":
    "https://aguyonx.com/og/lucas-indictment-senator-who-legalized-pot-2026.png",
};

export const Route = createFileRoute("/investigations/$slug")({
  component: InvestigationPage,
  head: ({ params }) => {
    const img = PAGE_OG_IMAGES[params.slug];
    if (!img) return {};
    return {
      meta: [
        { property: "og:image", content: img },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: img },
      ],
    };
  },
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
