"use strict";
// Checklist Print Forge: core logic. Pure functions, no DOM, no fetch.
// The page uses pdf-lib only to render the plan this module computes.

// Parse a Markdown task list. Headings (#, ##) become sections.
// - [ ] task  / - [x] task / - task / * task all become items.
// An optional trailing (daily) or (weekly) tag sets the frequency badge.
function parseMarkdownList(text) {
  const sections = [];
  let current = null;
  function ensure(title) {
    if (!current || current.title !== title) {
      current = sections.find((s) => s.title === title);
      if (!current) { current = { title, items: [] }; sections.push(current); }
    }
    return current;
  }
  String(text || "").split(/\r?\n/).forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) { ensure(heading[1].trim()); return; }
    const item = line.match(/^[-*]\s+(?:\[( |x|X)\]\s+)?(.*)$/);
    if (item) {
      const done = item[1] === "x" || item[1] === "X";
      let task = item[2].trim();
      let frequency = "";
      const freq = task.match(/\((daily|weekly|monthly)\)\s*$/i);
      if (freq) { frequency = freq[1].toLowerCase(); task = task.slice(0, freq.index).trim(); }
      if (task) ensure(current ? current.title : "Checklist").items.push({ task, frequency, done });
      return;
    }
    // A plain line is treated as a task too.
    ensure(current ? current.title : "Checklist").items.push({ task: line, frequency: "", done: false });
  });
  return sections.filter((s) => s.items.length || sections.length === 1);
}

function parseCSVList(text) {
  const sections = [];
  const byTitle = new Map();
  function ensure(title) {
    if (!byTitle.has(title)) { const s = { title, items: [] }; byTitle.set(title, s); sections.push(s); }
    return byTitle.get(title);
  }
  const rows = String(text || "").split(/\r?\n/);
  rows.forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const parts = line.split(",").map((x) => x.trim());
    if (i === 0 && /section/i.test(parts[0]) && /task/i.test(parts[1] || "")) return; // header
    const section = parts[0] || "Checklist";
    const task = parts[1] || "";
    const frequency = (parts[2] || "").toLowerCase();
    if (task) ensure(section).items.push({ task, frequency, done: false });
  });
  return sections;
}

const PAGE_SIZES = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612, height: 792 }
};

// Layout plan: paginate sections (kept in order) into pages.
// Each page reserves: header block, footer sign-off block, and row height
// items plus section header rows. Returns pages of { type, ... } rows.
function planLayout(sections, opts) {
  const o = opts || {};
  const size = PAGE_SIZES[o.pageSize || "A4"] || PAGE_SIZES.A4;
  const margin = 40;
  const headerHeight = 64;   // title + date line
  const footerHeight = 52;   // completed-by + sign-off lines
  const sectionRowHeight = 22;
  const itemRowHeight = o.itemRowHeight || 20;
  const usable = size.height - margin * 2 - headerHeight - footerHeight;
  const pages = [];
  let page = [];
  let used = 0;
  let sectionItemNumber = 0;
  function pushPage() { if (page.length) pages.push(page); page = []; used = 0; }
  (sections || []).forEach((section) => {
    sectionItemNumber = 0;
    const headerCost = sectionRowHeight;
    if (used + headerCost > usable && page.length) pushPage();
    page.push({ type: "section", title: section.title });
    used += headerCost;
    section.items.forEach((item) => {
      sectionItemNumber++;
      if (used + itemRowHeight > usable && page.length) pushPage();
      const row = { type: "item", task: item.task, frequency: item.frequency || "", section: section.title };
      if (o.numberTasks) row.number = sectionItemNumber;
      page.push(row);
      used += itemRowHeight;
    });
  });
  pushPage();
  return {
    pageSize: o.pageSize || "A4",
    width: size.width,
    height: size.height,
    margin,
    headerHeight,
    footerHeight,
    itemRowHeight,
    pages,
    pageCount: pages.length,
    totalItems: (sections || []).reduce((a, s) => a + s.items.length, 0)
  };
}

function frequencyBadge(item) {
  const f = String(item.frequency || "").toLowerCase();
  if (f === "daily") return "DAILY";
  if (f === "weekly") return "WEEKLY";
  if (f === "monthly") return "MONTHLY";
  return "";
}

function summariseChecklist(sections) {
  const byFrequency = {};
  let total = 0;
  (sections || []).forEach((s) => s.items.forEach((it) => {
    total++;
    const f = it.frequency || "anytime";
    byFrequency[f] = (byFrequency[f] || 0) + 1;
  }));
  return { sections: (sections || []).length, totalItems: total, byFrequency };
}

const api = { parseMarkdownList, parseCSVList, PAGE_SIZES, planLayout, frequencyBadge, summariseChecklist };
if (typeof module !== "undefined" && module.exports) { module.exports = api; }
if (typeof window !== "undefined") { window.ChecklistPrintForge = api; }
