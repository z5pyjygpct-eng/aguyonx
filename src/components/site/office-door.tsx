import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { Kicker } from "@/components/site/kicker";
import { Button } from "@/components/ui/button";
import { OFFICE_DOORS, type OfficeDoor } from "@/content/offices";

export function OfficeDoorPage({ office }: { office: OfficeDoor }) {
  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Kicker>Virginia</Kicker>
        <p className="mt-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
          {office.chamber}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          {office.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{office.dek}</p>
        <p className="mt-6 leading-relaxed">
          No roster. No score. The public site is taste. Commissioned files stay with the desk until
          someone asks for one.
        </p>
        <Button asChild className="mt-8">
          <Link to="/contact">Contact</Link>
        </Button>
        <div className="mt-16 border-t border-border pt-10">
          <Kicker>Also in Virginia</Kicker>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {OFFICE_DOORS.filter((o) => o.to !== office.to).map((o) => (
              <li key={o.to}>
                <Link
                  to={o.to}
                  className="block border border-border px-5 py-4 transition-[background-color] duration-150 hover:bg-wash"
                >
                  <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                    {o.chamber}
                  </p>
                  <p className="mt-1 font-serif text-xl font-medium">{o.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </SiteShell>
  );
}
