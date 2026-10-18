import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { LegacyHero, LegacyV4 } from "@/components/site/legacy-v4";
import { SITE } from "@/content/site";

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  return (
    <SiteShell>
      <LegacyV4>
        <LegacyHero kicker="The desk" title="Contact" width="max-w-3xl">
          <p className="max-w-xl text-lg">Tips, documents, and corrections. Until there is an email, the door is X.</p>
        </LegacyHero>
        <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-12">
          <p>
            <a
              href={SITE.xUrl}
              className="inline-flex min-h-11 items-center rounded-md bg-gold px-5 text-sm font-semibold text-navy-900 hover:bg-gold-hover"
              target="_blank"
              rel="noreferrer"
            >
              {SITE.handle} on X
            </a>
          </p>
          <p className="mt-10 max-w-xl rounded-xl border border-navy-line border-l-4 border-l-gold bg-navy-700 px-5 py-4 text-sm leading-relaxed text-[#F6F3EA]">
            To help expand the free public shelves — Find the Moment, News, Investigations —{" "}
            <a href={SITE.giveUrl} className="font-semibold text-gold underline underline-offset-2 hover:text-gold-hover" target="_blank" rel="noreferrer">
              {SITE.giveLabel}
            </a>
            .
          </p>
        </div>
      </LegacyV4>
    </SiteShell>
  );
}
