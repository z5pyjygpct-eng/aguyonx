export type OfficeDoor = {
  to: "/delegates" | "/senators";
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
];

export function officeByPath(to: OfficeDoor["to"]) {
  return OFFICE_DOORS.find((o) => o.to === to);
}
