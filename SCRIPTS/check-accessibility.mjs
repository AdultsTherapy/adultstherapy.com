#!/usr/bin/env node

/** Dependency-free accessibility invariants for the shared static template. */

import { existsSync, readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { ROOT, countMatches, publicPageFiles } from "./static-site.mjs";

const failures = [];
const pages = publicPageFiles();
const unique = (items) => [...new Set(items)];
const attribute = (tag, name) =>
  tag.match(new RegExp(`(?:^|\\s)${name}=["']([^"']*)["']`, "i"))?.[1] || "";
const text = (value) =>
  value
    .replace(/<(?:script|style|svg)\b[^>]*>[\s\S]*?<\/(?:script|style|svg)>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|#160);/gi, " ")
    .replace(/&#x?[a-f0-9]+;/gi, "x")
    .replace(/\s+/g, " ")
    .trim();
const nameFor = (file) => relative(ROOT, file).split(sep).join("/");

for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const name = nameFor(file);
  const mainMatch = html.match(/<main\b([^>]*)>([\s\S]*?)<\/main>/i);

  if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) failures.push(`${name}: missing document language`);
  if (countMatches(html, /<main\b/gi) !== 1) failures.push(`${name}: expected one main landmark`);
  if (countMatches(html, /<h1\b/gi) !== 1) failures.push(`${name}: expected one h1`);
  if (!/<a\b[^>]*class=["'][^"']*\bskip-link\b[^"']*["'][^>]*href=["']#main["']/i.test(html)) {
    failures.push(`${name}: missing shared skip link to #main`);
  }
  if (!mainMatch || attribute(mainMatch[1], "id") !== "main" || attribute(mainMatch[1], "tabindex") !== "-1") {
    failures.push(`${name}: main skip-link target must be id=main and tabindex=-1`);
  }
  const firstHeading = mainMatch?.[2].match(/<h([1-6])\b/i)?.[1];
  if (firstHeading !== "1") failures.push(`${name}: first main heading must be h1`);

  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  for (const id of unique(ids)) {
    if (ids.filter((candidate) => candidate === id).length > 1) failures.push(`${name}: duplicate id ${id}`);
  }

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    const tag = match[0];
    const source = attribute(tag, "src");
    if (!/\balt=["'][^"']*["']/i.test(tag)) failures.push(`${name}: image missing alt (${source || "unknown source"})`);
    if (!text(attribute(tag, "alt"))) failures.push(`${name}: image has empty alt (${source || "unknown source"})`);
    if (source.startsWith("/")) {
      const local = resolve(ROOT, source.split(/[?#]/)[0].replace(/^\/+/, ""));
      if (existsSync(local) && (!attribute(tag, "width") || !attribute(tag, "height"))) {
        failures.push(`${name}: local image missing intrinsic dimensions (${source})`);
      }
    }
  }

  for (const match of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const opening = match[1];
    const label = text(match[2]);
    if (!label && !attribute(opening, "aria-label") && !attribute(opening, "aria-labelledby")) {
      failures.push(`${name}: button has no accessible name`);
    }
  }

  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const opening = match[1];
    const label = text(match[2]) || attribute(opening, "aria-label") || attribute(opening, "title");
    const imageAlt = match[2].match(/<img\b[^>]*alt=["']([^"']+)["']/i)?.[1] || "";
    if (!label && !imageAlt) failures.push(`${name}: link has no accessible name`);
    if (attribute(opening, "target") === "_blank" && !/\bnoopener\b/i.test(attribute(opening, "rel"))) {
      failures.push(`${name}: target=_blank link is missing rel=noopener`);
    }
  }

  for (const match of html.matchAll(/<iframe\b([^>]*)>/gi)) {
    const tag = match[0];
    if (!attribute(tag, "title")) failures.push(`${name}: iframe missing title`);
    const source = attribute(tag, "src");
    if (source && /^(?:https?:)?\/\//i.test(source)) {
      failures.push(`${name}: external iframe loads before explicit consent`);
    }
    if (attribute(tag, "data-external-src") && !/data-load-external-embed/i.test(html)) {
      failures.push(`${name}: deferred iframe has no explicit load control`);
    }
  }

  const labelTargets = new Set(
    [...html.matchAll(/<label\b[^>]*for=["']([^"']+)["']/gi)].map((match) => match[1]),
  );
  for (const match of html.matchAll(/<(?:input|select|textarea)\b([^>]*)>/gi)) {
    const tag = match[0];
    const type = attribute(tag, "type").toLowerCase();
    if (["hidden", "submit", "button", "reset", "image"].includes(type)) continue;
    const id = attribute(tag, "id");
    if (
      !(id && labelTargets.has(id)) &&
      !attribute(tag, "aria-label") &&
      !attribute(tag, "aria-labelledby")
    ) {
      failures.push(`${name}: form control has no associated label (${attribute(tag, "name") || id || "unnamed"})`);
    }
  }

  for (const match of html.matchAll(/\btabindex=["']([^"']+)["']/gi)) {
    const value = Number(match[1]);
    if (Number.isFinite(value) && value > 0) failures.push(`${name}: positive tabindex ${value} disrupts reading order`);
  }

  const navToggle = html.match(/<button\b[^>]*class=["'][^"']*\bnav__toggle\b[^"']*["'][^>]*>/i)?.[0] || "";
  if (
    !attribute(navToggle, "aria-label") ||
    attribute(navToggle, "aria-expanded") !== "false" ||
    attribute(navToggle, "aria-controls") !== "nav-menu" ||
    !/\bid=["']nav-menu["']/i.test(html)
  ) {
    failures.push(`${name}: mobile navigation control has incomplete ARIA state`);
  }

  const headingLevels = [...(mainMatch?.[2] || "").matchAll(/<h([1-6])\b/gi)].map((match) => Number(match[1]));
  for (const [index, level] of headingLevels.entries()) {
    if (index > 0 && level - headingLevels[index - 1] > 1) {
      failures.push(`${name}: heading level jumps from h${headingLevels[index - 1]} to h${level}`);
    }
  }
}

const sharedCssPath = resolve(ROOT, "assets/site.css");
if (!existsSync(sharedCssPath)) {
  failures.push("assets/site.css: missing shared stylesheet");
} else {
  const sharedCss = readFileSync(sharedCssPath, "utf8");
  if (!/:focus-visible[\s\S]*outline:/i.test(sharedCss)) {
    failures.push("assets/site.css: missing visible focus treatment");
  }
  if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)/i.test(sharedCss)) {
    failures.push("assets/site.css: missing reduced-motion treatment");
  }
}

if (failures.length > 0) {
  process.stderr.write(`${unique(failures).join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Accessibility invariants passed for ${pages.length} shared-template pages.\n`);
}
