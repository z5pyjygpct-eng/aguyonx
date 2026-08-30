export type DelegateFile = {
  slug: string;
  name: string;
  district: string;
  locality: string;
  tax?: string;
  energy?: string;
};

/** Only members with a paper on disk. Add a row when the next file exists. */
export const DELEGATE_FILES: DelegateFile[] = [
  {
    slug: "hope-hd1",
    name: "Patrick A. Hope",
    district: "HD-1",
    locality: "Arlington (part)",
    tax: "/files/delegates/hope-hd1-tax.pdf",
  },
  {
    slug: "mcclure-hd2",
    name: "Adele Y. McClure",
    district: "HD-2",
    locality: "Arlington (part)",
    tax: "/files/delegates/mcclure-hd2-tax.pdf",
  },
  {
    slug: "lopez-hd3",
    name: "Alfonso H. Lopez",
    district: "HD-3",
    locality: "Arlington (part); Alexandria (part)",
    tax: "/files/delegates/lopez-hd3-tax.pdf",
  },
  {
    slug: "herring-hd4",
    name: "Charniele L. Herring",
    district: "HD-4",
    locality: "Fairfax (part); Alexandria (part)",
    tax: "/files/delegates/herring-hd4-tax.pdf",
  },
  {
    slug: "mcpike-hd5",
    name: "Kirk McPike",
    district: "HD-5",
    locality: "Alexandria (part)",
    tax: "/files/delegates/mcpike-hd5-tax.pdf",
  },
  {
    slug: "sullivan-hd6",
    name: 'Richard C. "Rip" Sullivan, Jr.',
    district: "HD-6",
    locality: "Fairfax (part)",
    tax: "/files/delegates/sullivan-hd6-tax.pdf",
  },
  {
    slug: "keys-gamarra-hd7",
    name: "Karen Keys-Gamarra",
    district: "HD-7",
    locality: "Fairfax (part)",
    tax: "/files/delegates/keys-gamarra-hd7-tax.pdf",
  },
  {
    slug: "shin-hd8",
    name: "Irene Shin",
    district: "HD-8",
    locality: "Fairfax County / Herndon",
    tax: "/files/delegates/shin-hd8-tax.pdf",
  },
  {
    slug: "delaney-hd9",
    name: "Karrie K. Delaney",
    district: "HD-9",
    locality: "Fairfax (part)",
    tax: "/files/delegates/delaney-hd9-tax.pdf",
  },
  {
    slug: "singh-hd26",
    name: 'Jas Jeet "JJ" Singh',
    district: "HD-26",
    locality: "Loudoun County",
    tax: "/files/delegates/singh-hd26-tax.pdf",
    energy: "/files/delegates/singh-hd26-energy.pdf",
  },
  {
    slug: "reaser-hd27",
    name: "Atoosa R. Reaser",
    district: "HD-27",
    locality: "Loudoun County",
    tax: "/files/delegates/reaser-hd27-tax.pdf",
    energy: "/files/delegates/reaser-hd27-energy.pdf",
  },
  {
    slug: "reid-hd28",
    name: "David A. Reid",
    district: "HD-28",
    locality: "Loudoun County",
    tax: "/files/delegates/reid-hd28-tax.pdf",
    energy: "/files/delegates/reid-hd28-energy.pdf",
  },
  {
    slug: "martinez-hd29",
    name: 'Fernando J. "Marty" Martinez',
    district: "HD-29",
    locality: "Loudoun County",
    tax: "/files/delegates/martinez-hd29-tax.pdf",
  },
  {
    slug: "mcauliff-hd30",
    name: "John Chilton McAuliff",
    district: "HD-30",
    locality: "Loudoun County",
    tax: "/files/delegates/mcauliff-hd30-tax.pdf",
    energy: "/files/delegates/mcauliff-hd30-energy.pdf",
  },
];
