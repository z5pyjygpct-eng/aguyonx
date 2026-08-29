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

export const NAV = [
  { to: "/articles", label: "Articles" },
  { to: "/investigations", label: "Investigations" },
  { to: "/library", label: "Library" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

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
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "inline-flex h-11 items-center px-2.5 font-mono text-xs tracking-widest uppercase transition-[color] duration-150",
                inverted
                  ? "text-night-muted hover:text-night-fg"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
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
