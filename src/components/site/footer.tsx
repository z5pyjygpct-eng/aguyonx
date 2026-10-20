import { Link } from "@tanstack/react-router";
import { SITE } from "@/content/site";
import { DASHBOARDS } from "@/lib/dashboards";

const COLS = [
  {
    h: "Desk",
    items: [
      { to: "/articles", label: "Articles" },
      { to: "/news", label: "News" },
      { to: "/nova-briefing", label: "NoVA Briefing" },
      { to: "/videos", label: "Videos" },
      { to: "/investigations", label: "Investigations" },
    ],
  },
  {
    h: "Virginia",
    items: [
      { to: "/delegates", label: "Delegates" },
      { to: "/senators", label: "Senators" },
      { to: "/dashboards/general-assembly", label: "General Assembly" },
      { to: "/library", label: "Library" },
      { to: "/2027", label: "2027 election" },
    ],
  },
  {
    h: "About",
    items: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/library/foia", label: "FOIA letter desk" },
      { to: "/tips", label: "Got Tips?" },
    ],
  },
] as const;

export function SiteFooter({ location = SITE.location }: { location?: string } = {}) {
  return (
    <footer className="agx-dark mt-auto border-t-4 border-gold bg-navy-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
          <div>
            <p className="font-serif text-2xl font-bold tracking-wide">A GUY ON <span className="text-gold">X</span></p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-on-dark-muted">
              Independent investigative research in {location}. A publication of {SITE.firm}. Not a
              government site. Not a newsroom.
            </p>
            <a href={SITE.xUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center rounded-full border border-on-dark-muted px-4 text-sm font-semibold hover:border-gold">
              𝕏 Follow {SITE.handle}
            </a>
          </div>
          <div>
            <p className="font-serif text-sm font-semibold tracking-[0.14em] text-gold uppercase">Dashboards</p>
            <ul className="mt-3 space-y-1">
              {DASHBOARDS.map((d) => (
                <li key={d.slug}>
                  <Link to="/dashboards/$body" params={{ body: d.slug }} className="inline-flex min-h-8 items-center text-sm text-on-dark-muted hover:text-white">
                    {d.short}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {COLS.map((c) => (
            <div key={c.h}>
              <p className="font-serif text-sm font-semibold tracking-[0.14em] text-gold uppercase">{c.h}</p>
              <ul className="mt-3 space-y-1">
                {c.items.map((i) => (
                  <li key={i.to}>
                    <Link to={i.to} className="inline-flex min-h-8 items-center text-sm text-on-dark-muted hover:text-white">
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-navy-line pt-6 text-xs text-night-muted sm:flex-row sm:justify-between">
          <p className="max-w-2xl">
            <span className="block text-[11px] font-semibold tracking-wide text-gold">a guy on X</span>
            {SITE.credit} Citations are to public records and public media. Sample datasets on this
            site demonstrate method; they are labeled as such.
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <Link to="/how-to" className="underline hover:text-white">How to use this site</Link>
            <Link to="/sitemap" className="underline hover:text-white">Site map</Link>
            <a href={SITE.giveUrl} target="_blank" rel="noreferrer" className="text-gold underline">{SITE.giveLabel}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
