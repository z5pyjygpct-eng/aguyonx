import { Link } from "@tanstack/react-router";

/** Simplified Virginia outline (stroke watermark). Public-domain Census-derived geometry. */
const VA_OUTLINE_PATH =
  "M611.2,135.4 L649.6,94.3 L664.4,63.7 L675.5,20.0 L747.6,53.2 L768.4,47.0 L781.5,66.0 L805.5,89.0 L826.6,107.3 L830.8,144.8 L814.0,155.9 L806.5,174.4 L802.6,196.7 L821.3,203.8 L839.3,204.5 L845.4,223.3 L873.0,234.8 L890.1,239.5 L911.9,264.4 L929.7,291.1 L927.2,311.6 L926.4,322.6 L898.4,315.8 L885.4,294.7 L869.0,281.2 L880.4,298.3 L891.1,307.7 L917.3,330.7 L921.1,341.8 L933.7,355.5 L926.5,370.7 L912.5,362.1 L916.1,381.2 L916.5,388.1 L922.2,397.4 L928.4,418.9 L918.5,425.0 L907.3,420.2 L896.2,412.3 L889.1,396.7 L885.7,389.5 L869.2,390.9 L878.7,396.1 L882.5,402.4 L882.2,412.8 L893.3,420.9 L904.5,432.5 L914.3,441.5 L925.6,432.0 L957.3,438.3 L980.0,493.0 L975.4,498.5 L897.8,498.5 L732.7,499.4 L662.0,499.8 L605.5,499.9 L540.2,500.0 L465.4,499.8 L368.8,497.1 L274.1,492.5 L202.4,491.1 L150.6,491.3 L20.0,490.2 L81.9,467.5 L116.6,441.1 L120.3,432.3 L118.8,428.4 L123.6,425.1 L136.9,411.3 L234.5,340.7 L234.3,364.5 L237.6,368.5 L240.3,370.4 L245.1,377.8 L255.2,379.5 L257.1,384.6 L298.3,378.0 L303.5,370.2 L351.3,376.6 L366.2,354.4 L419.5,350.9 L439.5,318.8 L439.4,306.7 L465.1,268.5 L481.7,231.1 L509.9,188.5 L530.9,173.0 L562.7,187.6 L573.6,167.6 L595.8,121.1 L611.2,135.4 Z";

const DOORS = [
  { to: "/counties/loudoun" as const, label: "Loudoun County" },
  { to: "/counties/loudoun/schools" as const, label: "Loudoun Schools" },
] as const;

/**
 * Home tool plate: Find the Moment doors under the Virginia offices pills.
 * Soft VA outline watermark on cream — not a second hero. No donate.
 */
export function HomeFindTheMoment() {
  return (
    <section
      aria-label="Find the Moment"
      className="relative isolate overflow-hidden border-b border-border bg-paper"
    >
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <svg
          viewBox="0 0 1000 520"
          className="h-[140%] w-auto max-w-none text-[#1E4B8E] opacity-[0.16] sm:h-[160%] md:h-[180%]"
          fill="none"
        >
          <path
            d={VA_OUTLINE_PATH}
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 py-10 text-center sm:px-6 sm:py-12">
        <h2 className="font-serif text-3xl font-medium tracking-tight text-night sm:text-4xl md:text-5xl">
          Find the Moment
        </h2>
        <p className="mt-3 max-w-xl font-sans text-sm text-night/75 sm:text-base">
          Search what was said. Jump to the video.
        </p>
        <nav
          aria-label="Find the Moment doors"
          className="mt-7 flex flex-wrap justify-center gap-3 sm:gap-4"
        >
          {DOORS.map((door) => (
            <Link
              key={door.to}
              to={door.to}
              className="inline-flex items-center rounded-md border-2 border-[#1E4B8E] bg-transparent px-5 py-2.5 font-sans text-sm font-semibold tracking-[0.14em] text-[#1E4B8E] uppercase transition-[background-color,color] duration-150 hover:bg-[#1E4B8E] hover:text-white sm:px-7 sm:py-3 sm:text-base"
            >
              {door.label}
            </Link>
          ))}
        </nav>
        <p className="mt-4">
          <Link
            to="/counties/loudoun/find-the-moment"
            className="font-sans text-sm text-night/65 underline-offset-2 hover:text-[#1E4B8E] hover:underline"
          >
            Search County + Schools together →
          </Link>
        </p>
        <p className="mt-3 font-mono text-[11px] tracking-widest text-[#0d7377] uppercase">
          Live · Virginia public meetings
        </p>
      </div>
    </section>
  );
}
