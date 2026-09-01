import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Mark } from "@/components/site/mark";
import { cn } from "@/lib/utils";

export const NAV_SHELVES = [
  { to: "/articles", label: "Articles" },
  { to: "/news", label: "News" },
  { to: "/investigations", label: "Investigations" },
  { to: "/library", label: "Library" },
] as const;

export const NAV_OFFICES = [
  { to: "/delegates", label: "Delegates" },
  { to: "/senators", label: "Senators" },
] as const;

export const NAV_DESK = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export const NAV = [...NAV_SHELVES, ...NAV_OFFICES, ...NAV_DESK];

const groups = [
  { id: "shelves", items: NAV_SHELVES },
  { id: "offices", items: NAV_OFFICES },
  { id: "desk", items: NAV_DESK },
] as const;

function linkClass(inverted: boolean) {
  return cn(
    "inline-flex h-11 items-center px-2 font-mono text-xs tracking-widest uppercase transition-[color] duration-150 lg:px-2.5",
    inverted ? "text-night-muted hover:text-night-fg" : "text-muted-foreground hover:text-foreground",
  );
}

export function SiteHeader({ inverted = false }: { inverted?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b",
        inverted
          ? "border-night-fg/15 bg-night/95 text-night-fg backdrop-blur-sm"
          : "border-border bg-background/95 text-foreground backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="shrink-0" aria-label="A Guy on X home">
          <Mark />
        </Link>

        <nav className="hidden items-center lg:flex" aria-label="Primary">
          {groups.map((group, i) => (
            <span key={group.id} className="flex items-center">
              {i > 0 ? (
                <span
                  aria-hidden
                  className={cn(
                    "mx-1.5 h-4 w-px",
                    inverted ? "bg-night-fg/25" : "bg-border",
                  )}
                />
              ) : null}
              {group.items.map((item) => (
                <Link key={item.to} to={item.to} className={linkClass(inverted)}>
                  {item.label}
                </Link>
              ))}
            </span>
          ))}
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant={inverted ? "secondary" : "outline"}
              size="icon"
              className="lg:hidden"
              aria-label="Open menu"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background text-foreground">
            <SheetHeader>
              <SheetTitle>A Guy on X</SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col" aria-label="Mobile">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center border-b border-border font-serif text-lg"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
