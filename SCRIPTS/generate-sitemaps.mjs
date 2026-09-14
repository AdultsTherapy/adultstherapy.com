#!/usr/bin/env node

/** Generate deterministic sitemaps from declared metadata in public pages. */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ORIGIN,
  ROOT,
  isNoindex,
  publicPageFiles,
  routeForFile,
} from "./static-site.mjs";

const structuredDate = (html) => {
  for (const match of html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const parsed = JSON.parse(match[1]);
      const nodes = Array.isArray(parsed?.["@graph"]) ? parsed["@graph"] : [parsed];
      const page = nodes.find((node) =>
        [node?.["@type"]]
          .flat()
          .some((type) => ["WebPage", "CollectionPage", "ProfilePage", "MedicalWebPage"].includes(type)),
      );
      const value = page?.dateModified || page?.datePublished;
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.slice(0, 10);
      }
    } catch {
      // check-site.mjs reports malformed JSON-LD with the route name.
    }
  }
  return null;
};

const entries = publicPageFiles()
  .map((file) => ({ file, route: routeForFile(file), html: readFileSync(file, "utf8") }))
  .filter(({ route, html }) => !isNoindex(html) && route !== "/404.html")
  .map(({ route, html }) => ({
    route,
    url: encodeURI(`${ORIGIN}${route}`),
    modified: structuredDate(html),
  }));

const therapy = entries.filter(({ route }) => route.startsWith("/therapy/") && route !== "/therapy/");
const therapyRoutes = new Set(therapy.map(({ route }) => route));
const pages = entries.filter(({ route }) => !therapyRoutes.has(route));

const writeIfChanged = (file, content) => {
  const target = resolve(ROOT, file);
  if (!existsSync(target) || readFileSync(target, "utf8") !== content) {
    writeFileSync(target, content);
    return true;
  }
  return false;
};

const lastmodElement = (modified, indentation = "    ") =>
  modified ? `\n${indentation}<lastmod>${modified}</lastmod>` : "";

const urlset = (items) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<?xml-stylesheet type="text/xsl" href="${ORIGIN}/main-sitemap.xsl"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items
    .map(
      ({ url, modified }) =>
        `  <url>\n    <loc>${url}</loc>${lastmodElement(modified)}\n  </url>`,
    )
    .join("\n")}\n</urlset>\n`;

const maps = [
  { name: "page-sitemap.xml", entries: pages },
  { name: "therapy-sitemap.xml", entries: therapy },
].map((map) => ({
  ...map,
  modified: map.entries.map(({ modified }) => modified).filter(Boolean).sort().at(-1) || null,
  changed: writeIfChanged(map.name, urlset(map.entries)),
}));

const sitemapIndex =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<?xml-stylesheet type="text/xsl" href="${ORIGIN}/main-sitemap.xsl"?>\n` +
  `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${maps
    .map(
      ({ name, modified }) =>
        `  <sitemap>\n    <loc>${ORIGIN}/${name}</loc>${lastmodElement(modified)}\n  </sitemap>`,
    )
    .join("\n")}\n</sitemapindex>\n`;

const indexChanged = writeIfChanged("sitemap_index.xml", sitemapIndex);
const changed = maps.filter(({ changed: wasChanged }) => wasChanged).length + Number(indexChanged);
process.stdout.write(
  `Generated ${maps.length} sitemaps for ${entries.length} URLs (${changed} files changed).\n`,
);
