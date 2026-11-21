import { Link, type LinkProps } from "@tanstack/react-router";

/**
 * Homepage hero feature tiles: the colored action bars beside the headline (mobile: under the search bar).
 * This slot is reserved for SPECIAL FEATURES only.
 *
 * HOW TO ADD A TILE
 *   1. Add one object to HERO_TILES below: { to, kicker, title, tone }.
 *        to     – an internal route (typed, so a typo fails the build)
 *        kicker – the small mono line on top, keep it to a few words
 *        title  – the big uppercase line, keep it to ~3 words
 *        tone   – "gold" | "red" | "blue" | "green" (add a new tone in TONE if a new color is ever approved)
 *   2. That's it. Tiles stack as full-width bars in array order, all the same width and height
 *      (the compact Emergency Monitoring bar: min-h-16, row layout, full width of the column).
 */
type Tone = "gold" | "red" | "blue" | "green";
type HeroTile = { to: LinkProps["to"]; kicker: string; title: string; tone: Tone };

export const HERO_TILES: HeroTile[] = [
  { to: "/how-to", kicker: "New here?", title: "How to use this website", tone: "gold" },
  { to: "/virginia-2027-bills", kicker: "New • Updated daily as filed", title: "Virginia 2027 bills", tone: "blue" },
  { to: "/2027", kicker: "New • 2027 races", title: "2027 Election Dashboard", tone: "green" },
  { to: "/emergency-monitor", kicker: "Live · Updated every hour", title: "Emergency Monitoring", tone: "red" },
];

const TONE: Record<Tone, string> = {
  gold: "bg-gold text-navy-900 ring-gold-hover hover:bg-gold-hover",
  red: "bg-[#C8102E] text-white ring-[#ff6b7f] hover:bg-[#a50d26]",
  blue: "bg-forest text-white ring-[#9ec0ef] hover:bg-[#163a6e]",
  // Site teal-green already used on action buttons with white text (#0d7377 / hover #095456).
  green: "bg-[#0d7377] text-white ring-[#7ed4d6] hover:bg-[#095456]",
};

export function HeroFeatureTiles({ className = "" }: { className?: string }) {
  return (
    <div data-home-actions className={`grid grid-cols-1 gap-3 ${className}`}>
      {HERO_TILES.map((t) => (
        <Link
          key={t.title}
          to={t.to}
          data-feature-tile="wide"
          className={`group flex min-h-16 min-w-0 flex-row items-center justify-between gap-3 rounded-xl p-4 shadow-lg transition focus-visible:ring-4 ${TONE[t.tone]}`}
        >
          <span className="min-w-0">
            <span className="block font-mono text-[10px] leading-snug font-semibold tracking-wider uppercase sm:text-xs sm:tracking-widest">{t.kicker}</span>
            <span className="mt-1 block font-serif text-lg leading-tight font-bold uppercase sm:text-xl">{t.title}</span>
          </span>
          <span aria-hidden className="font-serif text-xl leading-none font-bold transition group-hover:translate-x-1">→</span>
        </Link>
      ))}
    </div>
  );
}
