import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { ArrowRight } from "lucide-react";
import { LEGACY_TILE, LegacyHero, LegacyV4 } from "@/components/site/legacy-v4";
import { DASHBOARDS, type Dashboard } from "@/lib/dashboards";

const DESC = "Every live A Guy on X dashboard: Virginia local governments, school boards and state bodies.";

export const Route = createFileRoute("/dashboards/")({
  head: () => ({
    meta: [
      { title: "Dashboards · A Guy on X" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Dashboards · A Guy on X" },
      { property: "og:description", content: DESC },
    ],
  }),
  component: DashboardsIndex,
});

// Built from DASHBOARDS, the same list /dashboards/$body uses, so only bodies
// that actually render appear here and new ones show up when added.
function line(d: Dashboard) {
  return d.columns.map((c) => c.name).join(" · ");
}

function Group({ label, items }: { label: string; items: Dashboard[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="font-mono text-xs font-bold tracking-widest text-gold uppercase">{label}</h2>
      <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((d) => (
          <li key={d.slug}>
            <Link to="/dashboards/$body" params={{ body: d.slug }} className={LEGACY_TILE}>
              <ArrowRight className="absolute top-4 right-4 size-5 text-gold transition-transform group-hover:translate-x-0.5" aria-hidden />
              <p className="inline-flex w-fit items-center rounded bg-gold px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-widest text-navy-900 uppercase">Live</p>
              <p className="mt-2 font-serif text-2xl font-bold uppercase leading-tight">{d.title}</p>
              <p className="mt-2 text-sm text-on-dark-muted">{line(d)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DashboardsIndex() {
  return (
    <SiteShell>
      <LegacyV4>
        <LegacyHero
          trail={[{ label: "Dashboards" }]}
          kicker={<><p>Virginia</p><p className="mt-2 font-mono text-xs tracking-widest">Meetings · public record</p></>}
          title="Dashboards"
        >
          <p className="text-lg">Pick a dashboard to see its meetings, recaps, members and records.</p>
        </LegacyHero>
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 sm:py-12">
          <Group label="Local" items={DASHBOARDS.filter((d) => d.group === "local")} />
          <Group label="State" items={DASHBOARDS.filter((d) => d.group === "state")} />
        </div>
      </LegacyV4>
    </SiteShell>
  );
}
