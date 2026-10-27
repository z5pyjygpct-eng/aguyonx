/** v4 venue configs (preview). Add an entry per body when rolling the template out. */
import type { V4Venue } from "@/components/site/venue-v4";
import { FOIA } from "@/lib/dashboards";

const loudoun = { label: "Loudoun", to: "/dashboards/$body", params: { body: "loudoun" } };
const albemarle = { label: "Albemarle", to: "/dashboards/$body", params: { body: "albemarle" } };
const ffx = { label: "City of Fairfax", to: "/dashboards/$body", params: { body: "fairfax-city" } };
const mna = { label: "Manassas", to: "/dashboards/$body", params: { body: "manassas" } };
const hanover = { label: "Hanover", to: "/dashboards/$body", params: { body: "hanover" } };
const chesterfield = { label: "Chesterfield", to: "/dashboards/$body", params: { body: "chesterfield" } };
const henrico = { label: "Henrico", to: "/dashboards/$body", params: { body: "henrico" } };
const ffxco = { label: "Fairfax County", to: "/dashboards/$body", params: { body: "fairfax-county" } };
const pwc = { label: "Prince William", to: "/dashboards/$body", params: { body: "prince-william" } };
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
  "henrico-bos": { crumbs: [henrico, { label: "Board of Supervisors", to: "/dashboards/$body", params: { body: "henrico" }, hash: "henrico-county-board-of-supervisors" }], titleA: "Henrico County", titleB: "Board of Supervisors", foia: FOIA.henrico },
  "henrico-schools": { crumbs: [henrico, { label: "HCPS", to: "/dashboards/$body", params: { body: "henrico" }, hash: "henrico-county-public-schools" }], titleA: "Henrico County", titleB: "Public Schools", foia: FOIA.hcps },
  "fairfax-county-bos": { crumbs: [ffxco, { label: "Board of Supervisors", to: "/dashboards/$body", params: { body: "fairfax-county" }, hash: "fairfax-county-board-of-supervisors" }], titleA: "Fairfax County", titleB: "Board of Supervisors", foia: FOIA.fairfaxCounty },
  "fairfax-county-schools": { crumbs: [ffxco, { label: "FCPS", to: "/dashboards/$body", params: { body: "fairfax-county" }, hash: "fairfax-county-public-schools" }], titleA: "Fairfax County", titleB: "Public Schools", foia: FOIA.fcps },
  "pwc-bos": { crumbs: [pwc, { label: "Board of County Supervisors", to: "/dashboards/$body", params: { body: "prince-william" }, hash: "prince-william-board-of-county-supervisors" }], titleA: "Prince William", titleB: "Board of County Supervisors", foia: FOIA.princeWilliam },
  "pwc-schools": { crumbs: [pwc, { label: "PWCS", to: "/dashboards/$body", params: { body: "prince-william" }, hash: "prince-william-county-public-schools" }], titleA: "Prince William County", titleB: "Public Schools", foia: FOIA.pwcs },
  "va-house": { crumbs: [GA, { label: "House of Delegates", to: "/dashboards/$body", params: { body: "house" } }], titleA: "Virginia", titleB: "House of Delegates", foia: FOIA.house },
  "va-senate": { crumbs: [GA, { label: "State Senate", to: "/dashboards/$body", params: { body: "senate" } }], titleA: "Senate of", titleB: "Virginia", foia: FOIA.senate },
  "va-boe": { crumbs: [{ label: "Virginia Department of Education" }, { label: "Board of Education", to: "/dashboards/$body", params: { body: "board-of-education" } }], titleA: "Virginia", titleB: "Board of Education", foia: FOIA.vdoe },
} satisfies Record<string, V4Venue>;
