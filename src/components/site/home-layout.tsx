import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { OFFICE_DOORS } from "@/content/offices";
import { SITE } from "@/content/site";
import { HomeFindTheMoment } from "@/components/site/home-find-the-moment";
import { LoudounStats } from "@/components/site/loudoun-stats";

const SHELVES = [
  { to: "/about" as const, label: "About" },
  { to: "/contact" as const, label: "Contact" },
  { to: "/investigations" as const, label: "Investigations" },
  { to: "/videos" as const, label: "Videos" },
  { to: "/articles" as const, label: "Articles" },
  { to: "/library" as const, label: "Library" },
];

/** One pill size for left office doors and cream shelves. */
const PILL =
  "inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-[#E6E1D4] px-4 font-sans text-xs font-semibold tracking-[0.14em] text-night uppercase transition-[filter] duration-150 hover:brightness-95 sm:px-5 sm:text-sm";

/** Loud red GiveSendGo CTA — same height as cream/office pills. */
const GIVE_PILL =
  "inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-[#C41E3A] px-4 font-sans text-xs font-semibold tracking-[0.14em] text-white uppercase shadow-sm transition-[filter] duration-150 hover:brightness-110 sm:px-5 sm:text-sm";

function GivePill({ className }: { className?: string }) {
  return (
    <a
      href={SITE.giveUrl}
      className={className ?? GIVE_PILL}
      target="_blank"
      rel="noreferrer"
    >
      {SITE.giveLabel}
    </a>
  );
}

function officeRailLabel(title: string) {
  if (title === "2027 Democrats") return "2027 VA Democrats";
  return title;
}

function OfficeDoorLinks({ className }: { className?: string }) {
  return (
    <>
      {OFFICE_DOORS.map((door) => (
        <Link key={door.to} to={door.to} className={className ?? `${PILL} w-full text-center`}>
          {officeRailLabel(door.title)}
        </Link>
      ))}
    </>
  );
}

/**
 * Home chrome: navy left rail + short headline + cream shelves + FTM tool plate.
 * Desktop: row1 = brand | headline; row2 = doors | (shelves + FTM + rest)
 * so shelves and VA DELEGATES share a top edge with no dead cream gap.
 */
export function HomeLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:grid-rows-[auto_1fr] xl:grid-cols-[16rem_minmax(0,1fr)]">
      {/* Brand — stretches to headline band height */}
      <div className="hidden items-center bg-night px-4 py-6 text-night-fg lg:flex lg:col-start-1 lg:row-start-1 xl:px-5">
        <Link to="/" className="flex items-center gap-3" aria-label="A Guy on X home">
          <img
            src="/images/va-change-mark.png"
            alt=""
            width={44}
            height={44}
            className="size-11 object-cover"
          />
          <span className="font-serif text-xl font-medium leading-tight tracking-tight text-white xl:text-2xl">
            VA Change Agent
          </span>
        </Link>
      </div>

      <header className="bg-night px-4 py-8 text-center sm:px-6 sm:py-10 lg:col-start-2 lg:row-start-1">
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
          The Public Record Is The Story.
        </h1>
        <p className="mx-auto mt-3 max-w-2xl font-sans text-sm tracking-wide text-white/90 sm:text-base">
          Find what was said, voted, and filed — then jump to the source.
        </p>
      </header>

      {/* Mobile office doors */}
      <nav
        aria-label="Virginia offices"
        className="flex flex-wrap justify-center gap-2.5 border-b border-border bg-night px-4 pb-5 lg:hidden"
      >
        <OfficeDoorLinks className={PILL} />
        <GivePill />
      </nav>

      {/* Desktop office rail — top aligns with cream shelves; fills night down the page */}
      <aside className="hidden flex-col bg-night text-night-fg lg:flex lg:col-start-1 lg:row-start-2">
        <nav aria-label="Virginia offices" className="flex flex-col gap-2.5 px-4 py-3 xl:px-5">
          <OfficeDoorLinks />
          <GivePill className={`${GIVE_PILL} w-full text-center`} />
        </nav>
        <div className="min-h-0 flex-1" aria-hidden />
      </aside>

      {/* Shelves + FTM tool plate + below-fold — one column so no stretch gap under shelves */}
      <div className="flex min-w-0 flex-col lg:col-start-2 lg:row-start-2">
        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center justify-center gap-2.5 border-b border-border bg-paper px-4 py-3 sm:gap-3"
        >
          {SHELVES.map((item) => (
            <Link key={item.to} to={item.to} className={PILL}>
              {item.label}
            </Link>
          ))}
          <GivePill />
        </nav>

        <div className="grid border-b border-border bg-paper lg:grid-cols-[minmax(0,52rem)_17rem] lg:justify-center">
          <HomeFindTheMoment />
          <div className="px-4 py-6 lg:py-8 lg:pr-6 lg:pl-0">
            <LoudounStats heading="By the numbers · Site totals" className="border-2 !border-[#1E4B8E]" />
          </div>
        </div>

        {children}
      </div>

    </div>
  );
}
