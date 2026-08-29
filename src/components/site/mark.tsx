import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center border border-current font-mono text-xs font-medium tracking-wider"
      >
        AGX
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-base font-medium tracking-tight">A Guy on X</span>
        <span className="mt-1 font-mono text-xs tracking-widest text-muted-foreground uppercase">
          aguyonx.com
        </span>
      </span>
    </span>
  );
}
