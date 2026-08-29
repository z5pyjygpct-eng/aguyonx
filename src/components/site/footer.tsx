import { Link } from "@tanstack/react-router";
import { SITE } from "@/content/site";
import { Separator } from "@/components/ui/separator";
import { NAV } from "@/components/site/header";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-wash">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-serif text-xl font-medium">{SITE.name}</p>
            <p className="mt-1 font-mono text-xs tracking-widest text-muted-foreground uppercase">
              {SITE.domain}
            </p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Independent investigative research and political intelligence in {SITE.location}. Not
              a government site. Not a newsroom.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Desk</p>
            <ul className="mt-3 space-y-2">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Field notes
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href={SITE.xUrl} className="hover:underline" rel="noreferrer" target="_blank">
                  {SITE.handle} on X
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="hover:underline">
                  {SITE.email}
                </a>
              </li>
              <li className="text-muted-foreground">{SITE.author}</li>
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <p className="font-mono text-xs tracking-wide text-muted-foreground">
          Independent research. Citations are to public records and public media. Sample datasets
          on this site demonstrate method; they are labeled as such.
        </p>
      </div>
    </footer>
  );
}
