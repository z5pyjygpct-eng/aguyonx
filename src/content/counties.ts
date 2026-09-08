export type ShelfDoor = {
  name: string;
  live: boolean;
  dek: string;
  /** App path when live; omit when coming soon. */
  to?: string;
};

export type CountyShelf = {
  id: string;
  /** Short label for grouping (e.g. Loudoun). */
  label: string;
  county: ShelfDoor;
  schools: ShelfDoor;
};

/**
 * VA Counties shelf — each county has two doors: County + Schools.
 * Keep flat; redesign when more than three counties land.
 */
export const COUNTY_SHELVES: CountyShelf[] = [
  {
    id: "loudoun",
    label: "Loudoun",
    county: {
      name: "Loudoun County",
      live: true,
      dek: "Find the Moment for Board of Supervisors meetings, thin roster, official doors.",
      to: "/counties/loudoun",
    },
    schools: {
      name: "Loudoun Schools",
      live: true,
      dek: "Find the Moment for School Board — one-meeting POC (Aug 11, 2026).",
      to: "/counties/loudoun/schools",
    },
  },
  {
    id: "fairfax",
    label: "Fairfax",
    county: {
      name: "Fairfax County",
      live: false,
      dek: "Coming soon. Local meetings and the public record.",
    },
    schools: {
      name: "Fairfax Schools",
      live: false,
      dek: "Coming soon. School board meetings and the public record.",
    },
  },
  {
    id: "pwc",
    label: "Prince William",
    county: {
      name: "Prince William County",
      live: false,
      dek: "Coming soon. Local meetings and the public record.",
    },
    schools: {
      name: "PWC Schools",
      live: false,
      dek: "Coming soon. School board meetings and the public record.",
    },
  },
];

export function countyBySlug(slug: string) {
  return COUNTY_SHELVES.find((c) => c.id === slug);
}
