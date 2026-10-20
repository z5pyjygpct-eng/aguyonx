import { createFileRoute } from "@tanstack/react-router";

/** POST /api/weekly/subscribe  { email, firstName?, website? (honeypot) } -> JSON { ok, code, message } */
const json = (status: number, code: string, message: string) =>
  new Response(JSON.stringify({ ok: status < 300, code, message }), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export const Route = createFileRoute("/api/weekly/subscribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          let body: any = {};
          try { body = await request.json(); } catch { return json(400, "bad_request", "Something went wrong. Please try again."); }
          // Honeypot: bots fill the hidden field. Pretend success, do nothing.
          if (typeof body.website === "string" && body.website.trim()) return json(200, "pending", "Almost done. Check your inbox and click the link to confirm.");
          const email = String(body.email ?? "").trim().toLowerCase();
          const firstName = String(body.firstName ?? "").trim().slice(0, 60).replace(/[<>\r\n]/g, "");
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) return json(400, "bad_email", "Please enter a valid email address.");
          const m = await import("@/lib/weekly/resend.server");
          const cfg = m.readConfig();
          if (!cfg) return json(503, "not_configured", "Sign-up isn't switched on yet. Please check back soon.");
          if (!(await m.upsertPendingContact(cfg, email, firstName))) return json(502, "upstream", "We couldn't sign you up just now. Please try again later.");
          if (!(await m.sendConfirmEmail(cfg, email, firstName))) return json(502, "upstream", "We couldn't send the confirmation email just now. Please try again later.");
          return json(200, "pending", "Almost done. Check your inbox and click the link to confirm.");
        } catch (err) {
          console.error("[weekly] subscribe failed", err);
          return json(500, "error", "Something went wrong. Please try again later.");
        }
      },
    },
  },
});
