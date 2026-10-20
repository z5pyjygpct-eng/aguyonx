// Draft the Wednesday weekly email from real site data. SENDS NOTHING.
// Usage: node tools/weekly/draft.mjs [--date YYYY-MM-DD] [--days 7] [--out tools/weekly/drafts]
// Output: <out>/weekly-<date>.html and .txt, then runs the link check (exit 1 on failure).
// Sources: src/lib/voter-mock.ts MEETINGS (Loudoun + city recaps + GA floor sessions), src/content/investigations.ts,
// src/content/news.ts. Find the Moment picks come from recap `moments`. Scott edits the note and picks before any send.
import { createServer } from "vite";
import fs from "node:fs";
import path from "node:path";
import { checkEmail, UNSUB } from "./check.mjs";

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const root = process.cwd();
const nextWed = (() => { const d = new Date(); d.setDate(d.getDate() + ((3 - d.getDay() + 7) % 7)); return d.toISOString().slice(0, 10); })();
const sendDate = arg("date", nextWed);
const days = Number(arg("days", 7));
const outDir = path.resolve(root, arg("out", "tools/weekly/drafts"));
const end = new Date(`${sendDate}T23:59:59`);
const start = new Date(end.getTime() - days * 86400000);
const inWin = (d) => d && !isNaN(d) && d >= start && d <= end;

const vite = await createServer({ root, configFile: false, logLevel: "error", resolve: { alias: { "@": path.join(root, "src") } }, server: { middlewareMode: true, hmr: false }, appType: "custom", optimizeDeps: { noDiscovery: true, include: [] } });
const L = (m) => vite.ssrLoadModule(m);
const { MEETINGS, VENUE_LABEL } = await L("/src/lib/voter-mock.ts");
const { INVESTIGATIONS } = await L("/src/content/investigations.ts");
const { NEWS } = await L("/src/content/news.ts");
const { WEEKLY_SITE, WEEKLY_FROM, POSTAL_ADDRESS } = await L("/src/lib/weekly/config.ts");
const { SITE } = await L("/src/content/site.ts");
await vite.close();

const site = (p) => `${WEEKLY_SITE}${p}`;
const parseLabel = (s) => new Date(String(s).replace(/^[A-Za-z]+,\s*/, ""));
const meetings = MEETINGS.map((m) => ({ ...m, d: parseLabel(m.dateLabel) })).filter((m) => inWin(m.d)).sort((a, b) => b.d - a.d);
const recaps = meetings.slice(0, 5).map((m) => {
  const voted = m.decisions.filter((x) => x.tally);
  const line = voted.length ? `${voted.length} recorded vote${voted.length > 1 ? "s" : ""}, e.g. ${voted[0].action} (${voted[0].tally}).`
    : m.rollCallCount ? `${m.rollCallCount} roll calls from the state's public vote files.`
    : m.noVotesRecorded || !m.votesPosted ? "Recap posted; no official vote record yet." : "Recap posted.";
  return { title: `${VENUE_LABEL[m.venue]}: ${m.title}`, date: m.dateLabel, line, url: site(m.href) };
});
const invs = INVESTIGATIONS.filter((s) => s.access === "public" && inWin(new Date(`${s.date}T12:00:00`))).slice(0, 2)
  .map((s) => ({ title: s.title, line: s.dek, url: site(`/investigations/${s.slug}`) }));
const news = NEWS.filter((n) => inWin(new Date(`${(n.filed ?? n.date)}T12:00:00`))).sort((a, b) => (b.date > a.date ? 1 : -1)).slice(0, 3)
  .map((n) => ({ title: n.headline, line: `${n.outlet}, ${n.date}`, url: n.url }));
const moments = meetings.flatMap((m) => m.moments.map((mo) => ({ mo, m }))).slice(0, 2).map(({ mo, m }) => {
  const t = `${Math.floor(mo.seconds / 3600)}:${String(Math.floor((mo.seconds % 3600) / 60)).padStart(2, "0")}:${String(mo.seconds % 60).padStart(2, "0")}`;
  return { title: mo.label, line: `${VENUE_LABEL[m.venue]}, ${m.dateLabel}, at ${t}`, url: site(m.href) };
});

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const NOTE = "[SCOTT: write 2-4 sentences here before sending.]";
const sections = [
  ["New recaps and votes", recaps],
  ["New investigations", invs],
  ["In the news", news],
  ["Find the Moment pick", moments],
].filter(([, items]) => items.length);
const subject = `This week at aguyonx.com (${new Date(`${sendDate}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})`;

const H = (s) => `<h2 style="font-family:Georgia,serif;font-size:18px;text-transform:uppercase;color:#0d1b33;border-bottom:2px solid #e8b931;padding-bottom:4px;margin:28px 0 8px">${esc(s)}</h2>`;
const item = (i) => `<p style="margin:0 0 12px"><a href="${i.url}" style="color:#0d1b33;font-weight:bold">${esc(i.title)}</a>${i.date ? `<br><span style="color:#55627a;font-size:14px">${esc(i.date)}</span>` : ""}<br>${esc(i.line)}</p>`;
// POSTAL_ADDRESS: empty until Scott supplies one (CAN-SPAM legal requirement). Never invent it. send.mjs refuses while empty.
const addrHtml = POSTAL_ADDRESS ? `<br>${esc(POSTAL_ADDRESS)}` : "<br>[POSTAL ADDRESS REQUIRED: Scott to supply]";
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;background:#f4f6fa"><div style="max-width:600px;margin:0 auto;padding:24px;background:#ffffff;font-family:Georgia,serif;font-size:16px;line-height:1.55;color:#0d1b33">
<p style="margin:0 0 4px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#55627a">A Guy On X · Weekly update</p>
<p>Hi {{{contact.first_name|there}}},</p>
<p>${esc(NOTE)}</p>
${sections.map(([h, items]) => H(h) + items.map(item).join("\n")).join("\n")}
<p style="margin-top:28px">Thanks for reading. Hit reply anytime; I read every message.<br>Scott</p>
<p style="margin-top:16px"><a href="${site("/")}" style="color:#0d1b33">aguyonx.com</a> · <a href="${SITE.giveUrl}" style="color:#0d1b33">${esc(SITE.giveLabel)}</a></p>
<p style="font-size:12px;color:#55627a;border-top:1px solid #dde3ec;padding-top:12px;margin-top:24px">You're getting this because you signed up at aguyonx.com. <a href="${UNSUB}" style="color:#55627a">Unsubscribe</a> · <a href="${site("/privacy")}" style="color:#55627a">Privacy</a>${addrHtml}</p>
</div></body></html>
`;
const T = (i) => `- ${i.title}${i.date ? ` (${i.date})` : ""}\n  ${i.line}\n  ${i.url}`;
const text = `A GUY ON X · WEEKLY UPDATE
${subject}

Hi {{{contact.first_name|there}}},

${NOTE}
${sections.map(([h, items]) => `\n${h.toUpperCase()}\n${items.map(T).join("\n")}`).join("\n")}

Thanks for reading. Hit reply anytime; I read every message.
Scott

aguyonx.com: ${site("/")}
${SITE.giveLabel}: ${SITE.giveUrl}

---
You're getting this because you signed up at aguyonx.com.
Unsubscribe: ${UNSUB}
Privacy: ${site("/privacy")}
${POSTAL_ADDRESS || "[POSTAL ADDRESS REQUIRED: Scott to supply]"}
`;

fs.mkdirSync(outDir, { recursive: true });
const base = path.join(outDir, `weekly-${sendDate}`);
fs.writeFileSync(`${base}.html`, html);
fs.writeFileSync(`${base}.txt`, text);
fs.writeFileSync(`${base}.json`, JSON.stringify({ subject, from: WEEKLY_FROM, sendDate, window: [start.toISOString(), end.toISOString()], counts: Object.fromEntries(sections.map(([h, i]) => [h, i.length])) }, null, 2));
console.log(JSON.stringify({ html: `${base}.html`, txt: `${base}.txt`, subject, counts: Object.fromEntries(sections.map(([h, i]) => [h, i.length])) }));
if (!POSTAL_ADDRESS) console.warn("WARNING: no postal address (CAN-SPAM). send.mjs will refuse until src/lib/weekly/config.ts POSTAL_ADDRESS is set.");
const errs = checkEmail(html, text);
if (errs.length) { console.error("LINK CHECK FAILED:\n- " + errs.join("\n- ")); process.exit(1); }
console.log("Link check passed. Nothing was sent.");
