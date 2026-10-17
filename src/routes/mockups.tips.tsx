import { useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clapperboard, DollarSign, FileSearch, Landmark, Mail, PencilLine, Lock } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
import { V4VenueHero } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";

/** Got Tips? design mockup (preview only). /tips stays the Coming-soon placeholder until Scott approves this. */
export const Route = createFileRoute("/mockups/tips")({
  head: () => ({ meta: [{ title: "Mockup: Got Tips? · A Guy on X" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

const TIPS_EMAIL = "scottmineo@mail.grokbot.com"; // approved by Scott, Oct 17 2026

// Each location on the site (v4-venues.ts) and its dashboard path, for the Find the Moment / Meeting Recaps links.
const BASE: Record<keyof typeof V4_VENUES, string> = {
  "loudoun-bos": "/dashboards/loudoun/bos", "loudoun-lcps": "/dashboards/loudoun/schools",
  "albemarle-bos": "/dashboards/albemarle/bos", "albemarle-schools": "/dashboards/albemarle/schools",
  "fairfax-city-council": "/dashboards/fairfax-city/council", "fairfax-city-schools": "/dashboards/fairfax-city/schools",
  "manassas-council": "/dashboards/manassas/council", "manassas-schools": "/dashboards/manassas/schools",
  "va-house": "/dashboards/house", "va-senate": "/dashboards/senate", "va-boe": "/dashboards/board-of-education",
};
const LOCATIONS = (Object.keys(BASE) as (keyof typeof V4_VENUES)[]).map((k) => ({ key: k, name: `${V4_VENUES[k].titleA} ${V4_VENUES[k].titleB}`, base: BASE[k] }));

const LOOKING_FOR: { icon: typeof Mail; title: string; text: string }[] = [
  { icon: Clapperboard, title: "Meeting moments worth clipping", text: "Did someone say something at a meeting that more people should hear? Tell us which meeting and about when it happened." },
  { icon: DollarSign, title: "Budget or spending questions", text: "See a number that looks odd, or wonder where the money for something went? Ask. We'll dig into the budget papers." },
  { icon: Landmark, title: "School board and county decisions", text: "A vote coming up, a rule that changed, a decision that surprised you. Point us to it." },
  { icon: FileSearch, title: "Public records and FOIA leads", text: "Know of a public record that would help explain something? Tell us what it is and who keeps it." },
  { icon: PencilLine, title: "Corrections to our pages", text: "Did we get something wrong? Please tell us. We'd rather fix it than leave it up." },
];

const PRIVACY = [
  "You don't have to give us your name to send a tip.",
  "Only share what you're comfortable sharing.",
  "We check a tip before we use it. A tip by itself is never the whole story.",
  "Email isn't secret. Please don't send anything you aren't allowed to share.",
];
const NEXT = [
  ["We read it", "A real person reads every tip."],
  ["We check it", "We look at the meeting video, the budget papers and other public records."],
  ["We use what holds up", "A good tip might become a clip, a meeting recap note or a fix to one of our pages."],
  ["We may write back", "If you left a way to reach you, we may ask a follow-up question."],
] as const;

const card = "rounded-[10px] border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-6";
const lab = "font-mono text-xs tracking-widest text-gold uppercase";
const input = "mt-1 block w-full rounded-md border border-navy-line bg-navy-800 px-3 py-2.5 text-base text-white placeholder:text-night-muted disabled:cursor-not-allowed disabled:opacity-70";

function Placeholder() {
  return <span className="ml-2 inline-block rounded bg-flag px-1.5 py-0.5 align-middle font-mono text-[10px] font-bold tracking-wider text-white uppercase">Placeholder</span>;
}
function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>{hint ? <span className="ml-2 text-xs text-night-muted">{hint}</span> : null}
      {children}
    </label>
  );
}

function MockForm() {
  const [loc, setLoc] = useState("");
  return (
    // No action, no handler that sends anything: this form cannot submit.
    <form noValidate onSubmit={(e) => e.preventDefault()} aria-describedby="tips-mock-note" className={card}>
      <p className={lab}>Tip form · mockup</p>
      <h3 className="mt-1 font-serif text-2xl font-semibold uppercase">Someday: a tip form</h3>
      <p id="tips-mock-note" className="mt-2 rounded-md border border-gold/60 bg-gold/10 px-3 py-2 text-sm font-semibold text-gold">Mockup — nothing is collected or sent. Please use the email above.</p>
      <div className="mt-4 space-y-4">
        <Field label="Which place is this about?">
          <select value={loc} onChange={(e) => setLoc(e.target.value)} className={input}>
            <option value="">Choose a location…</option>
            {LOCATIONS.map((l) => <option key={l.key} value={l.key}>{l.name}</option>)}
            <option value="other">Somewhere else in Virginia</option>
          </select>
        </Field>
        <fieldset disabled className="space-y-4">
          <Field label="What's it about?">
            <select className={input} defaultValue="">
              <option value="">Choose a topic…</option>
              {LOOKING_FOR.map((x) => <option key={x.title}>{x.title}</option>)}
              <option>Something else</option>
            </select>
          </Field>
          <Field label="Tell us what you know"><textarea rows={4} className={input} placeholder="What happened, when, and where you saw it." /></Field>
          <Field label="A link or a file" hint="optional">
            <input type="url" className={input} placeholder="https://…" />
            <input type="file" className={`${input} mt-2 file:mr-3 file:rounded file:border-0 file:bg-navy-600 file:px-3 file:py-1 file:text-white`} />
          </Field>
          <Field label="How can we reach you?" hint="optional"><input type="text" className={input} placeholder="Only if you want us to write back" /></Field>
        </fieldset>
        <button type="submit" disabled className="inline-flex h-12 cursor-not-allowed items-center rounded-md bg-on-dark-muted px-6 font-serif text-lg font-bold tracking-[0.14em] text-navy-800 uppercase">Mockup</button>
      </div>
    </form>
  );
}

function Page() {
  return (
    <SiteShell>
      <V4Main>
        <V4VenueHero venue={{ crumbs: [{ label: "Mockups" }], titleA: "Got", titleB: "Tips?", foia: V4_VENUES["loudoun-bos"].foia }} kicker="Tips" />
        <div role="status" className="bg-gold text-navy-900"><p className="mx-auto max-w-7xl px-4 py-3 text-center font-serif text-lg font-bold tracking-[0.14em] uppercase sm:px-8">Preview mockup — the form below is not real</p></div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
          <section className="rounded-[10px] border border-navy-line border-l-4 border-l-gold bg-navy-700 p-6 sm:p-8">
            <p className={lab}>Got Tips?</p>
            <p className="mt-2 max-w-3xl font-serif text-3xl font-bold text-white sm:text-4xl">Help us find out what's happening in your local government.</p>
            <p className="mt-3 max-w-3xl text-base text-[#F6F3EA]">You go to the meetings, read the mail from school and pay the tax bill. If something caught your eye, we'd like to hear about it.</p>
          </section>

          <section className="mt-8">
            <h2 className="font-serif text-3xl font-semibold uppercase">What we're looking for</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {LOOKING_FOR.map(({ icon: Icon, title, text }) => (
                <section key={title} className="rounded-[10px] border border-navy-line border-l-4 border-l-gold bg-navy-700 p-5">
                  <Icon className="size-7 text-gold" aria-hidden />
                  <h3 className="mt-2 font-serif text-xl font-semibold tracking-wide text-gold uppercase">{title}</h3>
                  <p className="mt-2 text-base leading-snug text-[#F6F3EA]">{text}</p>
                </section>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-serif text-3xl font-semibold uppercase">How to send a tip</h2>
            <div className="mt-4 grid gap-5 lg:grid-cols-2">
              <div className="space-y-5">
                <a href={`mailto:${TIPS_EMAIL}`} className="block rounded-[10px] border border-navy-line border-l-4 border-l-gold bg-navy-700 p-6 hover:border-gold sm:p-8">
                  <p className={lab}>The best way</p>
                  <p className="mt-2 flex items-center gap-3 font-serif text-2xl font-bold text-white sm:text-3xl"><Mail className="size-8 shrink-0 text-gold" aria-hidden />Email tips to</p>
                  <p className="mt-1 font-mono text-lg font-semibold text-gold underline underline-offset-4 [overflow-wrap:anywhere] sm:text-2xl">{TIPS_EMAIL}</p>
                  <p className="mt-3 text-sm text-night-muted">Tell us the place, what happened and when. Add a link or a photo if you have one.</p>
                </a>
                <section className={card}>
                  <h3 className="flex items-center font-serif text-2xl font-semibold uppercase"><Lock className="mr-2 size-6 text-gold" aria-hidden />Your privacy<Placeholder /></h3>
                  <p className="mt-1 text-xs text-night-muted">Draft wording for Scott to approve. Not a legal promise.</p>
                  <ul className="mt-3 space-y-2 text-base text-[#F6F3EA]">
                    {PRIVACY.map((p) => <li key={p} className="flex gap-2"><span className="text-gold">•</span><span>{p}</span></li>)}
                  </ul>
                </section>
              </div>
              <MockForm />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-serif text-3xl font-semibold uppercase">What happens next<Placeholder /></h2>
            <p className="mt-1 text-xs text-night-muted">Draft steps for Scott to approve.</p>
            <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {NEXT.map(([t, d], i) => (
                <li key={t} className="rounded-[10px] border border-navy-line border-l-4 border-l-gold bg-navy-700 p-4">
                  <p className="font-mono text-xs text-gold">STEP {i + 1}</p>
                  <p className="font-serif text-xl font-semibold uppercase">{t}</p>
                  <p className="text-sm text-night-muted">{d}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-10">
            <h2 className="font-serif text-3xl font-semibold uppercase">See what we already cover</h2>
            <p className="mt-1 text-sm text-night-muted">Find the Moment jumps to the spot in a meeting video. Meeting Recaps sum up each meeting.</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {LOCATIONS.map((l) => (
                <li key={l.key} className="rounded-[10px] border border-navy-line bg-navy-700 px-4 py-3">
                  <p className="font-semibold">{l.name}</p>
                  <p className="mt-1 text-sm">
                    <Link to={`${l.base}/find-the-moment` as never} className="text-gold hover:underline">Find the Moment</Link>
                    <span className="mx-2 text-night-muted">·</span>
                    <Link to={`${l.base}/recaps` as never} className="text-gold hover:underline">Meeting Recaps</Link>
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </V4Main>
    </SiteShell>
  );
}
