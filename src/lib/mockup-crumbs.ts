/** Breadcrumb trails for the static mockup HTML pages, rendered with the shared component markup. Not used by the locked /mockups/ga-dashboard. */
import { breadcrumbsHtml, type Crumb } from "@/components/site/breadcrumbs";

const GA: Crumb = { label: "General Assembly", to: "/dashboards/general-assembly" };
const HOUSE: Crumb = { label: "House of Delegates", to: "/dashboards/house" };
const LOUDOUN: Crumb = { label: "Loudoun County", to: "/dashboards/loudoun" };

const TRAILS: Record<string, Crumb[]> = {
  "house-members": [GA, HOUSE, { label: "Members" }],
  "senate-members": [GA, { label: "Senate", to: "/dashboards/senate" }, { label: "Members" }],
  helmer: [GA, HOUSE, { label: "Members", to: "/dashboards/house/members" }, { label: "Dan Helmer" }],
  "loudoun-bos-randall": [LOUDOUN, { label: "Board of Supervisors", to: "/dashboards/loudoun", hash: "loudoun-county-board-of-supervisors" }, { label: "Members", to: "/dashboards/loudoun/bos/members" }, { label: "Phyllis J. Randall" }],
  "loudoun-sb-chandler": [LOUDOUN, { label: "School Board", to: "/dashboards/loudoun", hash: "loudoun-county-public-schools" }, { label: "Members", to: "/dashboards/loudoun/schools/members" }, { label: "April Chandler" }],
};

/** Swap the mockup's hand-written breadcrumb <nav> for the shared one (same levels, every level a real link). */
export function withMockupCrumbs(html: string, slug: string): string {
  const t = TRAILS[slug];
  if (!t) return html;
  return html.replace(/<nav aria-label="Breadcrumb"[\s\S]*?<\/nav>/, breadcrumbsHtml(t));
}
