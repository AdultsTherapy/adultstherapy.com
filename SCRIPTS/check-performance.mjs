#!/usr/bin/env node

/** Budgets that keep the normalized static pages small and dependency-light. */

import { existsSync, readFileSync, statSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { ROOT, publicAssetFiles, publicPageFiles } from "./static-site.mjs";

const MAX_HTML_BYTES = 80_000;
const MAX_TOTAL_HTML_BYTES = 600_000;
const MAX_STYLE_ATTRIBUTES = 24;
const MAX_IMAGE_BYTES = 900_000;
const MAX_TOTAL_IMAGE_BYTES = 16_000_000;
const ASSET_BUDGETS = Object.freeze({
  "assets/site.css": 64_000,
  "assets/site.js": 32_000,
  "assets/fontawesome.css": 16_000,
});
const failures = [];
const pages = publicPageFiles();
let totalHtmlBytes = 0;

for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const name = relative(ROOT, file).split(sep).join("/");
  const bytes = statSync(file).size;
  totalHtmlBytes += bytes;

  if (bytes > MAX_HTML_BYTES) failures.push(`${name}: ${bytes} HTML bytes exceeds ${MAX_HTML_BYTES}`);
  if (/<style\b/i.test(html)) failures.push(`${name}: inline style block bypasses the shared stylesheet`);
  const styleAttributes = [...html.matchAll(/\sstyle=["']/gi)].length;
  if (styleAttributes > MAX_STYLE_ATTRIBUTES) {
    failures.push(`${name}: ${styleAttributes} style attributes exceeds ${MAX_STYLE_ATTRIBUTES}`);
  }
  if (/\bsrcset=["']/i.test(html)) failures.push(`${name}: responsive WordPress image variants remain`);

  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const runtimeScripts = scripts.filter((match) => /\bsrc=["']/i.test(match[1]));
  const inlineExecutables = scripts.filter(
    (match) =>
      !/\bsrc=["']/i.test(match[1]) &&
      !/\btype=["']application\/ld\+json["']/i.test(match[1]) &&
      match[2].trim(),
  );
  if (runtimeScripts.length !== 1) failures.push(`${name}: expected one shared runtime script`);
  if (inlineExecutables.length > 0) failures.push(`${name}: contains inline executable JavaScript`);
  if (/googletagmanager\.com\/gtag\/js|gtag\(["']config["']|wp-admin|admin-ajax/i.test(html)) {
    failures.push(`${name}: immediate analytics or retired plugin runtime remains`);
  }

  const stylesheets = [...html.matchAll(/<link\b[^>]*rel=["'][^"']*stylesheet[^"']*["'][^>]*>/gi)];
  if (stylesheets.length !== 3) failures.push(`${name}: expected exactly three stylesheet links`);
}

if (totalHtmlBytes > MAX_TOTAL_HTML_BYTES) {
  failures.push(`HTML total ${totalHtmlBytes} exceeds ${MAX_TOTAL_HTML_BYTES}`);
}

for (const [path, maximum] of Object.entries(ASSET_BUDGETS)) {
  const file = resolve(ROOT, path);
  if (!existsSync(file)) {
    failures.push(`${path}: missing budgeted shared asset`);
    continue;
  }
  const bytes = statSync(file).size;
  if (bytes > maximum) failures.push(`${path}: ${bytes} bytes exceeds ${maximum}`);
}

// One oversized photograph outweighs every page on the site put together;
// SCRIPTS/optimize-images.py is the local fix when this budget rejects one.
let totalImageBytes = 0;
for (const file of publicAssetFiles().filter((path) => /\.(?:jpe?g|png|gif|webp)$/i.test(path))) {
  const name = relative(ROOT, file).split(sep).join("/");
  const bytes = statSync(file).size;
  totalImageBytes += bytes;
  if (bytes > MAX_IMAGE_BYTES) failures.push(`${name}: ${bytes} image bytes exceeds ${MAX_IMAGE_BYTES}`);
}
if (totalImageBytes > MAX_TOTAL_IMAGE_BYTES) {
  failures.push(`image total ${totalImageBytes} exceeds ${MAX_TOTAL_IMAGE_BYTES}`);
}

if (failures.length > 0) {
  process.stderr.write(`${[...new Set(failures)].join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Performance budgets passed for ${pages.length} pages (${totalHtmlBytes} HTML bytes, ${totalImageBytes} image bytes).\n`,
  );
}
