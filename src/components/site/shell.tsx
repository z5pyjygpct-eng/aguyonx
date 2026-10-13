import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export function SiteShell({
  children,
  invertedHeader = false,
  hideHeader = false,
  location,
}: {
  children: ReactNode;
  invertedHeader?: boolean;
  hideHeader?: boolean;
  /** Footer location line; defaults to SITE.location. Venue pages pass their own. */
  location?: string;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {hideHeader ? null : <SiteHeader inverted={invertedHeader} />}
      {children}
      <SiteFooter location={location} />
    </div>
  );
}
