import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { SiteShell } from "@/components/site/shell";
import { DashboardTemplate } from "@/components/site/dashboard-template";
import type { Dashboard } from "@/lib/dashboards";
import { MOCKUPS } from "@/lib/mockups/mockups-data";

const TITLES: Record<string, string> = {
  "ga-dashboard": "General Assembly dashboard", "house-members": "House members", "senate-members": "Senate members",
  helmer: "Del. Dan Helmer", "loudoun-bos-randall": "Loudoun BOS member", "loudoun-sb-chandler": "Loudoun School Board member",
};
const LIS_NOTE = new Set(["ga-dashboard", "house-members", "senate-members", "helmer"]);

export const Route = createFileRoute("/mockups/$slug")({
  loader: ({ params }) => { if (!MOCKUPS[params.slug]) throw notFound(); return null; },
  head: ({ params }) => ({ meta: [{ title: `Mockup: ${TITLES[params.slug] ?? params.slug} · A Guy on X` }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

const col = (name: string, ch: "house" | "senate", foia: { label: string; href: string }) => ({
  name,
  tiles: [
    { label: "Find the Moment", icon: "play" as const, to: `/dashboards/${ch}/find-the-moment` },
    { label: "Meeting Recaps", icon: "list" as const, to: `/dashboards/${ch}/recaps` },
    { label: "Members", icon: "people" as const, to: `/mockups/${ch}-members` },
    { label: "Bills", icon: "book" as const, to: null },
    { label: "Scorecards", icon: "money" as const, to: null },
  ],
  foia,
});
const GA_MOCK: Dashboard = {
  slug: "general-assembly", short: "Dashboard mockup", title: "Virginia General Assembly", group: "state",
  columns: [
    col("Virginia House of Delegates", "house", { label: "FOIA to House of Delegates", href: "https://vga.virginia.gov/help/foia/" }),
    col("Senate of Virginia", "senate", { label: "FOIA to Senate", href: "https://apps.senate.virginia.gov/Senator/PDFs/SenateFOIARequest.pdf" }),
  ],
};

function Page() {
  const { slug } = Route.useParams();
  const m = MOCKUPS[slug];
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!m?.script || !ref.current) return;
    // run the mockup's own filter script once its markup is mounted
    try { new Function(m.script)(); } catch { /* mockup script is best-effort */ }
  }, [m]);
  if (slug === "ga-dashboard") return <SiteShell><DashboardTemplate d={GA_MOCK} plain /></SiteShell>;
  return (
    <SiteShell>
      <main className="agx-dark flex-1 bg-navy-800 text-white">
        <div role="status" className="bg-gold text-navy-900">
          <p className="mx-auto max-w-7xl px-4 py-2.5 text-center text-sm font-semibold sm:px-8">
            <span className="font-serif tracking-[0.14em] uppercase">Preview mockup</span> · {slug === "ga-dashboard" ? "EXAMPLE DATA is not real; real data will come from the LIS API." : "Figures marked EXAMPLE DATA are not real."}
            {slug === "ga-dashboard" ? "" : `${LIS_NOTE.has(slug) ? " Real scorecard and vote data will come from the LIS API." : ""} FOIA links are placeholders.`}
          </p>
        </div>
        <div ref={ref} dangerouslySetInnerHTML={{ __html: m.html }} />
      </main>
    </SiteShell>
  );
}
