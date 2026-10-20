import type { ReactNode } from "react";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

/** Simple v4 text page: hero with breadcrumbs, optional draft banner, readable column. */
export function DocPage({ crumb, titleA, titleB, dek, draft, children }: { crumb: string; titleA: string; titleB?: string; dek?: string; draft?: boolean; children: ReactNode }) {
  return (
    <SiteShell>
      <V4Main>
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8">
            <Breadcrumbs items={[{ label: crumb }]} />
            <h1 className="mt-6 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">{titleA} {titleB ? <span className="text-gold">{titleB}</span> : null}</h1>
            {dek ? <p className="mt-4 max-w-2xl text-lg text-on-dark-muted">{dek}</p> : null}
          </div>
        </section>
        {draft ? <div role="status" className="bg-gold text-navy-900"><p className="mx-auto max-w-7xl px-4 py-3 text-center font-serif text-lg font-bold tracking-[0.14em] uppercase sm:px-8">Draft for Scott’s review</p></div> : null}
        <div className="doc-v4 mx-auto max-w-3xl space-y-6 px-4 py-8 text-on-dark-muted sm:px-8 [&_a]:text-gold [&_a]:underline [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:uppercase [&_li]:ml-5 [&_li]:list-disc [&_li]:mt-1">{children}</div>
      </V4Main>
    </SiteShell>
  );
}

export function OpenQuestions({ items }: { items: string[] }) {
  return (
    <aside className="rounded-xl border border-gold/60 bg-gold/10 p-5">
      <p className="font-mono text-xs tracking-widest text-gold uppercase">Open questions for Scott</p>
      <ul className="mt-2 text-sm">{items.map((q) => <li key={q}>{q}</li>)}</ul>
    </aside>
  );
}
