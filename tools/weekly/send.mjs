// MANUAL send step for a reviewed weekly draft. NOT wired to anything; never runs automatically.
// Refuses to run unless ALL of these hold:
//   --i-have-scotts-approval flag, WEEKLY_SEND_APPROVED=yes env, a draft path,
//   link check passes, Scott's note filled in, env vars present.
// Usage (only after Scott approves a specific draft):
//   WEEKLY_SEND_APPROVED=yes node tools/weekly/send.mjs tools/weekly/drafts/weekly-YYYY-MM-DD --i-have-scotts-approval
// It creates a Resend Broadcast to RESEND_WEEKLY_SEGMENT_ID and sends it (Resend free plan: Broadcasts are
// limited by contacts (1,000), not the 100/day transactional quota; see weekly-update-plan.md).
import fs from "node:fs";
import { checkEmail } from "./check.mjs";

const die = (m) => { console.error(`REFUSING TO SEND: ${m}`); process.exit(1); };
const base = process.argv[2];
if (!process.argv.includes("--i-have-scotts-approval") || process.env.WEEKLY_SEND_APPROVED !== "yes") die("explicit approval flag (--i-have-scotts-approval) and WEEKLY_SEND_APPROVED=yes are both required.");
if (!base || base.startsWith("--")) die("pass the draft path without extension.");
const html = fs.readFileSync(`${base}.html`, "utf8");
const text = fs.readFileSync(`${base}.txt`, "utf8");
const meta = JSON.parse(fs.readFileSync(`${base}.json`, "utf8"));
const errs = checkEmail(html, text);
if (errs.length) die("link check failed:\n- " + errs.join("\n- "));
if (/\[SCOTT:/.test(html + text)) die("Scott's note placeholder is still in the draft.");
const key = process.env.RESEND_API_KEY, seg = process.env.RESEND_WEEKLY_SEGMENT_ID;
if (!key || !seg) die("RESEND_API_KEY and RESEND_WEEKLY_SEGMENT_ID must be set.");

const r = await fetch("https://api.resend.com/broadcasts", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({ segment_id: seg, from: meta.from, reply_to: "updates@aguyonx.com", subject: meta.subject, html, text, name: `Weekly ${meta.sendDate}`, send: true }),
});
console.log(r.status, await r.text());
process.exit(r.ok ? 0 : 1);
