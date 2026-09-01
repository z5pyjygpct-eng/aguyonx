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

];

