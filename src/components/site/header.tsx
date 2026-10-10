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
import { SITE } from "@/content/site";
import { cn } from "@/lib/utils";

export const NAV_SHELVES = [
  { to: "/articles", label: "Articles" },
  { to: "/news", label: "News" },
  { to: "/videos", label: "Videos" },
  { to: "/find-the-moment", label: "Find the Moment" },
  { to: "/investigations", label: "Investigations" },
  { to: "/library", label: "Library" },
] as const;

export const NAV_OFFICES = [
  { to: "/delegates", label: "Delegates" },
  { to: "/senators", label: "Senators" },
  { to: "/general-assembly", label: "Gen. Assembly" },
  { to: "/counties", label: "Counties" },
  { to: "/2027", label: "2027 Democrats" },
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
    // Compact so all 11 links + Give fit the 6xl bar at 1280px laptops.
    "inline-flex h-11 items-center px-1.5 font-mono text-[11px] tracking-[0.08em] whitespace-nowrap uppercase transition-[color] duration-150",
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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="shrink-0" aria-label="A Guy on X home">
          <Mark />
        </Link>

        {/* Full bar from 1280px (theme xl is 80rem, so it never fits a 1280px laptop). Below: menu sheet. */}
        <nav className="nav-wide hidden min-w-0 items-center gap-2" aria-label="Primary">
          {groups.map((group, i) => (
            <span key={group.id} className="flex items-center">
              {i > 0 ? (
                <span
                  aria-hidden
                  className={cn(
                    "mx-1 h-4 w-px",
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
          <a
            href={SITE.giveUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-1 inline-flex h-9 shrink-0 items-center rounded-md bg-[#C41E3A] px-3 font-sans text-xs font-semibold tracking-[0.12em] whitespace-nowrap text-white uppercase transition-[filter] duration-150 hover:brightness-110"
          >
            Give
          </a>
        </nav>

        <div className="nav-narrow flex items-center gap-2">
          <a
            href={SITE.giveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-md bg-[#C41E3A] px-3 font-sans text-xs font-semibold tracking-[0.12em] text-white uppercase"
          >
            Give
          </a>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant={inverted ? "secondary" : "outline"}
              size="icon"
              className=""
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
              <a
                href={SITE.giveUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="mt-4 flex h-12 items-center justify-center rounded-md bg-[#C41E3A] font-sans text-sm font-semibold tracking-[0.14em] text-white uppercase"
              >
                {SITE.giveLabel}
              </a>
            </nav>
          </SheetContent>
        </Sheet>
        </div>
      </div>
    </header>
  );
}
