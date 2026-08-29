import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export function SiteShell({
  children,
  invertedHeader = false,
}: {
  children: ReactNode;
  invertedHeader?: boolean;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <SiteHeader inverted={invertedHeader} />
      {children}
      <SiteFooter />
    </div>
  );
}
