#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const checkOnly = process.argv.includes("--check");
const printChanged = process.argv.includes("--print-changed");
const root = process.cwd();

const CSS_START = "/* NOTE_LEFT_NAV_CSS_START */";
const CSS_END = "/* NOTE_LEFT_NAV_CSS_END */";
const SCRIPT_START = "<!-- NOTE_LEFT_NAV_SCRIPT_START -->";
const SCRIPT_END = "<!-- NOTE_LEFT_NAV_SCRIPT_END -->";

const navCss = `${CSS_START}
:root {
  --note-left-nav-width: 260px;
}

body.note-left-nav-ready {
  margin-left: var(--note-left-nav-width);
}

.note-left-nav {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 9999;
  width: var(--note-left-nav-width);
  display: flex;
  flex-direction: column;
  background: var(--bg2, var(--surface, #ffffff));
  border-right: 1px solid var(--border, rgba(15, 23, 42, 0.14));
  box-shadow: 10px 0 30px rgba(15, 23, 42, 0.08);
}

.note-left-nav__header {
  padding: 18px 16px 14px;
  border-bottom: 1px solid var(--border, rgba(15, 23, 42, 0.14));
}

.note-left-nav__eyebrow {
  margin: 0 0 5px;
  color: var(--text3, var(--muted, #64748b));
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.note-left-nav__title {
  margin: 0;
  color: var(--text, #172033);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.25;
}

.note-left-nav__home {
  display: inline-flex;
  margin-top: 12px;
  color: var(--blue, var(--accent, #2563eb));
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.note-left-nav__home:hover,
.note-left-nav__home:focus-visible {
  text-decoration: underline;
  outline: none;
}

.note-left-nav__links {
  overflow-y: auto;
  padding: 10px 8px 18px;
}

.note-left-nav__link {
  display: block;
  padding: 8px 10px;
  border-left: 2px solid transparent;
  border-radius: 0 6px 6px 0;
  color: var(--text2, var(--muted, #64748b));
  font-size: 12px;
  line-height: 1.35;
  text-decoration: none;
}

.note-left-nav__link:hover,
.note-left-nav__link:focus-visible {
  background: var(--bg3, rgba(15, 23, 42, 0.06));
  color: var(--text, #172033);
  outline: none;
}

.note-left-nav__link.is-active {
  border-left-color: var(--blue, var(--accent, #2563eb));
  background: var(--blue-bg, rgba(37, 99, 235, 0.10));
  color: var(--text, #172033);
  font-weight: 700;
}

.note-left-nav-toggle {
  position: fixed;
  left: 12px;
  bottom: 12px;
  z-index: 10000;
  display: none;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border, rgba(15, 23, 42, 0.14));
  border-radius: 8px;
  background: var(--bg2, #ffffff);
  color: var(--text, #172033);
  font: 700 12px/1 var(--font, system-ui, sans-serif);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.18);
}

@media (max-width: 980px) {
  body.note-left-nav-ready {
    margin-left: 0;
  }

  .note-left-nav {
    transform: translateX(-100%);
    transition: transform 180ms ease;
  }

  .note-left-nav.is-open {
    transform: translateX(0);
  }

  .note-left-nav-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

@media print {
  body.note-left-nav-ready {
    margin-left: 0;
  }

  .note-left-nav,
  .note-left-nav-toggle {
    display: none !important;
  }
}
${CSS_END}`;

const navScript = `${SCRIPT_START}
<script>
(function () {
  function slugify(value) {
    var slug = value.toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9\\s-]/g, "")
      .trim()
      .replace(/\\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 72);
    return slug || "section";
  }

  function ensureId(heading, used) {
    if (heading.id) {
      used[heading.id] = true;
      return heading.id;
    }

    var base = slugify(heading.textContent || "section");
    var id = base;
    var next = 2;
    while (used[id] || document.getElementById(id)) {
      id = base + "-" + next;
      next += 1;
    }
    heading.id = id;
    used[id] = true;
    return id;
  }

  function initNoteNav() {
    if (document.querySelector(".note-left-nav")) return;

    var headings = Array.prototype.slice.call(document.querySelectorAll("h2"))
      .filter(function (heading) {
        return !heading.closest("nav, aside, header, .toc, .note-left-nav");
      });

    if (headings.length < 2) return;

    var used = {};
    Array.prototype.forEach.call(document.querySelectorAll("[id]"), function (node) {
      used[node.id] = true;
    });

    var titleNode = document.querySelector("h1");
    var title = titleNode ? titleNode.textContent.trim() : (document.title || "Note");

    var nav = document.createElement("nav");
    nav.className = "note-left-nav";
    nav.setAttribute("aria-label", "Page sections");

    var header = document.createElement("div");
    header.className = "note-left-nav__header";
    header.innerHTML =
      '<p class="note-left-nav__eyebrow">On this page</p>' +
      '<p class="note-left-nav__title"></p>' +
      '<a class="note-left-nav__home" href="index.html">Notes index</a>';
    header.querySelector(".note-left-nav__title").textContent = title;
    nav.appendChild(header);

    var links = document.createElement("div");
    links.className = "note-left-nav__links";
    var linkNodes = headings.map(function (heading) {
      var id = ensureId(heading, used);
      var link = document.createElement("a");
      link.className = "note-left-nav__link";
      link.href = "#" + id;
      link.textContent = heading.textContent.trim().replace(/\\s+/g, " ");
      links.appendChild(link);
      return link;
    });
    nav.appendChild(links);

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "note-left-nav-toggle";
    toggle.setAttribute("aria-label", "Toggle page navigation");
    toggle.textContent = "Contents";
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) nav.classList.remove("is-open");
    });

    document.body.classList.add("note-left-nav-ready");
    document.body.prepend(nav);
    document.body.appendChild(toggle);

    function setActive(id) {
      linkNodes.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
      });
    }

    setActive(headings[0].id);

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      }, { rootMargin: "-20% 0px -65% 0px", threshold: 0.01 });

      headings.forEach(function (heading) { observer.observe(heading); });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNoteNav);
  } else {
    initNoteNav();
  }
}());
</script>
${SCRIPT_END}`;

function gitTrackedHtmlFiles() {
  return execFileSync("git", ["ls-files", "*.html"], { cwd: root, encoding: "utf8" })
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean)
    .filter((file) => file !== "index.html")
    .filter((file) => existsSync(file));
}

function hasExistingLeftNav(html) {
  return /<nav[^>]+(?:class="[^"]*\bsidebar\b|id="sidebar"|id="sb")/i.test(html) ||
    /<aside[^>]+(?:class="[^"]*\bsb\b|id="sb")/i.test(html);
}

function hasEnoughHeadings(html) {
  const matches = html.match(/<h2\b/gi);
  return matches && matches.length >= 2;
}

function replaceBetween(html, start, end, replacement) {
  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) return null;
  return html.slice(0, startIndex) + replacement + html.slice(endIndex + end.length);
}

function upsertCss(html) {
  const replaced = replaceBetween(html, CSS_START, CSS_END, navCss);
  if (replaced) return replaced;

  const headClose = html.indexOf("</head>");
  if (headClose === -1) return html;

  const head = html.slice(0, headClose);
  const lastStyleClose = head.lastIndexOf("</style>");
  if (lastStyleClose !== -1) {
    return html.slice(0, lastStyleClose) + "\n\n" + navCss + "\n" + html.slice(lastStyleClose);
  }

  return html.slice(0, headClose) + `<style>\n${navCss}\n</style>\n` + html.slice(headClose);
}

function upsertScript(html) {
  const replaced = replaceBetween(html, SCRIPT_START, SCRIPT_END, navScript);
  if (replaced) return replaced;

  const bodyClose = html.lastIndexOf("</body>");
  if (bodyClose === -1) return html + "\n" + navScript + "\n";

  return html.slice(0, bodyClose) + "\n" + navScript + "\n" + html.slice(bodyClose);
}

function enhance(html) {
  let next = upsertCss(html);
  next = upsertScript(next);
  return next;
}

const changed = [];

for (const file of gitTrackedHtmlFiles()) {
  const html = readFileSync(file, "utf8");
  const alreadyManaged = html.includes(SCRIPT_START);
  if (!alreadyManaged && (hasExistingLeftNav(html) || !hasEnoughHeadings(html))) continue;

  const next = enhance(html);
  if (next !== html) {
    changed.push(file);
    if (!checkOnly) writeFileSync(file, next);
  }
}

if (checkOnly) {
  if (changed.length) {
    console.error("Generated left navigation is stale in:");
    for (const file of changed) console.error(`- ${file}`);
    console.error("Run: node scripts/enhance-note-nav.mjs");
    process.exit(1);
  }
  console.log("Generated left navigation is current.");
} else if (printChanged) {
  process.stdout.write(changed.join("\n"));
  if (changed.length) process.stdout.write("\n");
} else if (changed.length) {
  console.log(`Updated generated left navigation in ${changed.length} file${changed.length === 1 ? "" : "s"}.`);
} else {
  console.log("Generated left navigation is current.");
}
