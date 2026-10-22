import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SITE } from "@/content/site";
import { DASHBOARDS } from "@/lib/dashboards";

/** v4 primary nav (Scott-approved): About, News, Investigations, Videos, Articles, Tools. */
export const NAV_PRIMARY = [
  { to: "/about", label: "About" },
  { to: "/news", label: "News" },
  { to: "/investigations", label: "Investigations" },
  { to: "/videos", label: "Videos" },
  { to: "/articles", label: "Articles" },
] as const;

/** Everything else lives under Other Resources so no existing page loses its door.
 * News is not repeated here: its canonical place is the primary nav (Scott-approved order). */
export const NAV_TOOLS = [
  { to: "/nova-briefing", label: "Daily NoVA Briefing" },
  { to: "/library", label: "Research Library" },
  { to: "/library/foia", label: "FOIA letter desk" },
  { to: "/2027", label: "2027 election" },
  { to: "/va-violent-crime-outcomes", label: "VA Violent Crime Outcomes" },
  { to: "/tips", label: "Got Tips?" },
] as const;

// Legacy groupings kept for footer/other importers.
export const NAV_SHELVES = [
  { to: "/articles", label: "Articles" },
  { to: "/news", label: "News" },
  { to: "/nova-briefing", label: "NoVA Briefing" },
  { to: "/videos", label: "Videos" },
  { to: "/find-the-moment", label: "Find the Moment" },
  { to: "/investigations", label: "Investigations" },
  { to: "/library", label: "Other Resources" },
] as const;
export const NAV_OFFICES = [
  { to: "/delegates", label: "Delegates" },
  { to: "/senators", label: "Senators" },
  { to: "/general-assembly", label: "Gen. Assembly" },
  { to: "/counties", label: "Counties" },
  { to: "/2027", label: "2027 election" },
] as const;
export const NAV_DESK = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;
export const NAV = [...NAV_SHELVES, ...NAV_OFFICES, ...NAV_DESK];

const LINK =
  "inline-flex h-11 items-center px-2 font-serif text-[15px] font-medium tracking-[0.06em] uppercase text-on-dark-muted transition-colors hover:text-white";

export function SiteHeader(_props: { inverted?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  const [tools, setTools] = useState(false);
  const [dash, setDash] = useState(false);
  const toolsId = useId();
  const dashId = useId();
  const toolsRef = useRef<HTMLDivElement>(null);
  const toolsBtn = useRef<HTMLButtonElement>(null);
  // Other Resources is a click/tap disclosure: closes on outside click, on Esc (focus back to the button) and when focus leaves it.
  useEffect(() => {
    if (!tools) return;
    const onDown = (e: PointerEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setTools(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setTools(false);
        toolsBtn.current?.focus();
      }
    };
    const onFocus = (e: FocusEvent) => {
      if (toolsRef.current && e.target instanceof Node && !toolsRef.current.contains(e.target)) setTools(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
    };
  }, [tools]);
  return (
    <header className="agx-dark sticky top-0 z-40 border-b border-navy-line/60 bg-navy-900 text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="shrink-0 font-serif text-[22px] font-bold tracking-wide text-white" aria-label="A Guy on X home">
          A GUY ON <span className="text-gold">X</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_PRIMARY.map((item) => (
            <Link key={item.to} to={item.to} className={LINK} activeProps={{ className: "!text-gold" }}>
              {item.label}
            </Link>
          ))}
          <div className="relative" ref={toolsRef}>
            <button
              ref={toolsBtn}
              type="button"
              className={LINK}
              aria-expanded={tools}
              aria-controls={toolsId}
              onClick={() => setTools((v) => !v)}
            >
              Other Resources <ChevronDown className={`ml-1 size-4 text-gold transition-transform ${tools ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {tools ? (
              <ul id={toolsId} className="absolute right-0 top-11 w-60 rounded-lg border border-navy-line bg-navy-700 p-2 shadow-xl">
                {NAV_TOOLS.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} onClick={() => setTools(false)} className="flex min-h-11 items-center rounded-md px-3 text-sm text-white hover:bg-navy-600">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <a
            href={SITE.giveUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-3 inline-flex min-h-11 flex-col items-center justify-center rounded-lg bg-flag px-4 py-1.5 text-center font-serif text-[13px] leading-tight font-bold tracking-[0.06em] text-white hover:brightness-110"
          >
            <span>DONATE TO HELP FUEL</span>
            <span>THE PUBLIC RECORD</span>
          </a>
        </nav>
        <div className="flex items-center gap-2 lg:hidden">
          <a href={SITE.giveUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 flex-col items-center justify-center rounded-lg bg-flag px-3 py-1 text-center font-serif text-[11px] leading-tight font-bold tracking-[0.05em] text-white">
            <span>DONATE TO HELP FUEL</span>
            <span>THE PUBLIC RECORD</span>
          </a>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button type="button" aria-label="Open menu" className="inline-flex size-11 items-center justify-center rounded-lg border border-navy-line text-gold">
                <Menu />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="border-navy-line bg-navy-800 text-white">
              <SheetHeader>
                <SheetTitle className="font-serif text-white">A GUY ON <span className="text-gold">X</span></SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col overflow-y-auto px-4 pb-6" aria-label="Mobile">
                <button
                  type="button"
                  aria-expanded={dash}
                  aria-controls={dashId}
                  onClick={() => setDash((v) => !v)}
                  className="flex min-h-12 items-center justify-between border-b border-navy-line/60 text-left font-serif text-lg uppercase tracking-wide"
                >
                  Dashboards <ChevronDown className={`size-5 text-gold transition-transform ${dash ? "rotate-180" : ""}`} aria-hidden />
                </button>
                {dash ? (
                  <ul id={dashId} className="shrink-0 border-b border-navy-line/60 py-1 pl-3">
                    {DASHBOARDS.map((d) => (
                      <li key={d.slug}>
                        <Link to="/dashboards/$body" params={{ body: d.slug }} onClick={() => setOpen(false)} className="flex min-h-11 items-center text-base text-on-dark-muted hover:text-white">
                          {d.short}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {[...NAV_PRIMARY, ...NAV_TOOLS, { to: "/contact", label: "Contact" } as const].map((item) => (
                  <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="flex min-h-12 items-center border-b border-navy-line/60 font-serif text-lg uppercase tracking-wide">
                    {item.label}
                  </Link>
                ))}
                <a href={SITE.giveUrl} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="mt-4 flex h-12 shrink-0 items-center justify-center rounded-lg bg-flag text-sm font-semibold tracking-[0.12em] text-white uppercase">
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
