/**
 * Email sign-up (UI only). BLOCKED: no email backend is connected, so this never collects or sends anything.
 * To turn on, pick a service (Buttondown, Mailchimp, ConvertKit/Kit, Substack, or a Vercel function + database)
 * and replace the disabled form with its embed/API call.
 */
export function SignupBox({ dark = true }: { dark?: boolean }) {
  return (
    <form noValidate onSubmit={(e) => e.preventDefault()} aria-describedby="signup-note" className={`rounded-xl border p-5 ${dark ? "border-navy-line bg-navy-700" : "border-border bg-card"}`}>
      <p className="font-serif text-2xl font-semibold uppercase">Get updates by email</p>
      <p className="mt-1 text-sm text-on-dark-muted">New investigations and meeting recaps, when they’re posted.</p>
      <fieldset disabled className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="signup-email" className="sr-only">Email address</label>
        <input id="signup-email" type="email" placeholder="you@example.com" className="h-12 min-w-0 flex-1 cursor-not-allowed rounded-lg bg-white/80 px-4 text-navy-800 placeholder:text-[#55627a]" />
        <button type="submit" className="h-12 cursor-not-allowed rounded-lg bg-on-dark-muted px-5 font-serif font-bold tracking-[0.06em] text-navy-800 uppercase">Coming soon</button>
      </fieldset>
      <p id="signup-note" className="mt-2 text-xs font-semibold text-gold">Coming soon. This box doesn’t collect or send anything yet.</p>
    </form>
  );
}
