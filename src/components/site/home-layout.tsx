import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { OFFICE_DOORS } from "@/content/offices";

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

/** One pill size for left office doors and cream shelves — same height/type. */
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
        <Link
          key={door.to}
          to={door.to}
          className={className ?? `${PILL} w-full text-center`}
        >
          {officeRailLabel(door.title)}
        </Link>
      ))}
    </>
  );
}

/**
 * Home chrome from the Sep 2026 mock: navy left rail (offices), short headline band,
 * cream shelves, Find the Moment video plate. Mobile collapses the rail.
 * Desktop grid keeps left VA DELEGATES top-aligned with the cream shelf row.
 */
export function HomeLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:grid-rows-[auto_auto_1fr] xl:grid-cols-[16rem_minmax(0,1fr)]">
      {/* Brand — shares row with navy headline */}
      <div className="hidden items-center gap-2.5 bg-night px-4 py-6 text-night-fg lg:flex lg:col-start-1 lg:row-start-1 xl:px-5">
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

      {/* Compact navy headline */}
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
        className="flex flex-wrap justify-center gap-2 border-b border-border bg-night px-4 pb-6 lg:hidden"
      >
        <OfficeDoorLinks className={PILL} />
      </nav>

      {/* Desktop office rail — same row as cream shelves */}
      <nav
        aria-label="Virginia offices"
        className="hidden flex-col gap-2.5 self-start bg-night px-4 py-3 text-night-fg lg:flex lg:col-start-1 lg:row-start-2 xl:px-5"
      >
        <OfficeDoorLinks />
      </nav>

      {/* Cream shelves */}
      <nav
        aria-label="Primary"
        className="flex flex-wrap items-center justify-center gap-2.5 self-start border-b border-border bg-paper px-4 py-3 sm:gap-3 lg:col-start-2 lg:row-start-2"
      >
        {SHELVES.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={PILL}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Left rail fill under the doors */}
      <div className="hidden bg-night lg:block lg:col-start-1 lg:row-start-3" aria-hidden />

      {/* Main plate + below-fold */}
      <div className="flex min-w-0 flex-col lg:col-start-2 lg:row-start-3">
        <section
          aria-label="Find the Moment"
          className="border-b border-border bg-background px-4 py-10 sm:px-6 sm:py-12"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-sans text-3xl font-semibold tracking-tight text-night sm:text-4xl">
              “Find the Moment”
            </h2>
            <p className="mt-3 font-sans text-sm text-night/75 sm:text-base">
              Search what was said in the video. Jump to the video.
            </p>

            <div className="mt-8 overflow-hidden rounded-md bg-[#0d4f6b] shadow-sm outline outline-1 outline-night/10">
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
              className="mt-7 flex flex-wrap justify-center gap-3"
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
            <p className="mt-4 font-mono text-[11px] tracking-widest text-[#0d7377] uppercase">
              Live · Virginia public meetings
            </p>
          </div>
        </section>

        {children}
      </div>
    </div>
  );
}
