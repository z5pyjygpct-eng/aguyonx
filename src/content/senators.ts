export type SenatorFile = {
  slug: string;
  name: string;
  district: string;
  locality: string;
  tax?: string;
  energy?: string;
};

/** Only members with a paper on disk. Add a row when the next file exists. */
export const SENATOR_FILES: SenatorFile[] = [
  {
    slug: "deeds-sd11",
    name: "R. Creigh Deeds",
    district: "SD-11",
    locality: "Albemarle, Charlottesville, Amherst, Nelson & Louisa (part)",
    tax: "/files/senators/deeds-sd11-tax.pdf",
  },
  {
    slug: "aird-sd13",
    name: "Lashrecse D. Aird",
    district: "SD-13",
    locality: "Charles City; Prince George; Surry; Sussex; Hopewell; Petersburg; Dinwiddie (part); Henrico (part)",
    tax: "/files/senators/aird-sd13-tax.pdf",
  },
  {
    slug: "bagby-sd14",
    name: "Lamont Bagby",
    district: "SD-14",
    locality: "Henrico (part); Richmond City (part)",
    tax: "/files/senators/bagby-sd14-tax.pdf",
  },
  {
    slug: "jones-sd15",
    name: "Michael J. Jones",
    district: "SD-15",
    locality: "Chesterfield (part); Richmond City (part)",
    tax: "/files/senators/jones-sd15-tax.pdf",
  },
  {
    slug: "vanvalkenburg-sd16",
    name: "Schuyler T. VanValkenburg",
    district: "SD-16",
    locality: "Henrico County (part)",
    tax: "/files/senators/vanvalkenburg-sd16-tax.pdf",
  },
  {
    slug: "lucas-sd18",
    name: "L. Louise Lucas",
    district: "SD-18",
    locality: "Parts of Chesapeake City and Portsmouth City",
    tax: "/files/senators/lucas-sd18-tax.pdf",
  },
  {
    slug: "williams-graves-sd21",
    name: "Angelia Williams Graves",
    district: "SD-21",
    locality: "Parts of Norfolk City",
    tax: "/files/senators/williams-graves-sd21-tax.pdf",
  },

];

