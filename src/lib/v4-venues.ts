/** v4 venue configs (preview). Add an entry per body when rolling the template out. */
import type { V4Venue } from "@/components/site/venue-v4";
import { FOIA } from "@/lib/dashboards";

const loudoun = { label: "Loudoun", to: "/dashboards/$body", params: { body: "loudoun" } };
export const V4_VENUES = {
  "loudoun-lcps": { crumbs: [loudoun, { label: "LCPS" }], titleA: "Loudoun County", titleB: "Public Schools", foia: { label: "FOIA to LCPS", href: "https://www.lcps.org/foia" } },
  "loudoun-bos": { crumbs: [loudoun, { label: "Board of Supervisors" }], titleA: "Loudoun County", titleB: "Board of Supervisors", foia: FOIA.loudoun },
} satisfies Record<string, V4Venue>;
