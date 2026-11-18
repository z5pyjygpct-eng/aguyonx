import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  BILL_TEXT_EDITORIAL_LABEL,
  EDITORIAL_LABEL,
  PENDING_HAS_BOTH_MESSAGE,
  PENDING_HAS_SUMMARY_MESSAGE,
  PENDING_HAS_TEXT_MESSAGE,
  PENDING_MESSAGE,
  billTextVersionLabel,
  editorialLabelFor,
  pendingMessageFor,
} from "./va2027-bill-summary-copy.ts";

const catalog = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "va2027-bill-summaries.json"), "utf8"),
);

describe("pendingMessageFor", () => {
  it("blames LIS only when there is no official summary and no bill-text link", () => {
    assert.equal(pendingMessageFor({ summary_plain: "", lis_text_url: null }), PENDING_MESSAGE);
    assert.equal(pendingMessageFor({ summary_plain: "  ", lis_text_url: "" }), PENDING_MESSAGE);
  });

  it("says we have not written a summary when LIS already posted one and a text link", () => {
    assert.equal(
      pendingMessageFor({
        summary_plain: "Electric utilities; renewable energy portfolio standard eligible sources; zero-carbon electricity generating nuclear facilities.",
        lis_text_url: "https://lis.virginia.gov/bill-details/20271/SB856/text/SB856",
      }),
      PENDING_HAS_BOTH_MESSAGE,
    );
  });

  it("names only the official source that is actually present", () => {
    assert.equal(
      pendingMessageFor({ summary_plain: "Authority of fire marshals.", lis_text_url: null }),
      PENDING_HAS_SUMMARY_MESSAGE,
    );
    assert.equal(
      pendingMessageFor({ summary_plain: "", lis_text_url: "https://lis.virginia.gov/bill-details/20271/HB1315/text/HB1315" }),
      PENDING_HAS_TEXT_MESSAGE,
    );
  });
});

describe("editorial labels and text version", () => {
  it("uses the bill-text label only for bill-text entries", () => {
    assert.equal(editorialLabelFor("bill-text"), BILL_TEXT_EDITORIAL_LABEL);
    assert.equal(editorialLabelFor("lis-summary"), EDITORIAL_LABEL);
    assert.equal(editorialLabelFor(""), EDITORIAL_LABEL);
  });

  it("includes the official text version date on the bill-text link label", () => {
    assert.equal(billTextVersionLabel("1/16/2026"), "Bill text (version 1/16/2026)");
    assert.equal(billTextVersionLabel("  "), "Bill text");
    assert.equal(billTextVersionLabel(null), "Bill text");
  });
});

describe("published summaries", () => {
  it("keeps SB856 and a bill-text example as ok", () => {
    const sb856 = catalog.bills.SB856;
    assert.equal(sb856.status, "ok");
    assert.equal(sb856.sourceUsed, "lis-summary");
    assert.match(sb856.summary, /nuclear facilities located in the Commonwealth/);
    const hb1315 = catalog.bills.HB1315;
    assert.equal(hb1315.status, "ok");
    assert.equal(hb1315.sourceUsed, "bill-text");
    assert.match(hb1315.summary, /fire marshal/);
    assert.equal(typeof hb1315.sourceFingerprint.textHash, "string");
    assert.equal(hb1315.reviewed, false);
    assert.equal(catalog.bills.SB837.reviewed, true);
  });
});
