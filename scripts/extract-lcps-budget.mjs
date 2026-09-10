/**
 * Extract LCPS / Loudoun budget shelf files into committed per-doc JSON.
 * Requires poppler pdftotext for PDFs. Vercel builds do not run this.
 *
 *   node scripts/extract-lcps-budget.mjs
 *
 * Writes:
 *   public/files/lcps-budget/extracts/<id>.json
 *   public/files/lcps-budget/extracts/manifest.json
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "public/files/lcps-budget");
const outDir = join(srcDir, "extracts");

/** Must stay aligned with src/content/lcps-budget.ts search docs. */
const DOCS = [
  {
    id: "FY2027-lcps-superintendent-estimate-of-needs",
    file: "FY2027-lcps-superintendent-estimate-of-needs.pdf",
    label: "FY2027 Superintendent’s Estimate of Needs (SEON)",
    kind: "Proposed (SEON)",
    href: "/files/lcps-budget/FY2027-lcps-superintendent-estimate-of-needs.pdf",
  },
  {
    id: "FY2027-lcps-school-board-adopted-executive-summary",
    file: "FY2027-lcps-school-board-adopted-executive-summary.pdf",
    label: "FY2027 School Board Adopted Executive Summary",
    kind: "School Board Adopted",
    href: "/files/lcps-budget/FY2027-lcps-school-board-adopted-executive-summary.pdf",
  },
  {
    id: "FY2027-lcps-budget-resolution-adopted",
    file: "FY2027-lcps-budget-resolution-adopted.pdf",
    label: "FY2027 School Board Budget Resolution (Adopted)",
    kind: "School Board Adopted",
    href: "/files/lcps-budget/FY2027-lcps-budget-resolution-adopted.pdf",
  },
  {
    id: "FY2027-lcps-school-board-adopted-budget-presented-to-bos",
    file: "FY2027-lcps-school-board-adopted-budget-presented-to-bos.pdf",
    label: "FY2027 School Board Adopted — presented to BOS",
    kind: "School Board Adopted",
    href: "/files/lcps-budget/FY2027-lcps-school-board-adopted-budget-presented-to-bos.pdf",
  },
  {
    id: "FY2027-loudoun-adopted-executive-summary",
    file: "FY2027-loudoun-adopted-executive-summary.pdf",
    label: "FY2027 BOS Adopted Executive Summary",
    kind: "BOS Adopted",
    href: "/files/lcps-budget/FY2027-loudoun-adopted-executive-summary.pdf",
  },
  {
    id: "FY2027-loudoun-budget-in-brief",
    file: "FY2027-loudoun-budget-in-brief.pdf",
    label: "FY2027 Budget in Brief",
    kind: "BOS Adopted",
    href: "/files/lcps-budget/FY2027-loudoun-budget-in-brief.pdf",
  },
  {
    id: "FY2027-loudoun-adopted-school-projects-CIP",
    file: "FY2027-loudoun-adopted-school-projects-CIP.pdf",
    label: "FY2027 School Projects CIP",
    kind: "BOS Adopted (CIP)",
    href: "/files/lcps-budget/FY2027-loudoun-adopted-school-projects-CIP.pdf",
  },
  {
    id: "FY2026-lcps-school-board-adopted-budget",
    file: "FY2026-lcps-school-board-adopted-budget.pdf",
    label: "FY2026 School Board Adopted Budget (full book)",
    kind: "School Board Adopted (FY26)",
    href: "/files/lcps-budget/FY2026-lcps-school-board-adopted-budget.pdf",
  },
  {
    id: "FY2027-lcps-may12-operating-fund-amendment-excerpt",
    file: "FY2027-lcps-may12-operating-fund-amendment-excerpt.txt",
    label: "FY2027 May 12 operating amendment (excerpt)",
    kind: "Amendment",
    href: "/files/lcps-budget/FY2027-lcps-may12-operating-fund-amendment-excerpt.txt",
  },
  {
    id: "LCPS-budget-kitchen-table",
    file: "LCPS-budget-kitchen-table.md",
    label: "Kitchen-table guide (plain English)",
    kind: "Guide",
    href: "/files/lcps-budget/LCPS-budget-kitchen-table.md",
  },
  {
    id: "LCPS-budget-one-pager",
    file: "LCPS-budget-one-pager.md",
    label: "Budget one-pager",
    kind: "Guide",
    href: "/files/lcps-budget/LCPS-budget-one-pager.md",
  },
];

function collapse(text) {
  return text.replace(/\f/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
}

function readSource(file) {
  const path = join(srcDir, file);
  if (!existsSync(path)) throw new Error(`missing source: ${file}`);
  const ext = extname(file).toLowerCase();
  if (ext === ".pdf") {
    return execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", path, "-"], {
      encoding: "utf8",
      maxBuffer: 40 * 1024 * 1024,
    });
  }
  return readFileSync(path, "utf8");
}

mkdirSync(outDir, { recursive: true });

const manifestDocs = [];
let totalBytes = 0;

for (const doc of DOCS) {
  const raw = readSource(doc.file);
  const text = collapse(raw);
  const payload = {
    id: doc.id,
    label: doc.label,
    kind: doc.kind,
    href: doc.href,
    file: doc.file,
    text,
  };
  const outPath = join(outDir, `${doc.id}.json`);
  const json = JSON.stringify(payload);
  writeFileSync(outPath, json);
  totalBytes += json.length;
  manifestDocs.push({
    id: doc.id,
    label: doc.label,
    kind: doc.kind,
    href: doc.href,
    file: doc.file,
    extract: `/files/lcps-budget/extracts/${doc.id}.json`,
    chars: text.length,
  });
  console.log(`${text.length.toLocaleString()} chars ← ${doc.file}`);
}

const manifest = {
  generatedAt: new Date().toISOString(),
  docs: manifestDocs,
};
writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

// Remove stale extract JSONs not in the current doc list (keep manifest).
const keep = new Set(DOCS.map((d) => `${d.id}.json`).concat(["manifest.json"]));
for (const name of readdirSync(outDir)) {
  if (!keep.has(name)) {
    console.warn("leaving unexpected file (not deleting):", name);
  }
}

console.log(
  `wrote ${manifestDocs.length} extracts + manifest (${(totalBytes / 1024 / 1024).toFixed(2)} MB JSON)`,
);
