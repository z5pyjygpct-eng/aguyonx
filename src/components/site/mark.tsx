import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src="/images/va-change-mark.png"
        alt=""
        width={32}
        height={32}
        className="size-8 object-cover"
      />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-base font-medium tracking-tight">A Guy on X</span>
        <span className="mt-1 font-mono text-[0.65rem] tracking-widest text-muted-foreground uppercase">
          VA Change Agent
        </span>
      </span>
    </span>
  );
}
