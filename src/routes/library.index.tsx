import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { Badge } from "@/components/ui/badge";
import { LIBRARY, LIBRARY_KINDS } from "@/content/library";
import type { LibraryItem } from "@/content/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library/")({ component: LibraryIndex });

function LibraryIndex() {
  const [kind, setKind] = useState<LibraryItem["kind"] | "all">("all");
  const list = useMemo(
    () => (kind === "all" ? LIBRARY : LIBRARY.filter((i) => i.kind === kind)),
    [kind],
  );

  return (
    <SiteShell>
      <HomeSearch />
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Kicker>Public doors</Kicker>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Research library
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Government, newsroom, and research sites this desk actually uses. Official filings over
          summaries. This is not a login, and it is not the shop.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <KindChip active={kind === "all"} onClick={() => setKind("all")}>
            All
          </KindChip>
          {LIBRARY_KINDS.map((k) => (
            <KindChip key={k.id} active={kind === k.id} onClick={() => setKind(k.id)}>
              {k.label}
            </KindChip>
          ))}
        </div>

        <ul className="mt-10 divide-y divide-border border-y border-border">
          {list.map((item) => (
            <li key={item.slug} className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{item.kind.replaceAll("-", " ")}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{item.displayDate}</span>
                </div>
                <h2 className="mt-2 font-serif text-xl font-medium">{item.title}</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{item.summary}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.source}</p>
              </div>
              <ItemAction item={item} />
            </li>
          ))}
        </ul>
      </main>
    </SiteShell>
  );
}

function ItemAction({ item }: { item: LibraryItem }) {
  const className =
    "inline-flex h-11 shrink-0 items-center justify-center rounded-md border border-border px-4 font-mono text-xs tracking-widest uppercase";
  if (item.tool) {
    return (
      <Link to="/library/foia" className={cn(className, "bg-primary text-primary-foreground")}>
        Open tool
      </Link>
    );
  }
  if (item.file) {
    return (
      <a href={item.file} download className={className}>
        Download
      </a>
    );
  }
  if (item.href) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" className={className}>
        Open source
      </a>
    );
  }
  return null;
}

function KindChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center rounded-md border px-3 font-mono text-xs tracking-widest uppercase transition-[background-color,color,border-color] duration-150",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
