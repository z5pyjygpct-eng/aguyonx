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
  {
    slug: "rouse-sd22",
    name: "Aaron R. Rouse",
    district: "SD-22",
    locality: "Parts of Virginia Beach City",
    tax: "/files/senators/rouse-sd22-tax.pdf",
  },
  {
    slug: "locke-sd23",
    name: "Mamie E. Locke",
    district: "SD-23",
    locality: "All of Hampton City; Parts of Newport News City",
    tax: "/files/senators/locke-sd23-tax.pdf",
  },
  {
    slug: "mcpike-sd29",
    name: "Jeremy S. McPike",
    district: "SD-29",
    locality: "Parts of Prince William County and Stafford County",
    tax: "/files/senators/mcpike-sd29-tax.pdf",
  },
  {
    slug: "roem-sd30",
    name: "Danica A. Roem",
    district: "SD-30",
    locality: "All of Manassas City and Manassas Park City; parts of Prince William County",
    tax: "/files/senators/roem-sd30-tax.pdf",
  },
  {
    slug: "perry-sd31",
    name: "Russet Perry",
    district: "SD-31",
    locality: "Parts of Fauquier County and Loudoun County",
    tax: "/files/senators/perry-sd31-tax.pdf",
  },
  {
    slug: "srinivasan-sd32",
    name: "Kannan Srinivasan",
    district: "SD-32",
    locality: "Parts of Loudoun County",
    tax: "/files/senators/srinivasan-sd32-tax.pdf",
  },
  {
    slug: "carroll-foy-sd33",
    name: "Jennifer D. Carroll Foy",
    district: "SD-33",
    locality: "Parts of Fairfax County and Prince William County",
    tax: "/files/senators/carroll-foy-sd33-tax.pdf",
  },
  {
    slug: "surovell-sd34",
    name: "Scott A. Surovell",
    district: "SD-34",
    locality: "Parts of Fairfax County",
    tax: "/files/senators/surovell-sd34-tax.pdf",
  },
  {
    slug: "marsden-sd35",
    name: "David W. Marsden",
    district: "SD-35",
    locality: "Parts of Fairfax County",
    tax: "/files/senators/marsden-sd35-tax.pdf",
  },
  {
    slug: "pekarsky-sd36",
    name: "Stella G. Pekarsky",
    district: "SD-36",
    locality: "Parts of Fairfax County",
    tax: "/files/senators/pekarsky-sd36-tax.pdf",
  },
  {
    slug: "salim-sd37",
    name: "Saddam Azlan Salim",
    district: "SD-37",
    locality: "All of Fairfax City and Falls Church City; Parts of Fairfax County",
    tax: "/files/senators/salim-sd37-tax.pdf",
  },
  {
    slug: "boysko-sd38",
    name: "Jennifer B. Boysko",
    district: "SD-38",
    locality: "Parts of Fairfax County",
    tax: "/files/senators/boysko-sd38-tax.pdf",
  },
  {
    slug: "bennett-parker-sd39",
    name: "Elizabeth B. Bennett-Parker",
    district: "SD-39",
    locality: "All of Alexandria City; Parts of Arlington County and Fairfax County",
    tax: "/files/senators/bennett-parker-sd39-tax.pdf",
  },

];

