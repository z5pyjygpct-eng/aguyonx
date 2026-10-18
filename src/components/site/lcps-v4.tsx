import type { CSSProperties, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Mail } from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

/** Re-points the light theme tokens to navy so existing LCPS widgets render in the v4 dark system. */
export const DARK_VARS = {
  "--color-background": "#0b1a33",
  "--color-foreground": "#ffffff",
  "--color-card": "#13284d",
  "--color-card-foreground": "#ffffff",
  "--color-popover": "#13284d",
  "--color-popover-foreground": "#ffffff",
  "--color-paper": "#0b1a33",
  "--color-wash": "#16305c",
  "--color-muted": "#16305c",
  "--color-muted-foreground": "#d4dcea",
  "--color-border": "#2c4f86",
  "--color-input": "#2c4f86",
  "--color-secondary": "#16305c",
  "--color-secondary-foreground": "#ffffff",
  "--color-accent": "#16305c",
  "--color-accent-foreground": "#ffffff",
  "--color-primary": "#f5b82e",
  "--color-primary-foreground": "#0b1a33",
  "--color-forest": "#f5b82e",
  "--color-night": "#08142d",
} as CSSProperties;

export const LANDING = 20;
export const PER_PAGE = 40;
export function pageCount(n: number) {
  return n <= LANDING ? 1 : 1 + Math.ceil((n - LANDING) / PER_PAGE);
}
export function pageSlice<T>(items: T[], page: number): { rows: T[]; start: number } {
  if (page <= 1) return { rows: items.slice(0, LANDING), start: 0 };
  const start = LANDING + (page - 2) * PER_PAGE;
  return { rows: items.slice(start, start + PER_PAGE), start };
}
export function parseDate(label: string): number {
  const t = Date.parse(label.replace(/^[A-Za-z]+, /, ""));
  return Number.isNaN(t) ? 0 : t;
}

export function V4Hero({ kicker, crumb }: { kicker: string; crumb: string }) {
  return (
    <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
      <div className="mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8">
        <Breadcrumbs
          items={[
            { label: "Loudoun", to: "/dashboards/$body", params: { body: "loudoun" } },
            { label: "LCPS", to: "/dashboards/$body", params: { body: "loudoun" }, hash: "loudoun-county-public-schools" },
            { label: crumb },
          ]}
        />
        <p className="mt-6 font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase sm:text-base">{kicker}</p>
        <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">
          Loudoun County <span className="text-gold">Public Schools</span>
        </h1>
      </div>
    </section>
  );
}

export function Pager({ page, pages, onGo }: { page: number; pages: number; onGo: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pages" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <span className="mr-1 font-serif text-sm tracking-[0.14em] text-night-muted uppercase">Pages:</span>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onGo(p)}
          aria-current={p === page ? "page" : undefined}
          className={`inline-flex size-11 items-center justify-center rounded-lg border font-serif text-lg ${p === page ? "border-gold bg-gold text-navy-800" : "border-navy-line text-on-dark-muted hover:border-gold"}`}
        >
          {p}
        </button>
      ))}
    </nav>
  );
}

export function FoiaLcps() {
  return (
    <a href="https://www.lcps.org/foia" target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-navy-line border-l-4 border-l-flag bg-[#1b1a2e] px-4 py-2 hover:border-gold">
      <Mail className="size-5 text-gold" aria-hidden />
      <span>
        <span className="block font-semibold">FOIA to LCPS</span>
        <span className="block font-mono text-xs text-night-muted">www.lcps.org/foia</span>
      </span>
      <ExternalLink className="size-4 text-gold" aria-hidden />
    </a>
  );
}

export function V4Main({ children }: { children: ReactNode }) {
  return (
    <main className="agx-dark flex-1 bg-navy-800 text-white" style={DARK_VARS}>
      {children}
    </main>
  );
}
