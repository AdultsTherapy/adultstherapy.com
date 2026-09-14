#!/usr/bin/env node

/** Shared, dependency-free inventory helpers for the normalized static site. */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

export const ROOT = resolve(process.env.SITE_ROOT || resolve(import.meta.dirname, ".."));
export const OUTPUT = resolve(ROOT, "_site");
export const ORIGIN = "https://adultstherapy.com";
export const EXPECTED_SHARED_PAGE_COUNT = 18;

export const ROUTE_ROOTS = Object.freeze([
  "about",
  "contact",
  "education",
  "privacy",
  "sitemap",
  "skills",
  "terms",
  "therapy",
]);

export const ROOT_PAGE_FILES = Object.freeze([
  "index.html",
  "404.html",
]);

export const ROOT_PUBLIC_FILES = Object.freeze([
  "CNAME",
  "robots.txt",
  "main-sitemap.xsl",
  "sitemap_index.xml",
  "page-sitemap.xml",
  "therapy-sitemap.xml",
  "googlefcd87073150e390c.html",
]);

export const REQUIRED_SHARED_ASSETS = Object.freeze([
  "assets/site.css",
  "assets/site.js",
  "assets/fontawesome.css",
  "assets/fonts/fa-solid-900.woff2",
  "assets/img/favicon.ico",
  "assets/social/practice.png",
  "assets/social/therapy.png",
  "assets/social/couples.png",
  "assets/social/military.png",
  "assets/social/skills.png",
  "assets/social/education.png",
  "assets/social/about.png",
  "privacy/data-events.json",
]);

export const PUBLIC_ASSET_FILES = new Set([
  "assets/site.css",
  "assets/site.js",
  "assets/fontawesome.css",
]);

export const PUBLIC_ASSET_DIRECTORIES = Object.freeze([
  "assets/fonts/",
  "assets/img/",
  "assets/social/",
]);

/** Layers of the WordPress export that must never come back. */
export const RETIRED_PATHS = Object.freeze([
  "wp-content",
  "wp-includes",
  "wp-json",
  "script.js",
  "style.css",
  "assets/fonts/alike-400.ttf",
  "assets/fonts/lexend-400.ttf",
  "sitemap.xml",
  "assets/SBHP-Web-Badge-Provider.png",
  "assets/eft-tapping.jpg",
  "assets/breathing-exercise.jpg",
  "deploy-to-production.sh",
  "deploy-via-pr.sh",
  "cleanup-deployment-branches.sh",
]);

const EXCLUDED_DIRECTORY_NAMES = new Set([
  ".git",
  ".github",
  "_site",
  "node_modules",
  "SCRIPTS",
  "wp-content",
  "wp-includes",
  "wp-json",
]);

export const toPosix = (value) => value.split(sep).join("/");

export const walkFiles = (directory, excludedNames = EXCLUDED_DIRECTORY_NAMES) => {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && excludedNames.has(entry.name)) return [];
    const absolute = resolve(directory, entry.name);
    return entry.isDirectory() ? walkFiles(absolute, excludedNames) : [absolute];
  });
};

export const publicPageFiles = () => {
  const rootPages = ROOT_PAGE_FILES.map((name) => resolve(ROOT, name)).filter(existsSync);
  const routePages = ROUTE_ROOTS.flatMap((name) =>
    walkFiles(resolve(ROOT, name)).filter((file) => file.endsWith(".html")),
  );
  return [...rootPages, ...routePages].sort((left, right) => left.localeCompare(right));
};

export const publicAssetFiles = () =>
  walkFiles(resolve(ROOT, "assets"))
    .filter((file) => {
      const path = toPosix(relative(ROOT, file));
      return (
        PUBLIC_ASSET_FILES.has(path) ||
        PUBLIC_ASSET_DIRECTORIES.some((directory) => path.startsWith(directory))
      );
    })
    .sort((left, right) => left.localeCompare(right));

export const relativePath = (file) => toPosix(relative(ROOT, file));

export const routeForFile = (file) => {
  const path = relativePath(file);
  if (path === "index.html") return "/";
  if (path.endsWith("index.html")) return `/${path.slice(0, -10)}`;
  return `/${path}`;
};

export const fileForPathname = (pathname, root = ROOT) => {
  const decoded = decodeURI(pathname).replace(/^\/+/, "");
  if (!decoded) return resolve(root, "index.html");
  return /\.[a-z0-9]+$/i.test(decoded)
    ? resolve(root, decoded)
    : resolve(root, decoded, "index.html");
};

export const isNoindex = (html) =>
  /<meta\s+[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);

export const read = (file) => readFileSync(file, "utf8");

export const countMatches = (value, pattern) => [...value.matchAll(pattern)].length;

export const expectedCanonical = (file) => `${ORIGIN}${encodeURI(routeForFile(file))}`;
