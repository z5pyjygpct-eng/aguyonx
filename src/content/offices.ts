export type OfficeDoor = {
  to: "/delegates" | "/senators" | "/2027";
  navLabel: string;
  title: string;
  chamber: string;
  dek: string;
};

/** Virginia office doors. Add the next chamber or locality here; nav and home pick it up. */
export const OFFICE_DOORS: OfficeDoor[] = [
  {
    to: "/delegates",
    navLabel: "Delegates",
    title: "VA Delegates",
    chamber: "House of Delegates",
    dek: "Democrat House members. Tax and energy papers, when they exist.",
  },
  {
    to: "/senators",
    navLabel: "Senators",
    title: "VA Senators",
    chamber: "Senate of Virginia",
    dek: "Member files for the Virginia Senate. This page is the door, not a directory. Contact is how a file leaves the building.",
  },
  {
    to: "/2027",
    navLabel: "2027 Democrats",
    title: "2027 Democrats",
    chamber: "2027 cycle",
    dek: "Declared and potential Democratic candidates for 2027 (House, Senate, local). 2027 also covers constitutional officers (Commonwealth's Attorney, Commissioner of Revenue, Treasurer, Sheriff) when a Democrat is sitting or declared. This is a name file, not the shop. Links to already-public news when we have them.",
  },
];

export function officeByPath(to: OfficeDoor["to"]) {
  return OFFICE_DOORS.find((o) => o.to === to);
}
