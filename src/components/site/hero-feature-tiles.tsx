import { Link, type LinkProps } from "@tanstack/react-router";

/**
 * Homepage hero feature tiles: the small colored boxes beside the headline (mobile: under the search bar).
 * This slot is reserved for SPECIAL FEATURES only.
 *
 * HOW TO ADD A TILE
 *   1. Add one object to HERO_TILES below: { to, kicker, title, tone, wide? }.
 *        to     – an internal route (typed, so a typo fails the build)
 *        kicker – the small mono line on top, keep it to a few words
 *        title  – the big uppercase line, keep it to ~3 words
 *        tone   – "gold" | "red" | "blue" | "green" (add a new tone in TONE if a new color is ever approved)
 *        wide   – optional; true makes the tile a full-width bar across both columns
 *   2. That's it. Tiles flow into a 2-column grid in array order; every normal tile has the same width and height
 *      (the row stretches to the tallest one), and "wide" tiles are a compact full-width bar.
 *   3. Keep the slot short: normal tiles are about 135px tall and wide bars about 78px, so one row of tiles plus one bar (as now) or two rows of tiles
 *      still sit beside the headline/subhead/search column on desktop and never push the search bar down.
 *      Prefer a "wide" bar, or retire an old tile, over adding a long stack.
 */
type Tone = "gold" | "red" | "blue" | "green";
type HeroTile = { to: LinkProps["to"]; kicker: string; title: string; tone: Tone; wide?: boolean };

export const HERO_TILES: HeroTile[] = [
  { to: "/how-to", kicker: "New here?", title: "How to use this website", tone: "gold" },
  { to: "/virginia-2027-bills", kicker: "New • Updated daily as filed", title: "Virginia 2027 bills", tone: "blue" },
  { to: "/emergency-monitor", kicker: "Live · Updated every 2 hours", title: "Emergency Monitoring", tone: "red", wide: true },
  { to: "/campaign-money", kicker: "State filings · Official records", title: "Campaign Finance", tone: "green", wide: true },
];

const TONE: Record<Tone, string> = {
  gold: "bg-gold text-navy-900 ring-gold-hover hover:bg-gold-hover",
  red: "bg-[#C8102E] text-white ring-[#ff6b7f] hover:bg-[#a50d26]",
  blue: "bg-forest text-white ring-[#9ec0ef] hover:bg-[#163a6e]",
  green: "bg-[#164A3A] text-white ring-[#8FCB9B] hover:bg-[#1C5C49]",
};

export function HeroFeatureTiles({ className = "" }: { className?: string }) {
  return (
    <div data-home-actions className={`grid grid-cols-2 gap-3 ${className}`}>
      {HERO_TILES.map((t) => (
        <Link
          key={t.title}
          to={t.to}
          data-feature-tile={t.wide ? "wide" : "tile"}
          className={`group flex min-w-0 justify-between gap-3 rounded-xl p-4 shadow-lg transition focus-visible:ring-4 ${TONE[t.tone]} ${
            t.wide ? "col-span-2 min-h-16 flex-row items-center" : "min-h-[6.5rem] flex-col"
          }`}
        >
          <span className="min-w-0">
            <span className="block font-mono text-[10px] leading-snug font-semibold tracking-wider uppercase sm:text-xs sm:tracking-widest">{t.kicker}</span>
            <span className="mt-1 block font-serif text-lg leading-tight font-bold uppercase sm:text-xl">{t.title}</span>
          </span>
          <span aria-hidden className={`font-serif text-xl leading-none font-bold transition group-hover:translate-x-1 ${t.wide ? "" : "self-end"}`}>→</span>
        </Link>
      ))}
    </div>
  );
}
