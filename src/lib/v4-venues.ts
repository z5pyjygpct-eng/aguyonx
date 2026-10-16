/** v4 venue configs (preview). Add an entry per body when rolling the template out. */
import type { V4Venue } from "@/components/site/venue-v4";
import { FOIA } from "@/lib/dashboards";

const loudoun = { label: "Loudoun", to: "/dashboards/$body", params: { body: "loudoun" } };
const albemarle = { label: "Albemarle", to: "/dashboards/$body", params: { body: "albemarle" } };
const ffx = { label: "City of Fairfax", to: "/dashboards/$body", params: { body: "fairfax-city" } };
export const V4_VENUES = {
  "loudoun-lcps": { crumbs: [loudoun, { label: "LCPS" }], titleA: "Loudoun County", titleB: "Public Schools", foia: { label: "FOIA to LCPS", href: "https://www.lcps.org/foia" } },
  "loudoun-bos": { crumbs: [loudoun, { label: "Board of Supervisors" }], titleA: "Loudoun County", titleB: "Board of Supervisors", foia: FOIA.loudoun },
  "albemarle-bos": { crumbs: [albemarle, { label: "Board of Supervisors" }], titleA: "Albemarle County", titleB: "Board of Supervisors", foia: FOIA.albemarle },
  "albemarle-schools": { crumbs: [albemarle, { label: "ACPS" }], titleA: "Albemarle County", titleB: "Public Schools", foia: FOIA.acps },
  "fairfax-city-council": { crumbs: [ffx, { label: "City Council" }], titleA: "City of Fairfax", titleB: "City Council", foia: FOIA.fairfaxCity },
  "fairfax-city-schools": { crumbs: [ffx, { label: "Schools" }], titleA: "City of Fairfax", titleB: "Schools", foia: FOIA.fairfaxCitySchools },
} satisfies Record<string, V4Venue>;
