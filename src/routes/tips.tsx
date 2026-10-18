import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clapperboard, DollarSign, FileSearch, Landmark, Lock, Mail, MapPin, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
import { GA_PREVIEW_ROBOTS } from "@/lib/ga-dashboard";
import { V4_VENUES } from "@/lib/v4-venues";

/**
 * Got Tips? (preview, noindex). No form and no backend: every button is a plain mailto link that opens the
 * visitor's own email app with a subject and a short fill-in template. The site collects nothing.
 * Privacy + "What happens next" wording is DRAFT for Scott's review. /mockups/tips is the earlier mockup (unchanged).
 */
export const Route = createFileRoute("/tips")({
  head: () => ({ meta: [{ title: "Got Tips? · A Guy on X" }, ...GA_PREVIEW_ROBOTS] }),
  component: TipsPage,
});

const TIPS_EMAIL = "scottmineo@mail.grokbot.com"; // approved by Scott, Oct 17 2026

/** mailto with a subject and a Place / What happened / When / Link template (CRLF line breaks, fully URL-encoded). */
function tipMailto(subject: string, place = "") {
  const body = [`Place: ${place}`, "What happened: ", "When: ", "Link (if you have one): ", "", ""].join("\r\n");
  return `mailto:${TIPS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const TOPICS: { icon: typeof Mail; title: string; subject: string; text: string }[] = [
  { icon: Clapperboard, title: "A meeting moment", subject: "Tip: meeting moment", text: "Someone said something at a meeting that more people should hear? Tell me which meeting and about when." },
  { icon: DollarSign, title: "Money and budgets", subject: "Tip: budget or spending", text: "A number looks odd, or you wonder where the money went? Ask me. I'll dig into the budget papers." },
  { icon: Landmark, title: "A vote or decision", subject: "Tip: vote or decision", text: "A vote coming up, a rule that changed, or a decision that surprised you. Point me to it." },
  { icon: FileSearch, title: "A public record", subject: "Tip: public record", text: "Know a public paper that would help explain something? Tell me what it is and who keeps it." },
  { icon: Sparkles, title: "Something else", subject: "Tip", text: "Doesn't fit a box? That's fine. Just tell me what you saw." },
];

const BASE: Record<keyof typeof V4_VENUES, string> = {
  "loudoun-bos": "/dashboards/loudoun/bos", "loudoun-lcps": "/dashboards/loudoun/schools",
  "albemarle-bos": "/dashboards/albemarle/bos", "albemarle-schools": "/dashboards/albemarle/schools",
  "fairfax-city-council": "/dashboards/fairfax-city/council", "fairfax-city-schools": "/dashboards/fairfax-city/schools",
  "manassas-council": "/dashboards/manassas/council", "manassas-schools": "/dashboards/manassas/schools",
  "va-house": "/dashboards/house", "va-senate": "/dashboards/senate", "va-boe": "/dashboards/board-of-education",
};
const PLACES = (Object.keys(BASE) as (keyof typeof V4_VENUES)[]).map((k) => ({
  key: k, a: V4_VENUES[k].titleA, b: V4_VENUES[k].titleB, name: `${V4_VENUES[k].titleA} ${V4_VENUES[k].titleB}`, base: BASE[k],
}));

// DRAFT wording for Scott's review. Not legal promises.
const PRIVACY = [
  "You don't have to give your name to send a tip.",
  "Only share what you're comfortable sharing.",
  "Email isn't secret. It can be seen, saved or forwarded along the way, so please don't send anything you aren't allowed to share.",
  "I check a tip before I use it. A tip by itself is never the whole story.",
];
const NEXT = [
  ["I read it", "A real person reads every tip."],
  ["I check it", "I look at the meeting video, the budget papers and other public records."],
  ["I use what holds up", "A good tip might become a clip or a note in a meeting recap."],
  ["I may write back", "If I have a question, I may reply to your email."],
] as const;

const tile = "group relative rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 pr-12 text-white transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800";
const lab = "font-mono text-xs tracking-widest text-gold uppercase";
const h2 = "font-serif text-3xl font-semibold uppercase";

function Arrow() {
  return <ArrowRight className="absolute top-4 right-4 size-5 text-gold transition-transform group-hover:translate-x-0.5" aria-hidden />;
}
function Draft() {
  return <span className="ml-2 inline-block rounded bg-flag px-1.5 py-0.5 align-middle font-mono text-[10px] font-bold tracking-wider text-white uppercase">Draft</span>;
}

function TipsPage() {
  return (
    <SiteShell>
      <V4Main>
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto grid max-w-7xl gap-8 px-5 pt-10 pb-12 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div>
              <p className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">VA Change Agent</p>
              <h1 className="mt-2 font-serif text-5xl font-bold uppercase leading-[1.05] sm:text-6xl">Got <span className="text-gold">Tips?</span></h1>
              <p className="mt-4 max-w-xl font-serif text-2xl font-semibold leading-snug sm:text-3xl">Help me find out what's happening in your local government.</p>
              <p className="mt-3 max-w-xl text-base text-[#F6F3EA]">You go to the meetings, read the notes from school and pay the tax bill. If something caught your eye, I'd like to hear about it.</p>
            </div>
            <a href={tipMailto("Tip")} className={`${tile} block p-6 pr-14 sm:p-7 sm:pr-16`}>
              <Arrow />
              <p className={lab}>Send a tip</p>
              <p className="mt-2 flex items-center gap-3 font-serif text-2xl font-bold uppercase sm:text-3xl"><Mail className="size-7 shrink-0 text-gold" aria-hidden />Email me</p>
              <p className="mt-1 font-mono text-base font-semibold text-gold underline underline-offset-4 [overflow-wrap:anywhere] sm:text-lg">{TIPS_EMAIL}</p>
              <p className="mt-3 text-sm text-on-dark-muted">Tell me the place, what happened and when. A link or photo helps.</p>
            </a>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
          <p className="rounded-md border border-gold/50 bg-gold/10 px-4 py-3 text-sm text-[#F6F3EA]">
            <span className="font-semibold text-gold">How these buttons work:</span> each one just opens your own email app with a short note started for you. This website doesn't collect or save anything. You can change or delete anything before you hit send.
          </p>

          <section className="mt-10" aria-labelledby="by-topic">
            <h2 id="by-topic" className={h2}>What's your tip about?</h2>
            <p className="mt-1 text-sm text-on-dark-muted">Tap the one that fits. Not sure? Pick "Something else."</p>
            {/* 5 tiles: 2+2+1(full) on tablet, 3+2 centered on desktop (6-col grid, each tile spans 2). */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {TOPICS.map(({ icon: Icon, title, subject, text }, i) => (
                <a key={title} href={tipMailto(subject)} className={`${tile} flex flex-col lg:col-span-2 ${i === 3 ? "lg:col-start-2" : ""} ${i === 4 ? "sm:col-span-2" : ""}`}>
                  <Arrow />
                  <Icon className="size-7 text-gold" aria-hidden />
                  <span className="mt-2 font-serif text-2xl font-bold uppercase leading-tight">{title}</span>
                  <span className="mt-2 text-base leading-snug text-on-dark-muted">{text}</span>
                </a>
              ))}
            </div>
          </section>

          <section className="mt-12" aria-labelledby="by-place">
            <h2 id="by-place" className={h2}>Or pick the place</h2>
            <p className="mt-1 text-sm text-on-dark-muted">These are the places the site covers today. The place is filled in for you.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PLACES.map((p) => (
                <a key={p.key} href={tipMailto(`Tip: ${p.name}`, p.name)} className={`${tile} flex items-start gap-3 py-4`}>
                  <Arrow />
                  <MapPin className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
                  <span className="leading-tight"><span className="block text-sm text-on-dark-muted">{p.a}</span><span className="block font-serif text-xl font-bold uppercase">{p.b}</span></span>
                </a>
              ))}
              <a href={tipMailto("Tip: somewhere else in Virginia")} className={`${tile} flex items-start gap-3 py-4`}>
                <Arrow />
                <MapPin className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
                <span className="leading-tight"><span className="block text-sm text-on-dark-muted">Not listed?</span><span className="block font-serif text-xl font-bold uppercase">Somewhere else in Virginia</span></span>
              </a>
            </div>
          </section>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <section className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-6" aria-labelledby="privacy">
              <h2 id="privacy" className="flex flex-wrap items-center font-serif text-2xl font-semibold uppercase"><Lock className="mr-2 size-6 text-gold" aria-hidden />Your privacy<Draft /></h2>
              <p className="mt-1 text-xs text-on-dark-muted">Draft wording for Scott to review. Not a legal promise.</p>
              <ul className="mt-3 space-y-2 text-base text-[#F6F3EA]">
                {PRIVACY.map((p) => <li key={p} className="flex gap-2"><span className="text-gold">•</span><span>{p}</span></li>)}
              </ul>
            </section>
            <section className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-6" aria-labelledby="next">
              <h2 id="next" className="font-serif text-2xl font-semibold uppercase">What happens next<Draft /></h2>
              <p className="mt-1 text-xs text-on-dark-muted">Draft steps for Scott to review.</p>
              <ol className="mt-3 space-y-3">
                {NEXT.map(([t, d], i) => (
                  <li key={t} className="flex gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold font-serif text-lg font-bold text-navy-900">{i + 1}</span>
                    <span><span className="block font-serif text-lg font-semibold uppercase">{t}</span><span className="block text-sm text-on-dark-muted">{d}</span></span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <section className="mt-12" aria-labelledby="cover">
            <h2 id="cover" className={h2}>Check what's already here</h2>
            <p className="mt-1 text-sm text-on-dark-muted">Find the Moment jumps to the right spot in a meeting video. Meeting Recaps sum up each meeting. It's a good way to find the exact time to put in your tip.</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PLACES.map((p) => (
                <li key={p.key} className="rounded-xl border border-navy-line bg-navy-700 px-4 py-3">
                  <p className="font-semibold">{p.name}</p>
                  <p className="mt-1 text-sm">
                    <Link to={`${p.base}/find-the-moment` as never} className="text-gold hover:underline">Find the Moment</Link>
                    <span className="mx-2 text-on-dark-muted">·</span>
                    <Link to={`${p.base}/recaps` as never} className="text-gold hover:underline">Meeting Recaps</Link>
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
