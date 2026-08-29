import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Kicker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}
