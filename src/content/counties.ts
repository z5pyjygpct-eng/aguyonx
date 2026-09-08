export type CountyDoor = {
  slug: string;
  name: string;
  live: boolean;
  dek: string;
};

/** Public VA Counties shelf. Loudoun is live; others are coming-soon cards only. */
export const COUNTIES: CountyDoor[] = [
  {
    slug: "loudoun",
    name: "Loudoun County",
    live: true,
    dek: "Find the Moment — searchable Board meeting captions with Granicus jump links, plus roster and official doors.",
  },
  {
    slug: "fairfax",
    name: "Fairfax County",
    live: false,
    dek: "Coming soon. Local meetings and the public record.",
  },
  {
    slug: "pwc",
    name: "Prince William County",
    live: false,
    dek: "Coming soon. Local meetings and the public record.",
  },
];

export function countyBySlug(slug: string) {
  return COUNTIES.find((c) => c.slug === slug);
}
