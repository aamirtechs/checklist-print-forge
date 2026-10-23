"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../src/logic.js");

const MD = [
  "# Opening",
  "- [ ] Unlock the front door",
  "- [ ] Switch on lights (daily)",
  "- [x] Check the till float",
  "",
  "## Closing",
  "- [ ] Clean counters (daily)",
  "- Deep clean the fridge (weekly)"
].join("\n");

test("parseMarkdownList groups items under heading sections", () => {
  const sections = L.parseMarkdownList(MD);
  assert.equal(sections.length, 2);
  assert.equal(sections[0].title, "Opening");
  assert.equal(sections[0].items.length, 3);
  assert.equal(sections[1].items.length, 2);
});

test("parseMarkdownList reads checkbox state and frequency tags", () => {
  const sections = L.parseMarkdownList(MD);
  assert.equal(sections[0].items[2].done, true);
  assert.equal(sections[0].items[1].frequency, "daily");
  assert.equal(sections[0].items[1].task, "Switch on lights");
  assert.equal(sections[1].items[1].frequency, "weekly");
});

test("parseMarkdownList puts headingless items in a default section", () => {
  const sections = L.parseMarkdownList("- [ ] One\n- [ ] Two");
  assert.equal(sections.length, 1);
  assert.equal(sections[0].items.length, 2);
});

test("parseCSVList parses section, task, frequency rows and skips a header", () => {
  const csv = "section,task,frequency\nOpening,Unlock door,daily\nOpening,Lights on,daily\nClosing,Lock up,\n";
  const sections = L.parseCSVList(csv);
  assert.equal(sections.length, 2);
  assert.equal(sections[0].items[0].frequency, "daily");
  assert.equal(sections[1].items[0].task, "Lock up");
});

test("planLayout keeps a short list on one A4 page", () => {
  const plan = L.planLayout(L.parseMarkdownList(MD), { pageSize: "A4" });
  assert.equal(plan.pageCount, 1);
  assert.equal(plan.totalItems, 5);
  assert.equal(plan.width, 595.28);
});

test("planLayout paginates a long list and reports page geometry", () => {
  const items = Array.from({ length: 60 }, (_, i) => ({ task: "Task " + (i + 1), frequency: "" }));
  const plan = L.planLayout([{ title: "Big list", items }], { pageSize: "Letter" });
  assert.ok(plan.pageCount >= 3, "expected at least 3 pages, got " + plan.pageCount);
  const planned = plan.pages.reduce((a, p) => a + p.filter((r) => r.type === "item").length, 0);
  assert.equal(planned, 60);
  assert.equal(plan.height, 792);
});

test("frequencyBadge maps frequencies to print labels", () => {
  assert.equal(L.frequencyBadge({ frequency: "daily" }), "DAILY");
  assert.equal(L.frequencyBadge({ frequency: "weekly" }), "WEEKLY");
  assert.equal(L.frequencyBadge({ frequency: "" }), "");
});

test("summariseChecklist counts items per frequency", () => {
  const s = L.summariseChecklist(L.parseMarkdownList(MD));
  assert.equal(s.totalItems, 5);
  assert.equal(s.byFrequency.daily, 2);
  assert.equal(s.byFrequency.weekly, 1);
});
