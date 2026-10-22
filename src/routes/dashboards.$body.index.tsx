import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { DashboardTemplate } from "@/components/site/dashboard-template";
import { DASHBOARD_BY_SLUG } from "@/lib/dashboards";

export const Route = createFileRoute("/dashboards/$body/")({
  head: ({ params }) => ({
    meta: [{ title: `${DASHBOARD_BY_SLUG[params.body]?.title ?? "Dashboard"} Dashboard · A Guy on X` }],
  }),
  component: Page,
});

function Page() {
  const { body } = Route.useParams();
  const d = DASHBOARD_BY_SLUG[body];
  return (
    <SiteShell>
      {d ? (
        <DashboardTemplate d={d} />
      ) : (
        <main className="mx-auto max-w-3xl flex-1 px-6 py-20">
          <h1 className="font-serif text-4xl font-bold uppercase">Dashboard not found</h1>
          <Link to="/" className="mt-6 inline-block text-forest underline">Back home</Link>
        </main>
      )}
    </SiteShell>
  );
}
