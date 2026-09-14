#!/usr/bin/env node

/**
 * Keep the shared chrome identical on every route. Each page carries marked
 * blocks; this rewrites them from scripts/page-shell.mjs. With --check it fails
 * instead of writing, so a hand-edited header can never ship half-updated.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { SHARED_BLOCKS, siteIndex } from "./page-shell.mjs";
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

const checkOnly = process.argv.includes("--check");
const changed = [];

for (const file of publicPageFiles()) {
  const name = relativePath(file);
  const route = routeForFile(file);
  const before = readFileSync(file, "utf8");
  const after = withSiteIndex(withSharedBlocks(name, before, route), route);
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
