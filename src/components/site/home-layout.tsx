import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { OFFICE_DOORS } from "@/content/offices";
import { SITE } from "@/content/site";

const SHELVES = [
  { to: "/about" as const, label: "About" },
  { to: "/contact" as const, label: "Contact" },
  { to: "/investigations" as const, label: "Investigations" },
  { to: "/articles" as const, label: "Articles" },
  { to: "/library" as const, label: "Library" },
];

const FTM_DOORS = [
  { to: "/counties/loudoun" as const, label: "Loudoun County" },
  { to: "/counties/loudoun/schools" as const, label: "Loudoun Schools" },
];

/** One pill size for left office doors and cream shelves. */
const PILL =
  "inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-[#E6E1D4] px-4 font-sans text-xs font-semibold tracking-[0.14em] text-night uppercase transition-[filter] duration-150 hover:brightness-95 sm:px-5 sm:text-sm";

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
 * Home chrome: navy left rail + short headline + cream shelves + FTM video.
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
      </nav>

      {/* Desktop office rail — top aligns with cream shelves; fills night down the page */}
      <aside className="hidden flex-col bg-night text-night-fg lg:flex lg:col-start-1 lg:row-start-2">
        <nav aria-label="Virginia offices" className="flex flex-col gap-2.5 px-4 py-3 xl:px-5">
          <OfficeDoorLinks />
        </nav>
        <div className="min-h-0 flex-1" aria-hidden />
      </aside>

      {/* Shelves + FTM + below-fold — one column so no stretch gap under shelves */}
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
        </nav>

        <section
          aria-label="Find the Moment"
          className="border-b border-border bg-background px-4 pb-8 pt-5 sm:px-6 sm:pb-10 sm:pt-6"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-sans text-3xl font-semibold tracking-tight text-night sm:text-4xl">
              “Find the Moment”
            </h2>
            <p className="mt-2 font-sans text-sm text-night/75 sm:text-base">
              Search what was said in the video. Jump to the video.
            </p>

            <div className="mt-5 overflow-hidden rounded-md bg-[#0d4f6b] shadow-sm outline outline-1 outline-night/10">
              <video
                className="aspect-video w-full bg-night"
                controls
                playsInline
                preload="metadata"
                poster="/images/va-change-hero.png"
              >
                <source src="/videos/find-the-moment-demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <nav
              aria-label="Find the Moment doors"
              className="mt-5 flex flex-wrap justify-center gap-3"
            >
              {FTM_DOORS.map((door) => (
                <Link
                  key={door.to}
                  to={door.to}
                  className="inline-flex items-center rounded-md border-2 border-[#0d7377] bg-transparent px-5 py-2.5 font-sans text-sm font-semibold tracking-[0.14em] text-[#0d7377] uppercase transition-[background-color,color] duration-150 hover:bg-[#0d7377] hover:text-white"
                >
                  {door.label}
                </Link>
              ))}
            </nav>
            <p className="mt-3 font-mono text-[11px] tracking-widest text-[#0d7377] uppercase">
              Live · Virginia public meetings
            </p>
            <p className="mt-6 max-w-md text-sm text-night/70">
              Help open the next localities.{" "}
              <a
                href={SITE.giveUrl}
                className="font-semibold text-[#0d7377] underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                {SITE.giveLabel}
              </a>
            </p>
          </div>
        </section>

        {children}
      </div>

    </div>
  );
}
