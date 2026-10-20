import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VENUE_FTM, VENUE_LABEL, TRY_CHIPS, EXAMPLE_PROMPTS, type VenueKey } from "@/lib/voter-mock";

/** Shared how-to pieces: used by /how-to, /mockups/search and /mockups/meetings. Plain words on purpose. */
const card = "rounded-xl border border-navy-line bg-navy-700";
const lab = "font-mono text-xs tracking-widest text-gold uppercase";
export const chipClass = "inline-flex min-h-10 items-center rounded-full border border-navy-line bg-navy-800 px-4 text-sm font-semibold text-white hover:border-gold hover:text-gold";

export const STEPS: { t: string; title: string; text: string }[] = [
  { t: "0:00–0:10", title: "Type a topic, not a perfect phrase", text: "One or two everyday words work best: “taxes”, “data centers”, a person’s name, or a district like “HD-10”. Or tap one of the examples." },
  { t: "0:10–0:20", title: "Read the groups", text: "Results come grouped: our articles and investigations, meetings where it came up or was voted on, and news. Start at the top group." },
  { t: "0:20–0:35", title: "Open a meeting to see every vote", text: "A meeting page lists every item the board voted on, with the official tally and a link to the county’s own minutes." },
  { t: "0:35–0:45", title: "Hear it for yourself", text: "“Search what was said” jumps to the moment in the meeting video. Captions are an index, not quotes, so always check the video." },
  { t: "0:45–0:55", title: "Nothing found? Try a neighbor", text: "If a word isn’t on our pages yet, we suggest close terms and send you to the meeting transcripts, where many more words live." },
];

export function Walkthrough() {
  const [i, setI] = useState(0);
  const s = STEPS[i];
  return (
    <section className={`${card} p-5 sm:p-6`} aria-labelledby="howto">
      <p className={lab}>How it works · about 55 seconds</p>
      <h2 id="howto" className="mt-1 font-serif text-2xl font-semibold uppercase">Step {i + 1} of {STEPS.length}: {s.title}</h2>
      <p className="mt-1 font-mono text-xs text-night-muted">{s.t}</p>
      <p className="mt-3 max-w-2xl text-on-dark-muted">{s.text}</p>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" disabled={i === 0} onClick={() => setI(i - 1)} className="inline-flex h-10 items-center gap-1 rounded-md border border-navy-line px-3 text-sm disabled:opacity-40"><ChevronLeft className="size-4" />Back</button>
        <button type="button" onClick={() => setI((i + 1) % STEPS.length)} className="inline-flex h-10 items-center gap-1 rounded-md bg-gold px-4 text-sm font-semibold text-navy-900">{i === STEPS.length - 1 ? "Start over" : "Next"}<ChevronRight className="size-4" /></button>
        <span className="flex gap-1.5" aria-hidden>{STEPS.map((_, k) => <span key={k} className={`size-2 rounded-full ${k === i ? "bg-gold" : "bg-navy-line"}`} />)}</span>
      </div>
      <p className="mt-3 text-xs text-night-muted">Tap Next to go through the steps.</p>
    </section>
  );
}

export function StartHere({ venue = "loudoun-bos" as VenueKey }: { venue?: VenueKey }) {
  const steps = [
    ["Pick a meeting", "Newest first. A green tag means the official votes are posted."],
    ["Read what they decided", "Every item voted on is listed under the meeting, with the official tally."],
    ["Check the source", "Each vote links to the minutes or roll call it came from."],
    ["Hear the discussion", "Open the meeting page for video moments, or search what was said."],
  ];
  return (
    <section className={`${card} border-l-4 border-l-gold p-5`} aria-labelledby="start">
      <p id="start" className={lab}>Start here</p>
      <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([t, d], i) => (
          <li key={t} className="flex gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold font-serif font-bold text-navy-900">{i + 1}</span><span><span className="block font-semibold">{t}</span><span className="block text-sm text-on-dark-muted">{d}</span></span></li>
        ))}
      </ol>
      <p className="mt-3 text-sm"><a className="text-gold underline" href={VENUE_FTM[venue]}>Search what was said at {VENUE_LABEL[venue]} meetings</a></p>
    </section>
  );
}


/** Example questions + Try-these chips. With onPick they run in place; without, they link to the search page. */
export function SearchExamples({ onPick, showChips = true }: { onPick?: (q: string) => void; showChips?: boolean }) {
  const item = (q: string, label: string) =>
    onPick ? <button key={q} type="button" className={chipClass} onClick={() => onPick(q)}>{label}</button>
      : <a key={q} className={chipClass} href={`/?q=${encodeURIComponent(q)}`}>{label}</a>;
  return (
    <div>
      <p className={lab}>Ask it like this</p>
      <div className="mt-2 flex flex-wrap gap-2">{EXAMPLE_PROMPTS.map((p) => item(p.q, `“${p.label}”`))}</div>
      {showChips ? (<>
        <p className={`${lab} mt-5`}>Try these</p>
        <div className="mt-2 flex flex-wrap gap-2">{TRY_CHIPS.map((c) => item(c, c))}</div>
      </>) : null}
    </div>
  );
}
