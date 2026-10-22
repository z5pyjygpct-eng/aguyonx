/** v4 venue configs (preview). Add an entry per body when rolling the template out. */
import type { V4Venue } from "@/components/site/venue-v4";
import { FOIA } from "@/lib/dashboards";

const loudoun = { label: "Loudoun", to: "/dashboards/$body", params: { body: "loudoun" } };
const albemarle = { label: "Albemarle", to: "/dashboards/$body", params: { body: "albemarle" } };
const ffx = { label: "City of Fairfax", to: "/dashboards/$body", params: { body: "fairfax-city" } };
const mna = { label: "Manassas", to: "/dashboards/$body", params: { body: "manassas" } };
const hanover = { label: "Hanover", to: "/dashboards/$body", params: { body: "hanover" } };
const chesterfield = { label: "Chesterfield", to: "/dashboards/$body", params: { body: "chesterfield" } };
const GA = { label: "General Assembly", to: "/dashboards/general-assembly" };
export const V4_VENUES = {
  "loudoun-lcps": { crumbs: [loudoun, { label: "LCPS", to: "/dashboards/$body", params: { body: "loudoun" }, hash: "loudoun-county-public-schools" }], titleA: "Loudoun County", titleB: "Public Schools", foia: { label: "FOIA to LCPS", href: "https://www.lcps.org/foia" } },
  "loudoun-bos": { crumbs: [loudoun, { label: "Board of Supervisors", to: "/dashboards/$body", params: { body: "loudoun" }, hash: "loudoun-county-board-of-supervisors" }], titleA: "Loudoun County", titleB: "Board of Supervisors", foia: FOIA.loudoun },
  "albemarle-bos": { crumbs: [albemarle, { label: "Board of Supervisors", to: "/dashboards/$body", params: { body: "albemarle" }, hash: "albemarle-county-board-of-supervisors" }], titleA: "Albemarle County", titleB: "Board of Supervisors", foia: FOIA.albemarle },
  "albemarle-schools": { crumbs: [albemarle, { label: "ACPS", to: "/dashboards/$body", params: { body: "albemarle" }, hash: "albemarle-county-public-schools" }], titleA: "Albemarle County", titleB: "Public Schools", foia: FOIA.acps },
  "fairfax-city-council": { crumbs: [ffx, { label: "City Council", to: "/dashboards/$body", params: { body: "fairfax-city" }, hash: "city-of-fairfax-city-council" }], titleA: "City of Fairfax", titleB: "City Council", foia: FOIA.fairfaxCity },
  "fairfax-city-schools": { crumbs: [ffx, { label: "Schools", to: "/dashboards/$body", params: { body: "fairfax-city" }, hash: "fairfax-city-schools" }], titleA: "City of Fairfax", titleB: "Schools", foia: FOIA.fairfaxCitySchools },
  "manassas-council": { crumbs: [mna, { label: "City Council", to: "/dashboards/$body", params: { body: "manassas" }, hash: "manassas-city-council" }], titleA: "City of Manassas", titleB: "City Council", foia: FOIA.manassas },
  "manassas-schools": { crumbs: [mna, { label: "MCPS", to: "/dashboards/$body", params: { body: "manassas" }, hash: "manassas-city-public-schools" }], titleA: "Manassas City", titleB: "Public Schools", foia: FOIA.mcps },
  "hanover-bos": { crumbs: [hanover, { label: "Board of Supervisors", to: "/dashboards/$body", params: { body: "hanover" }, hash: "hanover-county-board-of-supervisors" }], titleA: "Hanover County", titleB: "Board of Supervisors", foia: FOIA.hanover },
  "chesterfield-bos": { crumbs: [chesterfield, { label: "Board of Supervisors", to: "/dashboards/$body", params: { body: "chesterfield" }, hash: "chesterfield-county-board-of-supervisors" }], titleA: "Chesterfield County", titleB: "Board of Supervisors", foia: FOIA.chesterfield },
  "va-house": { crumbs: [GA, { label: "House of Delegates", to: "/dashboards/$body", params: { body: "house" } }], titleA: "Virginia", titleB: "House of Delegates", foia: FOIA.house },
  "va-senate": { crumbs: [GA, { label: "State Senate", to: "/dashboards/$body", params: { body: "senate" } }], titleA: "Senate of", titleB: "Virginia", foia: FOIA.senate },
  "va-boe": { crumbs: [{ label: "Virginia Department of Education" }, { label: "Board of Education", to: "/dashboards/$body", params: { body: "board-of-education" } }], titleA: "Virginia", titleB: "Board of Education", foia: FOIA.vdoe },
} satisfies Record<string, V4Venue>;
