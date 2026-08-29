import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export function SiteShell({
  children,
  invertedHeader = false,
  hideHeader = false,
}: {
  children: ReactNode;
  invertedHeader?: boolean;
  hideHeader?: boolean;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {hideHeader ? null : <SiteHeader inverted={invertedHeader} />}
      {children}
      <SiteFooter />
    </div>
  );
}
