import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
import { GA_PREVIEW_ROBOTS } from "@/lib/ga-dashboard";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

/** VA Violent Crime Outcomes: Other Resources landing page. Context text drawn only from
 * https://x.com/VA4SafeComm/status/2113359113971474555 (Oct 22 2026). No statistics added. */
export const Route = createFileRoute("/va-violent-crime-outcomes")({
  head: () => ({ meta: [{ title: "VA Violent Crime Outcomes · A Guy on X" }, { name: "description", content: "A searchable look at what happens to violent crime cases in Virginia, built by Virginians for Safe Communities (VSC)." }, ...GA_PREVIEW_ROBOTS] }),
  component: VCrimePage,
});

const VSC_X = "https://x.com/VA4SafeComm";
const POST = "https://x.com/VA4SafeComm/status/2113359113971474555";
const SITE_URL = "https://va-violent-crime-outcomes2010-2026.netlify.app";

function XEmbed() {
  useEffect(() => {
    const w = window as unknown as { twttr?: { widgets?: { load: () => void } } };
    if (w.twttr?.widgets) { w.twttr.widgets.load(); return; }
    if (!document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
      const s = document.createElement("script");
      s.src = "https://platform.twitter.com/widgets.js"; s.async = true; s.charset = "utf-8";
      document.body.appendChild(s);
    }
  }, []);
  return (
    <div className="mx-auto w-full max-w-[550px]">
      <blockquote className="twitter-tweet" data-theme="dark" data-dnt="true">
        <p lang="en" dir="ltr">What happens to Virginia's Violent Criminals? Find any case, every outcome for murder, rape, robbery etc in every county (except Fairfax = only murder)</p>
        &mdash; Virginians for Safe Communities (VSC) (@VA4SafeComm) <a href={POST}>October 22, 2026</a>
      </blockquote>
    </div>
  );
}

function VCrimePage() {
  return (
    <SiteShell>
      <V4Main>
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-8">
            <Breadcrumbs items={[{ label: "Other Resources", to: "/library" }, { label: "VA Violent Crime Outcomes" }]} />
          </div>
          <div className="mx-auto max-w-7xl px-5 pt-6 pb-12 sm:px-8">
            <p className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">Other Resources</p>
            <h1 className="mt-2 font-serif text-5xl font-bold uppercase leading-[1.05] sm:text-6xl">VA Violent Crime <span className="text-gold">Outcomes</span></h1>
            <p className="mt-5 text-base text-[#F6F3EA]">Credit: <a href={VSC_X} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold underline underline-offset-4">Virginians for Safe Communities (VSC)</a></p>
            <p className="mt-2"><a href={VSC_X} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-gold hover:underline">Follow @VA4SafeComm on X <ExternalLink className="size-4" aria-hidden /></a></p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
          <section aria-labelledby="about-tool" className="space-y-4 text-lg leading-relaxed text-[#F6F3EA]">
            <h2 id="about-tool" className="font-serif text-3xl font-semibold uppercase text-white">What happens to violent criminals in Virginia?</h2>
            <p>A friend of mine built this, and I think you'll want to bookmark it. It's a new search tool from Virginians for Safe Communities that lets you look up violent crime cases across Virginia and see how they ended.</p>
            <p>In VSC's words, you can "find any case, every outcome for murder, rape, robbery etc in every county (except Fairfax = only murder)." You can search by name, county, offense and outcome, and see the trends.</p>
            <p>Their goal is simple: "Hold Va Prosecutors &amp; Judges Accountable!" Watch their short walkthrough below, then give it a try.</p>
          </section>

          <section aria-label="VSC video on X" className="mt-10"><XEmbed /></section>

          <div className="mt-10 text-center">
            <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-xl bg-gold px-7 py-4 font-serif text-xl font-bold uppercase text-navy-900 shadow-lg transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-2xl">
              Search VA Violent Crime Outcomes <ArrowRight className="size-6" aria-hidden />
            </a>
            <p className="mt-3 text-sm text-on-dark-muted [overflow-wrap:anywhere]">Opens va-violent-crime-outcomes2010-2026.netlify.app in a new tab. Built and run by VSC, not by this site.</p>
          </div>
        </div>
      </V4Main>
    </SiteShell>
  );
}
