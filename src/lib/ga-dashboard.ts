import type { Dashboard } from "@/lib/dashboards";

// Locked GA dashboard design (Scott-approved; tag ga-dashboard-locked).
const col = (name: string, ch: "house" | "senate", foia: { label: string; href: string }) => ({
  name,
  tiles: [
    { label: "Find the Moment", icon: "play" as const, to: `/dashboards/${ch}/find-the-moment` },
    { label: "Meeting Recaps", icon: "list" as const, to: `/dashboards/${ch}/recaps` },
    { label: "Members", icon: "people" as const, to: `/dashboards/${ch}/members` },
    { label: "Bills", icon: "book" as const, to: null, accentIcon: true },
    { label: "Scorecards", icon: "money" as const, to: null, accentIcon: true },
  ],
  foia,
});

export const GA_DASHBOARD: Dashboard = {
  slug: "general-assembly", short: "Dashboard", title: "Virginia General Assembly", group: "state",
  columns: [
    col("Virginia House of Delegates", "house", { label: "FOIA to House of Delegates", href: "https://vga.virginia.gov/help/foia/" }),
    col("Senate of Virginia", "senate", { label: "FOIA to Senate", href: "https://apps.senate.virginia.gov/Senator/PDFs/SenateFOIARequest.pdf" }),
  ],
};

/** LAUNCH: noindex while on preview. Remove this (set to []) at cutover — see /workspace/v4shots/cutover-runbook.md. */
export const GA_PREVIEW_ROBOTS = [{ name: "robots", content: "noindex" }];
