import { createFileRoute } from "@tanstack/react-router";

/**
 * Unsubscribe for the confirm/welcome emails (List-Unsubscribe target).
 * GET shows a page and unsubscribes; POST is RFC 8058 one-click (returns 200, empty body).
 * Weekly Broadcasts use Resend's own {{{RESEND_UNSUBSCRIBE_URL}}} instead.
 */
async function run(request: Request) {
  const m = await import("@/lib/weekly/resend.server");
  const cfg = m.readConfig();
  if (!cfg) return { m, ok: false, why: "not_configured" as const };
  const email = m.readToken(cfg.secret, "unsub", new URL(request.url).searchParams.get("t"));
  if (!email) return { m, ok: false, why: "bad_token" as const };
  return { m, ok: await m.unsubscribeContact(cfg, email), why: "upstream" as const };
}

export const Route = createFileRoute("/api/weekly/unsubscribe")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const r = await run(request);
          if (r.ok) return r.m.page("You're unsubscribed", "You won't get any more emails from aguyonx.com. Sorry to see you go.");
          if (r.why === "bad_token") return r.m.page("Link not valid", "This unsubscribe link isn't valid. Reply to any email and I'll remove you by hand.", 400);
          return r.m.page("Please try again", "We couldn't unsubscribe you just now. Try again, or reply to any email and I'll remove you by hand.", 503);
        } catch (err) {
          console.error("[weekly] unsubscribe failed", err);
          return new Response("Please try again later.", { status: 500 });
        }
      },
      POST: async ({ request }) => {
        try {
          const r = await run(request);
          return new Response(null, { status: r.ok ? 200 : r.why === "bad_token" ? 400 : 503 });
        } catch {
          return new Response(null, { status: 500 });
        }
      },
    },
  },
});
