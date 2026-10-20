import { useState } from "react";

/**
 * Weekly updates sign-up (double opt-in). Posts to /api/weekly/subscribe (Resend, see src/lib/weekly/).
 * If the server isn't configured (env vars missing) it shows a friendly "not switched on yet" message.
 * Wording: /workspace/v4shots/weekly-update-plan.md section (b).
 */
type State = { kind: "idle" | "sending" | "pending" | "error"; msg?: string };

export function SignupBox({ dark = true }: { dark?: boolean }) {
  const [st, setSt] = useState<State>({ kind: "idle" });
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setSt({ kind: "error", msg: "Please enter a valid email address." });
    setSt({ kind: "sending" });
    try {
      const r = await fetch("/api/weekly/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, firstName: fd.get("firstName"), website: fd.get("website") }) });
      const d = (await r.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (r.ok && d?.ok) setSt({ kind: "pending", msg: d.message });
      else setSt({ kind: "error", msg: d?.message ?? "Something went wrong. Please try again later." });
    } catch {
      setSt({ kind: "error", msg: "Couldn't reach the server. Please try again later." });
    }
  }
  const input = "h-12 min-w-0 rounded-lg bg-white px-4 text-navy-800 placeholder:text-[#55627a]";
  return (
    <form noValidate onSubmit={onSubmit} aria-describedby="signup-note" className={`rounded-xl border p-5 ${dark ? "border-navy-line bg-navy-700" : "border-border bg-card"}`}>
      <p className="font-serif text-2xl font-semibold uppercase">Stay in the loop</p>
      <p className="mt-1 text-sm text-on-dark-muted">A short email from me about once a week: new meetings, recaps, votes and investigations, written so anyone can follow.</p>
      {st.kind === "pending" ? (
        <p role="status" className="mt-4 rounded-lg bg-gold/15 p-4 font-semibold text-gold">{st.msg ?? "Almost done. Check your inbox and click the link to confirm."}</p>
      ) : (
        <>
          <fieldset disabled={st.kind === "sending"} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label htmlFor="signup-email" className="sr-only">Email (required)</label>
            <input id="signup-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={`${input} shrink-0 sm:flex-[2]`} />
            <label htmlFor="signup-first" className="sr-only">First name (optional)</label>
            <input id="signup-first" name="firstName" type="text" autoComplete="given-name" maxLength={60} placeholder="First name (optional)" className={`${input} shrink-0 sm:flex-1`} />
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="signup-website">Leave this empty</label>
              <input id="signup-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <button type="submit" className="h-12 shrink-0 rounded-lg bg-gold px-5 font-serif font-bold tracking-[0.06em] text-navy-800 uppercase hover:brightness-110">{st.kind === "sending" ? "Sending…" : "Sign me up"}</button>
          </fieldset>
          {st.kind === "error" ? <p role="alert" className="mt-2 text-sm font-semibold text-gold">{st.msg}</p> : null}
        </>
      )}
      <p id="signup-note" className="mt-2 text-xs text-on-dark-muted">About one email a week. Never sold or shared. Unsubscribe anytime. <a href="/privacy" className="text-gold underline">Privacy</a></p>
    </form>
  );
}
