#!/usr/bin/env node
/**
 * Docs integrity gate (runs in prebuild). Fails the build on navigation/content
 * drift, broken internal links, malformed frontmatter, unclosed code fences,
 * banned branding terms, or missing canonical deployment addresses.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content", "docs");
const failures = [];

// --- navigation source of truth, parsed from navigation.ts ---
const navSource = readFileSync(path.join(root, "src", "docs", "navigation.ts"), "utf8");
const navEntries = [...navSource.matchAll(/page\(\s*"((?:[^"\\]|\\.)*)",\s*"([^"]*)",\s*"([^"]+)",\s*"([^"]+)",?\s*\)/g)].map(
  (m) => ({ title: m[1], slug: m[2], file: m[3], section: m[4] }),
);
if (navEntries.length !== 30) {
  failures.push(`navigation.ts: expected 30 page() entries (29 section pages + home), found ${navEntries.length}`);
}

const routes = new Set(navEntries.map((e) => (e.slug === "" ? "/docs" : `/docs/${e.slug}`)));
const slugs = navEntries.map((e) => e.slug);
if (new Set(slugs).size !== slugs.length) failures.push("navigation.ts: duplicate slugs");
const files = navEntries.map((e) => e.file);
if (new Set(files).size !== files.length) failures.push("navigation.ts: duplicate files");

// --- nav <-> content parity ---
for (const entry of navEntries) {
  if (!existsSync(path.join(contentDir, `${entry.file}.mdx`))) {
    failures.push(`navigation entry without MDX file: ${entry.file}.mdx`);
  }
}
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith(".mdx") ? [full] : [];
  });
}
const mdxFiles = walk(contentDir);
for (const file of mdxFiles) {
  const rel = path.relative(contentDir, file).replace(/\.mdx$/, "");
  if (!files.includes(rel)) failures.push(`MDX file missing from navigation: ${rel}.mdx`);
}

// --- per-file content checks ---
const titles = new Map();
const canonicalAddresses = [
  "0x9aa544248A29dda2d6272f881789877a7F289452",
  "0x9A22ec3AD6C9Bbf1902e61cBE06CA69a1c582F92",
  "0xa5eBe0E8564396F2A92e3048efe4fD63067ec55a",
  "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  "0x14A34367a552e40B136Ac4b8c3E3970Be2d6eE77",
  "0xE6690Ba148951140924DEE34415C4e49ADF6c1Ea",
  "0xCcf59B627b7e5b960A7261a019B936311eeEB04b",
  "0xBE1EE4976282713399FD460D0E1B30bFddfF0e88",
];

for (const file of mdxFiles) {
  const rel = path.relative(contentDir, file);
  const raw = readFileSync(file, "utf8");
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) {
    failures.push(`${rel}: missing frontmatter`);
    continue;
  }
  const title = fm[1].match(/^title:\s*"(.+)"\s*$/m)?.[1];
  if (!title) failures.push(`${rel}: missing frontmatter title`);
  else if (titles.has(title)) failures.push(`${rel}: duplicate title "${title}" (also in ${titles.get(title)})`);
  else titles.set(title, rel);
  for (const key of ["description", "section", "order"]) {
    if (!new RegExp(`^${key}:`, "m").test(fm[1])) failures.push(`${rel}: missing frontmatter ${key}`);
  }

  const fenceCount = (raw.match(/^\s*```/gm) ?? []).length;
  if (fenceCount % 2 !== 0) failures.push(`${rel}: unclosed fenced code block`);

  for (const link of raw.matchAll(/\]\((\/docs[^)#\s]*)/g)) {
    if (!routes.has(link[1])) failures.push(`${rel}: broken internal link ${link[1]}`);
  }

  if (rel === "networks-and-deployments/contract-addresses.mdx") {
    for (const address of canonicalAddresses) {
      if (!raw.includes(address)) failures.push(`${rel}: missing canonical address ${address}`);
    }
  }
}

// --- banned terms and internal references across the public implementation ---
const bannedDirs = ["app/docs", "src/components/docs", "src/docs", "content/docs", "public/brand"];
const bannedTerms = [/peridot/i, /gitbook/i];
const internalRefs = [/mainnet-readiness-plan/, /contracts-session-brief/, /deploy-digitalocean/, /docs\/screenshots/];
for (const dir of bannedDirs) {
  const full = path.join(root, dir);
  if (!existsSync(full)) continue;
  const all = readdirSync(full, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath ?? entry.path, entry.name));
  for (const file of all) {
    if (/\.(png|webp|ico|jpg)$/.test(file)) continue;
    const raw = readFileSync(file, "utf8");
    for (const term of bannedTerms) {
      if (term.test(raw)) failures.push(`${path.relative(root, file)}: banned public-brand term ${term}`);
    }
    for (const ref of internalRefs) {
      if (ref.test(raw)) failures.push(`${path.relative(root, file)}: unexpected internal file reference ${ref}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`docs:check FAILED (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(`docs:check passed: ${navEntries.length} routes, ${mdxFiles.length} MDX files, links/frontmatter/fences/brand clean`);
