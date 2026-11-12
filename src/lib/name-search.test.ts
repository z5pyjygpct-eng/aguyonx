import assert from "node:assert/strict";
import test from "node:test";
import { fuzzyScore, tokenize } from "./name-search.ts";

function matches(query: string, text: string): boolean {
  return fuzzyScore(query, [{ text, weight: 10 }]) != null;
}

test("committee titles match a person name without the official prefix or suffix", () => {
  assert.equal(matches("Patrick Hope", "Friends of Patrick Hope"), true);
  assert.equal(matches("Patrick Hope", "Friends of Patrick A. Hope"), true);
  assert.equal(matches("Jane Doe", "Committee for Jane Doe for Senate"), true);
  assert.equal(matches("Kilgore", "Kilgore for Delegate"), true);
  assert.equal(matches("Anne Ferrell Tata", "Friends of Anne Ferrell Tata"), true);
});

test("reordered and partial words still match", () => {
  assert.equal(matches("Hope Patrick", "Friends of Patrick Hope"), true);
  assert.equal(matches("Patr Hope", "Friends of Patrick Hope"), true);
  assert.equal(matches("T Kilgore", "Kilgore for Delegate"), true);
  assert.equal(matches("Kilgore Delegate", "Kilgore for Delegate"), true);
});

test("unrelated names do not match", () => {
  assert.equal(matches("Patrick Hope", "Kilgore for Delegate"), false);
  assert.equal(matches("Joseph Kilgore", "Kilgore for Delegate"), false);
});

test("government budget text matches without an exact phrase or word order", () => {
  const body = "The adopted budget includes salary increases for teachers and a plan to replace school buses.";
  assert.equal(matches("teacher salary", body), true);
  assert.equal(matches("salary teachers", body), true);
  assert.equal(matches("school buses", body), true);
  assert.equal(matches("school bus", body), true);
  assert.equal(matches("firefighter pension", body), false);
});

test("HD45 splits into searchable pieces", () => {
  assert.deepEqual(tokenize("HD45"), ["hd", "45"]);
  assert.equal(matches("HD 45", "House District 45 Terry G. Kilgore"), true);
  assert.equal(matches("HD45", "House District 45 Terry G. Kilgore"), true);
});

test("a higher score goes to an exact committee-name phrase than to a reordered match", () => {
  const hay = "Friends of Patrick Hope";
  const exact = fuzzyScore("Patrick Hope", [{ text: hay, weight: 10 }]);
  const reordered = fuzzyScore("Hope Patrick", [{ text: hay, weight: 10 }]);
  assert.ok(exact && reordered);
  assert.ok(exact.score > reordered.score);
  assert.equal(exact.phrase, true);
  assert.equal(reordered.phrase, false);
});

test("empty or filler-only queries do not match everything", () => {
  assert.equal(fuzzyScore("", [{ text: "Friends of Patrick Hope", weight: 10 }]), null);
  assert.equal(fuzzyScore("   ", [{ text: "Friends of Patrick Hope", weight: 10 }]), null);
  assert.equal(fuzzyScore("the", [{ text: "Friends of Patrick Hope", weight: 10 }]), null);
});
