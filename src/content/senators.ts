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
];

