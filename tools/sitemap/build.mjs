// Sitemap from routes + repo data: node tools/sitemap/build.mjs
// → public/sitemap.xml (git-ignored, rebuilt each build) and src/lib/sitemap.gen.json (the /sitemap page).
// /mockups/* only when a non-mockup page links to it.
import { createServer } from "vite";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const vite = await createServer({ root, configFile: false, logLevel: "error", resolve: { alias: { "@": path.join(root, "src") } }, server: { middlewareMode: true, hmr: false }, appType: "custom", optimizeDeps: { noDiscovery: true, include: [] } });
const L = (m) => vite.ssrLoadModule(m);
const { SITE } = await L("/src/content/site.ts");
const { ARTICLES } = await L("/src/content/articles.ts");
const { INVESTIGATIONS } = await L("/src/content/investigations.ts");
const { DASHBOARDS } = await L("/src/lib/dashboards.ts");
const { CITIES } = await L("/src/content/cities.ts");
const { ftmLocalities } = await L("/src/content/ftm-localities.ts");
const { MEETINGS, VENUE_LABEL } = await L("/src/lib/voter-mock.ts");
await vite.close();
const json = (f) => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));

const dir = path.join(root, "src/routes");
const srcs = fs.readdirSync(dir).filter((f) => f.endsWith(".tsx")).map((f) => [f, fs.readFileSync(path.join(dir, f), "utf8")]);
const linked = new Set();
for (const f of fs.readdirSync(path.join(root, "src"), { recursive: true })) {
  if (!/\.(tsx?|mjs)$/.test(f) || /mockup/.test(f)) continue;
  for (const m of fs.readFileSync(path.join(root, "src", f), "utf8").matchAll(/["'`](\/mockups\/[a-z0-9-]+)/g)) linked.add(m[1]);
}
const sections = new Map();
const add = (sec, url, title) => { const s = sections.get(sec) ?? sections.set(sec, new Map()).get(sec); if (!s.has(url)) s.set(url, title); };
const sectionOf = (u) => u === "/" ? "Main pages" : u.startsWith("/dashboards") ? "Dashboards" : u.startsWith("/general-assembly") ? "General Assembly" : u.startsWith("/counties") || u.startsWith("/cities") || u.startsWith("/find-the-moment") ? "Places and Find the Moment" : u.startsWith("/library") ? "Library" : u.startsWith("/mockups") ? "Guides (preview)" : "Main pages";
for (const [f, src] of srcs) {
  const route = src.match(/createFileRoute\("([^"]+)"\)/)?.[1];
  if (!route || route.includes("$") || route === "__root") continue;
  if (route.startsWith("/mockups") && !linked.has(route.replace(/\/$/, ""))) continue;
  if (!route.startsWith("/mockups") && /content:\s*"noindex"/.test(src)) continue; // drafts (e.g. /privacy) stay out until approved
  if (/\/_|_\//.test(route) || route.endsWith("_")) continue;
  const title = src.match(/title:\s*"([^"]+)"/)?.[1]?.replace(/\s*[·|—]\s*A Guy on X$/, "").replace(/^Mockup:\s*/, "");
  const url = route.replace(/\/$/, "") || "/";
  add(sectionOf(url), url, title ?? url);
}
const pub = (s) => s.access === "public";
for (const s of ARTICLES.filter(pub)) add("Articles", `/articles/${s.slug}`, s.title);
for (const s of INVESTIGATIONS.filter(pub)) add("Investigations", `/investigations/${s.slug}`, s.title);
for (const d of DASHBOARDS) add("Dashboards", `/dashboards/${d.slug}`, `${d.title} dashboard`);
for (const c of CITIES) add("Places and Find the Moment", `/cities/${c.id}`, c.name);
for (const l of ftmLocalities()) if (l.live !== false) add("Places and Find the Moment", `/find-the-moment/${l.id}`, `Find the Moment: ${l.title ?? l.label ?? l.id}`);
for (const ch of ["house", "senate"]) for (const m of json(`src/lib/ga-members-2026-${ch}.json`).members) add("Members", `/dashboards/${ch}/members/${m.slug}`, `${m.name} (${ch === "house" ? "HD" : "SD"}-${m.district})`);
for (const m of MEETINGS) add("Meeting recaps", m.href, `${VENUE_LABEL[m.venue]}: ${m.title}, ${m.dateLabel}`);

const ORDER = ["Main pages", "Guides (preview)", "Investigations", "Articles", "Dashboards", "Places and Find the Moment", "General Assembly", "Members", "Library", "Meeting recaps"];
const out = [...sections].sort((a, b) => ORDER.indexOf(a[0]) - ORDER.indexOf(b[0])).map(([name, m]) => ({ name, pages: [...m].map(([url, title]) => ({ url, title })).sort((a, b) => name === "Meeting recaps" ? 0 : a.title.localeCompare(b.title)) }));
const all = out.flatMap((s) => s.pages.map((p) => p.url));
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
fs.writeFileSync(path.join(root, "public/sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${all.map((u) => `  <url><loc>${esc(SITE.url + (u === "/" ? "/" : u))}</loc></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(root, "src/lib/sitemap.gen.json"), JSON.stringify({ sections: out }));
console.log(JSON.stringify({ urls: all.length, sections: out.map((s) => `${s.name}:${s.pages.length}`) }));
