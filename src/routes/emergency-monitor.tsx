import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { LegacyHero, LegacyV4 } from "@/components/site/legacy-v4";

const DOC_URL = "https://docs.google.com/document/d/1rRD6PaLrABUG02-W7uqXAdJeTnuabiI_QOqsTLI7Op0/edit";
const PUB_URL = "https://docs.google.com/document/d/1rRD6PaLrABUG02-W7uqXAdJeTnuabiI_QOqsTLI7Op0/pub?embedded=true";

export const Route = createFileRoute("/emergency-monitor")({
  head: () => ({ meta: [{ title: "Emergency Monitor – Live Log | aguyonx.com" }] }),
  component: EmergencyMonitorPage,
});

function EmergencyMonitorPage() {
  return (
    <SiteShell>
      <LegacyV4>
        <LegacyHero trail={[{ label: "Emergency Monitor" }]} kicker="Live log" title="Emergency Monitor – Live Log" width="max-w-5xl">
          <p className="max-w-xl text-lg">This is a live log, updated about every 2 hours.</p>
        </LegacyHero>
        <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
          <p>
            <a
              href={DOC_URL}
              className="inline-flex min-h-11 items-center rounded-md bg-gold px-5 text-sm font-semibold text-navy-900 hover:bg-gold-hover"
              target="_blank"
              rel="noreferrer"
            >
              Open the full document ↗
            </a>
          </p>
          <div className="relative mt-6 overflow-hidden rounded-xl border border-navy-line bg-white">
            <p className="absolute inset-x-0 top-0 p-6 text-center text-sm text-navy-900">
              Loading the live log… If it doesn't show, it isn't published yet — use Open the full document.
            </p>
            <iframe
              src={PUB_URL}
              title="Emergency Monitor – Live Log"
              loading="lazy"
              className="relative block h-[75vh] min-h-[480px] w-full"
            />
          </div>
          <p className="mt-3 text-sm text-on-dark-muted">
            If the log doesn't show, it isn't published yet — use{" "}
            <a href={DOC_URL} target="_blank" rel="noreferrer" className="font-semibold text-gold underline">Open the full document</a>.
          </p>
        </div>
      </LegacyV4>
    </SiteShell>
  );
}
