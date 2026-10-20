import { createFileRoute } from "@tanstack/react-router";

/** GET /api/weekly/confirm?t=<signed token> : subscribe + add to weekly segment + welcome email. */
export const Route = createFileRoute("/api/weekly/confirm")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const m = await import("@/lib/weekly/resend.server");
        try {
          const cfg = m.readConfig();
          if (!cfg) return m.page("Not switched on yet", "Email sign-up isn't switched on yet. Please check back soon.", 503);
          const email = m.readToken(cfg.secret, "confirm", new URL(request.url).searchParams.get("t"));
          if (!email) return m.page("Link expired", "This confirmation link is invalid or has expired. Please sign up again on the homepage.", 400);
          const firstName = await m.confirmContact(cfg, email);
          if (firstName === null) return m.page("Please try again", "We couldn't confirm you just now. Please try the link again in a few minutes.", 502);
          await m.sendWelcomeEmail(cfg, email, firstName);
          return m.page("You're signed up", "Thanks for confirming. Your first weekly update will arrive soon.");
        } catch (err) {
          console.error("[weekly] confirm failed", err);
          return m.page("Please try again", "Something went wrong. Please try the link again later.", 500);
        }
      },
    },
  },
});
