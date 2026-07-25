#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { extname } from "node:path";

const checkOnly = process.argv.includes("--check");
const root = process.cwd();

const categoryOrder = [
  {
    id: "java-runtime",
    name: "Java, Runtime & Backend",
    summary: "Core Java internals, concurrency, GC, and backend framework notes.",
    accent: "red",
  },
  {
    id: "platform",
    name: "Containers & Platform",
    summary: "Docker, Kubernetes, Linux isolation, and production compute allocation.",
    accent: "blue",
  },
  {
    id: "data-systems",
    name: "Distributed Data & Storage",
    summary: "Databases, streaming systems, caching, and real-time data processing.",
    accent: "green",
  },
  {
    id: "system-design",
    name: "System Design & Scale",
    summary: "High-level design walkthroughs, estimates, tradeoffs, and failure cases.",
    accent: "amber",
  },
  {
    id: "frontend-interviews",
    name: "Frontend & Interview Prep",
    summary: "Frontend fundamentals, browser behavior, React, and focused interview prep.",
    accent: "purple",
  },
  {
    id: "learning-paths",
    name: "Languages & Learning Paths",
    summary: "Structured roadmaps and long-form study plans.",
    accent: "purple",
  },
  {
    id: "other",
    name: "Other Notes",
    summary: "Everything else that is tracked in the repo.",
    accent: "slate",
  },
];

const knownPages = {
  "billion_data_computation_hld.html": {
    category: "system-design",
    title: "Real-time Updates at 1B Users",
    focus: "Kafka, fan-out, delayed delivery, dedupe fences, and WebSocket/SSE scale.",
    format: "HLD lesson",
    rank: 10,
  },
  "url_shortener_notion.html": {
    category: "system-design",
    title: "URL Shortener HLD",
    focus: "Capacity estimates, hash collisions, ID pools, redirect paths, and schema design.",
    format: "System design",
    rank: 20,
  },
  "database-notes.html": {
    category: "data-systems",
    title: "Database Systems",
    focus: "Postgres, Cassandra, Dynamo, RocksDB, Druid, and storage tradeoffs.",
    format: "Study notes",
    rank: 10,
  },
  "realtime-data-processing-notes.html": {
    category: "data-systems",
    title: "Real-time Distributed Data Processing",
    focus: "Kafka, Flink, Spark, RocksDB, leaderboards, and storage decision guides.",
    format: "Study notes",
    rank: 20,
  },
  "kafka-complete-reference.html": {
    category: "data-systems",
    title: "Kafka Complete Reference",
    focus: "Commit logs, partitions, replication, consumer groups, offsets, delivery guarantees, and FoodFlash design tradeoffs.",
    format: "Complete reference",
    rank: 30,
  },
  "redis-reference.html": {
    category: "data-systems",
    title: "Redis Reference",
    focus: "Data structures, command complexity, memory internals, caching patterns, and FoodFlash design tradeoffs.",
    format: "Complete reference",
    rank: 40,
  },
  "kafka-consumer-group-workshop/README.md": {
    category: "data-systems",
    title: "Kafka Consumer Group Workshop",
    focus: "Runnable KRaft lab for consumer groups, partition ownership, offsets, lag, and rebalance behavior.",
    format: "Workshop",
    rank: 50,
  },
  "kafka-consumer-group-workshop/COMMANDS.md": {
    category: "data-systems",
    title: "Kafka Consumer Group Commands",
    focus: "Step-by-step CLI experiments for consumer groups, offsets, committed offsets, lag, and slow consumers.",
    format: "Runbook",
    rank: 51,
  },
  "kafka-consumer-group-workshop/TROUBLESHOOTING.md": {
    category: "data-systems",
    title: "Kafka Workshop Troubleshooting",
    focus: "Fixes for common Docker, Kafka startup, topic, offset, and Python client issues.",
    format: "Troubleshooting",
    rank: 52,
  },
  "docker-mastery-guide.html": {
    category: "platform",
    title: "Docker Mastery",
    focus: "OS processes, images, namespaces, cgroups, networking, security, and deployment.",
    format: "Senior guide",
    rank: 10,
  },
  "docker-k8s-summary.html": {
    category: "platform",
    title: "Docker & Kubernetes",
    focus: "Container basics, cluster architecture, API gateways, and production kubectl flows.",
    format: "Visual summary",
    rank: 20,
  },
  "uber-hybrid-cpu-docs.html": {
    category: "platform",
    title: "Uber Hybrid Core Allocation",
    focus: "cgroups, cpusets, NUMA, CPU sharing, and platform reliability tradeoffs.",
    format: "Technical deep dive",
    rank: 30,
  },
  "gc_full_interactive.html": {
    category: "java-runtime",
    title: "Java GC Interactive Notes",
    focus: "Mark and sweep, tri-color marking, G1 regions, TLABs, barriers, and safepoints.",
    format: "Interactive explainer",
    rank: 10,
  },
  "gc_notion_notes.html": {
    category: "java-runtime",
    title: "Java GC Interview Notes",
    focus: "Generational GC, G1, ZGC, failure modes, commands, and interview framing.",
    format: "Interview notes",
    rank: 20,
  },
  "hashmap_internals.html": {
    category: "java-runtime",
    title: "HashMap & HashSet Internals",
    focus: "Hashing, collisions, resize, treeify, CHM, CAS, false sharing, and gotchas.",
    format: "Deep reference",
    rank: 30,
  },
  "concurrent_hashmap_diagram.html": {
    category: "java-runtime",
    title: "ConcurrentHashMap Diagram",
    focus: "Segmented architecture and write-flow visuals for ConcurrentHashMap internals.",
    format: "Diagram",
    rank: 40,
  },
  "spring-notes.html": {
    category: "java-runtime",
    title: "Spring Framework",
    focus: "Core Spring concepts and backend framework study notes.",
    format: "Study notes",
    rank: 50,
  },
  "go-learning/README.md": {
    category: "learning-paths",
    title: "Go Learning Roadmap",
    focus: "A 24-week path from beginner Go through runtime internals and production projects.",
    format: "Roadmap",
    rank: 10,
  },
  "dlyprb-frontend-interview-notes.html": {
    category: "frontend-interviews",
    title: "dlyPrb Frontend Interview Notes",
    focus: "JavaScript, React, browser APIs, performance, security, rendering strategies, and frontend HLD prompts.",
    format: "Interview guide",
    rank: 10,
  },
};

function gitTrackedFiles() {
  try {
    return execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" })
      .split("\n")
      .map((file) => file.trim())
      .filter(Boolean);
  } catch {
    return Object.keys(knownPages).filter((file) => existsSync(file));
  }
}

function decodeBasicEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function titleFromFile(file) {
  const text = readFileSync(file, "utf8");

  if (extname(file) === ".md") {
    const heading = text.match(/^#\s+(.+)$/m);
    if (heading) return heading[1].trim();
  }

  const title = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return decodeBasicEntities(stripTags(title[1]));

  const h1 = text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return decodeBasicEntities(stripTags(h1[1]));

  return file
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function inferCategory(file, title) {
  const key = `${file} ${title}`.toLowerCase();

  if (/(gc|java|hashmap|hashset|concurrenthashmap|spring|cas|jvm)/.test(key)) {
    return "java-runtime";
  }
  if (/(docker|kubernetes|k8s|cpu|cgroup|container|platform|numa)/.test(key)) {
    return "platform";
  }
  if (/(database|postgres|cassandra|dynamo|rocksdb|druid|kafka|redis|flink|spark|data)/.test(key)) {
    return "data-systems";
  }
  if (/(hld|system design|url|scale|architecture|shortener|billion)/.test(key)) {
    return "system-design";
  }
  if (/(go|roadmap|learning|readme)/.test(key)) {
    return "learning-paths";
  }

  return "other";
}

function fallbackFocus(categoryId) {
  const category = categoryOrder.find((item) => item.id === categoryId);
  return category ? category.summary : "Study note tracked in this repository.";
}

function toPage(file) {
  const configured = knownPages[file] ?? {};
  const title = configured.title ?? titleFromFile(file);
  const category = configured.category ?? inferCategory(file, title);

  return {
    file,
    href: encodeURI(file),
    category,
    title,
    focus: configured.focus ?? fallbackFocus(category),
    format: configured.format ?? (extname(file) === ".md" ? "Markdown note" : "HTML note"),
    rank: configured.rank ?? 1000,
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sectionFor(category, pages) {
  const rows = pages
    .map(
      (page) => `          <tr>
            <th scope="row"><a href="${escapeHtml(page.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(page.title)}</a></th>
            <td>${escapeHtml(page.focus)}</td>
            <td><span class="pill ${escapeHtml(category.accent)}">${escapeHtml(page.format)}</span></td>
            <td class="path"><a href="${escapeHtml(page.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(page.file)}</a></td>
          </tr>`
    )
    .join("\n");

  return `      <section class="topic-section" id="${escapeHtml(category.id)}">
        <div class="section-heading">
          <div>
            <p class="section-kicker">${escapeHtml(pages.length)} ${pages.length === 1 ? "resource" : "resources"}</p>
            <h2>${escapeHtml(category.name)}</h2>
          </div>
          <p>${escapeHtml(category.summary)}</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Topic</th>
                <th scope="col">Focus</th>
                <th scope="col">Format</th>
                <th scope="col">Source</th>
              </tr>
            </thead>
            <tbody>
${rows}
            </tbody>
          </table>
        </div>
      </section>`;
}

function buildIndex() {
  const pages = gitTrackedFiles()
    .filter((file) => file !== "index.html")
    .filter((file) => [".html", ".md"].includes(extname(file)))
    .filter((file) => existsSync(file))
    .map(toPage)
    .sort((a, b) => a.category.localeCompare(b.category) || a.rank - b.rank || a.title.localeCompare(b.title));

  const grouped = new Map(categoryOrder.map((category) => [category.id, []]));
  for (const page of pages) {
    if (!grouped.has(page.category)) grouped.set(page.category, []);
    grouped.get(page.category).push(page);
  }

  const activeCategories = categoryOrder.filter((category) => grouped.get(category.id)?.length);
  const categoryLinks = activeCategories
    .map((category) => {
      const count = grouped.get(category.id).length;
      return `          <a href="#${escapeHtml(category.id)}">
            <span>${escapeHtml(category.name)}</span>
            <strong>${count}</strong>
          </a>`;
    })
    .join("\n");

  const sections = activeCategories
    .map((category) => sectionFor(category, grouped.get(category.id)))
    .join("\n\n");

  return `<!DOCTYPE html>
<!-- Generated by scripts/build-index.mjs. Do not edit by hand. -->
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Notion Notes</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f8fafc;
      --surface: #ffffff;
      --surface-2: #f1f5f9;
      --text: #172033;
      --muted: #64748b;
      --line: #d7dee8;
      --line-strong: #b7c2d0;
      --blue: #1d4ed8;
      --green: #047857;
      --red: #b42318;
      --amber: #a16207;
      --purple: #6d28d9;
      --slate: #475569;
      --shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
    }

    * {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }

    a {
      color: inherit;
      text-decoration-thickness: 1px;
      text-underline-offset: 0.2em;
    }

    a:hover,
    a:focus-visible {
      color: var(--blue);
    }

    .page {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
      padding: 40px 0 56px;
    }

    header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(240px, 360px);
      gap: 28px;
      align-items: end;
      padding: 0 0 28px;
      border-bottom: 1px solid var(--line);
    }

    .eyebrow {
      margin: 0 0 10px;
      color: var(--green);
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      max-width: 760px;
      font-size: clamp(2.4rem, 6vw, 4.8rem);
      line-height: 1;
      letter-spacing: 0;
    }

    .intro {
      max-width: 760px;
      margin: 16px 0 0;
      color: var(--muted);
      font-size: 1.04rem;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      border: 1px solid var(--line);
      background: var(--surface);
      box-shadow: var(--shadow);
    }

    .stat {
      min-height: 92px;
      padding: 16px;
      border-right: 1px solid var(--line);
    }

    .stat:last-child {
      border-right: 0;
    }

    .stat strong {
      display: block;
      font-size: 1.45rem;
      line-height: 1.1;
    }

    .stat span {
      display: block;
      margin-top: 6px;
      color: var(--muted);
      font-size: 0.82rem;
    }

    .layout {
      display: grid;
      grid-template-columns: 260px minmax(0, 1fr);
      gap: 24px;
      align-items: start;
      padding-top: 28px;
    }

    .toc {
      position: sticky;
      top: 20px;
      border: 1px solid var(--line);
      background: var(--surface);
    }

    .toc h2 {
      margin: 0;
      padding: 14px 16px;
      border-bottom: 1px solid var(--line);
      font-size: 0.88rem;
      text-transform: uppercase;
      letter-spacing: 0;
    }

    .toc a {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      min-height: 48px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--line);
      color: var(--text);
      text-decoration: none;
      font-size: 0.92rem;
    }

    .toc a:last-child {
      border-bottom: 0;
    }

    .toc a:hover,
    .toc a:focus-visible {
      background: var(--surface-2);
      color: var(--blue);
      outline: none;
    }

    .toc strong {
      min-width: 28px;
      border: 1px solid var(--line-strong);
      padding: 2px 8px;
      text-align: center;
      font-size: 0.78rem;
      color: var(--muted);
    }

    .content {
      display: grid;
      gap: 26px;
    }

    .topic-section {
      border-top: 3px solid var(--text);
      background: var(--surface);
      box-shadow: var(--shadow);
    }

    .section-heading {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(220px, 420px);
      gap: 20px;
      padding: 22px 24px;
      border-bottom: 1px solid var(--line);
    }

    .section-heading h2 {
      margin: 0;
      font-size: 1.35rem;
      line-height: 1.2;
      letter-spacing: 0;
    }

    .section-heading p {
      margin: 0;
      color: var(--muted);
      font-size: 0.95rem;
    }

    .section-kicker {
      margin: 0 0 6px;
      color: var(--green);
      font-size: 0.74rem;
      font-weight: 800;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }

    th,
    td {
      padding: 15px 18px;
      border-bottom: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
      font-size: 0.94rem;
    }

    thead th {
      background: var(--surface-2);
      color: var(--muted);
      font-size: 0.76rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0;
    }

    tbody tr:last-child th,
    tbody tr:last-child td {
      border-bottom: 0;
    }

    tbody th {
      width: 26%;
      font-weight: 700;
      line-height: 1.35;
    }

    tbody td {
      color: var(--muted);
    }

    .path {
      width: 24%;
      color: var(--slate);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 0.8rem;
      overflow-wrap: anywhere;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      padding: 4px 9px;
      border: 1px solid currentColor;
      font-size: 0.78rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .blue { color: var(--blue); }
    .green { color: var(--green); }
    .red { color: var(--red); }
    .amber { color: var(--amber); }
    .purple { color: var(--purple); }
    .slate { color: var(--slate); }

    @media (max-width: 860px) {
      header,
      .layout,
      .section-heading {
        grid-template-columns: 1fr;
      }

      .toc {
        position: static;
      }

      .stats {
        grid-template-columns: 1fr;
      }

      .stat {
        border-right: 0;
        border-bottom: 1px solid var(--line);
      }

      .stat:last-child {
        border-bottom: 0;
      }
    }

    @media (max-width: 640px) {
      .page {
        width: min(100% - 24px, 1180px);
        padding: 28px 0 40px;
      }

      header {
        gap: 20px;
      }

      .section-heading {
        padding: 18px 16px;
      }

      table,
      thead,
      tbody,
      tr,
      th,
      td {
        display: block;
      }

      thead {
        display: none;
      }

      tbody tr {
        border-bottom: 1px solid var(--line);
        padding: 14px 16px;
      }

      tbody tr:last-child {
        border-bottom: 0;
      }

      th,
      td {
        border-bottom: 0;
        padding: 4px 0;
      }

      tbody th,
      .path {
        width: auto;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <header>
      <div>
        <p class="eyebrow">Study index</p>
        <h1>Notion Notes</h1>
        <p class="intro">A maintained table of contents for the HTML notes, interactive explainers, and learning roadmaps in this repository.</p>
      </div>
      <div class="stats" aria-label="Index summary">
        <div class="stat">
          <strong>${pages.length}</strong>
          <span>Total resources</span>
        </div>
        <div class="stat">
          <strong>${activeCategories.length}</strong>
          <span>Topic groups</span>
        </div>
        <div class="stat">
          <strong>Auto</strong>
          <span>Rebuilt from tracked files</span>
        </div>
      </div>
    </header>

    <div class="layout">
      <nav class="toc" aria-label="Topic groups">
        <h2>Topic Groups</h2>
${categoryLinks}
      </nav>

      <div class="content">
${sections}
      </div>
    </div>
  </main>
</body>
</html>
`;
}

const nextIndex = buildIndex();
const currentIndex = existsSync("index.html") ? readFileSync("index.html", "utf8") : "";

if (checkOnly) {
  if (currentIndex !== nextIndex) {
    console.error("index.html is stale.");
    console.error("Run: node scripts/build-index.mjs");
    console.error("Then commit the regenerated index before pushing.");
    process.exit(1);
  }
  console.log("index.html is current.");
} else {
  writeFileSync("index.html", nextIndex);
  console.log("Updated index.html");
}
