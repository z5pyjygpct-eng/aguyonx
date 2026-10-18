/** v4 frame for the legacy venue doors, rosters and indexes (preview): navy V4Main + flag-bar hero. Look only. */
import type { ReactNode } from "react";
import { V4Main } from "@/components/site/lcps-v4";
import { Breadcrumbs, type Crumb } from "@/components/site/breadcrumbs";

export function LegacyV4({ children }: { children: ReactNode }) {
  return (
    <V4Main>
      <div className="agx-legacy">{children}</div>
    </V4Main>
  );
}

/** Hero band: shared breadcrumb trail (Home is added), gold kicker(s), uppercase h1, then any lead copy as children. */
export function LegacyHero({ trail, kicker, title, children, width = "max-w-5xl" }: { trail: Crumb[]; kicker?: ReactNode; title: ReactNode; children?: ReactNode; width?: string }) {
  return (
    <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
      <div className={`mx-auto w-full ${width} px-5 pt-7 pb-10 sm:px-8`}>
        <Breadcrumbs items={trail} className="mb-6" />
        {kicker ? <div className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase sm:text-base [&_p]:text-gold">{kicker}</div> : null}
        <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] break-words sm:text-6xl">{title}</h1>
        {children ? <div className="mt-4 max-w-2xl space-y-3 text-[#F6F3EA] [&_.text-muted-foreground]:text-[#F6F3EA] [&_.text-foreground]:text-white">{children}</div> : null}
      </div>
    </section>
  );
}

/** v4 door tile (index pages). */
export const LEGACY_TILE =
  "group relative block h-full rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 px-5 py-5 pr-12 text-white transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";
export const LEGACY_SOON =
  "block h-full rounded-xl border border-dashed border-navy-line bg-navy-800 px-5 py-5 text-white/80";
