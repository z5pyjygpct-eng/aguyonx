// Pre-send link check for weekly emails. Usage: node tools/weekly/check.mjs <file.html> <file.txt>
// Fails on Gmail redirect leftovers (google.com/url, source=gmail, sa=E), any non-https link,
// or a missing unsubscribe link. Exported for draft.mjs and send.mjs.
import fs from "node:fs";

export const UNSUB = "{{{RESEND_UNSUBSCRIBE_URL}}}";
export function checkEmail(html, text) {
  const errors = [];
  const both = `${html}\n${text}`;
  for (const [re, why] of [[/google\.com\/url/i, "google.com/url redirect"], [/source=gmail/i, "source=gmail"], [/[?&]sa=E\b/, "sa=E"]]) if (re.test(both)) errors.push(`Gmail redirect leftover: ${why}`);
  for (const m of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']*)["']/gi)) {
    const u = m[1];
    if (u === UNSUB) continue;
    if (!/^https:\/\//i.test(u)) errors.push(`non-https link: ${u || "(empty)"}`);
  }
  for (const m of text.matchAll(/(?:\bhttp:\/\/|(?<!\/)\bwww\.)\S+/gi)) errors.push(`non-https link in text part: ${m[0]}`);
  if (!html.includes(UNSUB)) errors.push("missing unsubscribe link in HTML part");
  if (!text.includes(UNSUB)) errors.push("missing unsubscribe link in text part");
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [h, t] = process.argv.slice(2);
  if (!h || !t) { console.error("usage: check.mjs <html> <txt>"); process.exit(2); }
  const errs = checkEmail(fs.readFileSync(h, "utf8"), fs.readFileSync(t, "utf8"));
  if (errs.length) { console.error("LINK CHECK FAILED:\n- " + errs.join("\n- ")); process.exit(1); }
  console.log("Link check passed.");
}
