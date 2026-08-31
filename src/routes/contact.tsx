import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { Kicker } from "@/components/site/kicker";
import { SITE } from "@/content/site";

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Kicker>The desk</Kicker>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">Contact</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Tips, documents, and corrections. Until there is an email, the door is X.
        </p>
        <p className="mt-8 text-sm">
          <a href={SITE.xUrl} className="hover:underline" target="_blank" rel="noreferrer">
            {SITE.handle} on X
          </a>
        </p>
      </main>
    </SiteShell>
  );
}
