#!/usr/bin/env node

/**
 * Keep the shared chrome identical on every route. Each page carries marked
 * blocks; this rewrites them from scripts/page-shell.mjs. With --check it fails
 * instead of writing, so a hand-edited header can never ship half-updated.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { SHARED_BLOCKS, crisisBlock, insuranceCover, reachBlock, relatedNav, siteIndex } from "./page-shell.mjs";
import { publicPageFiles, relativePath, routeForFile } from "./static-site.mjs";

const blockPattern = (marker) =>
  new RegExp(`[ \\t]*<!-- ${marker}:start -->[\\s\\S]*?<!-- ${marker}:end -->`, "g");

const withSharedBlocks = (name, html, route) =>
  SHARED_BLOCKS.reduce((current, { marker, render }) => {
    const pattern = blockPattern(marker);
    if (!pattern.test(current)) throw new Error(`${name}: missing ${marker} block`);
    return current.replace(blockPattern(marker), render(route));
  }, html);

const withSiteIndex = (html, route) =>
  route === "/sitemap/" ? html.replace(blockPattern("site-index"), siteIndex()) : html;

// Route-conditional like the site index: only the pages that carry the marker
// get the block, and a page carrying one must resolve to content, or the block
// would silently empty itself.
const withRelatedNav = (name, html, route) => {
  const pattern = blockPattern("related-nav");
  if (!pattern.test(html)) return html;
  const block = relatedNav(route);
  if (!block) throw new Error(`${name}: has a related-nav block but no related links for ${route}`);
  return html.replace(blockPattern("related-nav"), block);
};

const withReach = (html, route) => {
  const pattern = blockPattern("reach");
  return pattern.test(html) ? html.replace(blockPattern("reach"), reachBlock(route)) : html;
};

const withCrisisBlock = (html) => {
  const pattern = blockPattern("crisis-support");
  return pattern.test(html) ? html.replace(blockPattern("crisis-support"), crisisBlock()) : html;
};

const withInsuranceCover = (name, html, route) => {
  const pattern = blockPattern("insurance-cover");
  if (!pattern.test(html)) return html;
  const block = insuranceCover(route);
  if (!block) throw new Error(`${name}: has an insurance-cover block but no plans for ${route}`);
  return html.replace(blockPattern("insurance-cover"), block);
};

const checkOnly = process.argv.includes("--check");
const changed = [];

for (const file of publicPageFiles()) {
  const name = relativePath(file);
  const route = routeForFile(file);
  const before = readFileSync(file, "utf8");
  const shell = withSiteIndex(withSharedBlocks(name, before, route), route);
  const after = withReach(withCrisisBlock(withRelatedNav(name, withInsuranceCover(name, shell, route), route)), route);
  if (after === before) continue;
  changed.push(name);
  if (!checkOnly) writeFileSync(file, after);
}

if (checkOnly && changed.length > 0) {
  process.stderr.write(`Shared page components are out of sync:\n${changed.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    changed.length > 0
      ? `Synchronized shared components in ${changed.length} pages.\n`
      : "Shared page components are synchronized.\n",
  );
}
