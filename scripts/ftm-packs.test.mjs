import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildFtmPacks, catalogUrls, chunkLines, packLine } from "./ftm-packs.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("catalogUrls keeps catalog order, dedupes, skips template and pack URLs", () => {
  const src = `
    windowsUrl: "/files/find-the-moment/loudoun-bos/b.json",
    url: "/files/find-the-moment/loudoun-bos/transcripts/a.json",
    windowsUrl: "/files/find-the-moment/loudoun-bos/b.json",
    return \`/files/find-the-moment/loudoun-bos/\${clipId}.json\`;
    x: "/files/find-the-moment/loudoun-bos/pack/manifest.json",
    y: "/files/find-the-moment/loudoun-lcps/c.json",
  `;
  assert.deepEqual(catalogUrls([src], "loudoun-bos"), [
    "/files/find-the-moment/loudoun-bos/b.json",
    "/files/find-the-moment/loudoun-bos/transcripts/a.json",
  ]);
});

test("packLine rejects windows that are not {start,end,text}", () => {
  assert.throws(() => packLine("/u.json", [{ start: 1, end: 2 }]), /not \{start,end,text\}/);
  assert.equal(
    packLine("/u.json", [{ start: 1.5, end: 2, text: 'a "b"' }]),
    '{"u":"/u.json","w":[[1.5,2,"a \\"b\\""]]}',
  );
});

test("chunkLines keeps order and one file per line", () => {
  const entries = ["a", "b", "c"].map((u) => ({
    url: u,
    line: packLine(u, [{ start: 0, end: 1, text: u.repeat(10) }]),
  }));
  const chunks = chunkLines(entries, 1);
  assert.deepEqual(
    chunks.map((c) => c.files),
    [["a"], ["b"], ["c"]],
  );
  const one = chunkLines(entries, 1e9);
  assert.equal(one.length, 1);
  const lines = one[0].body.trim().split("\n");
  assert.equal(lines[0], "[");
  assert.equal(lines.at(-1), "]");
  assert.equal(JSON.parse(one[0].body).length, 3);
});

test("built packs reproduce every catalog window file exactly", () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "ftm-packs-"));
  try {
    const summary = buildFtmPacks({ outDir: out, log: () => {} });
    for (const { venue, files } of summary) {
      assert.ok(files > 0, `${venue} has files`);
      const manifest = JSON.parse(
        fs.readFileSync(
          path.join(out, "files/find-the-moment", venue, "pack/manifest.json"),
          "utf8",
        ),
      );
      let seen = 0;
      for (const chunk of manifest.chunks) {
        const body = fs.readFileSync(path.join(out, chunk.url), "utf8");
        const rows = JSON.parse(body);
        assert.deepEqual(
          rows.map((r) => r.u),
          chunk.files,
        );
        for (const r of rows) {
          const original = JSON.parse(fs.readFileSync(path.join(ROOT, "public", r.u), "utf8"));
          assert.deepEqual(
            r.w.map(([start, end, text]) => ({ start, end, text })),
            original,
            r.u,
          );
          seen += 1;
        }
      }
      assert.equal(seen, files);
    }
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
});
