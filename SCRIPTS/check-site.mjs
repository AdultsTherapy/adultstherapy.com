#!/usr/bin/env node

/** Structural, metadata, route, and runtime checks for the shared static site. */

import { existsSync, readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import {
  EXPECTED_SHARED_PAGE_COUNT,
  ORIGIN,
  REQUIRED_SHARED_ASSETS,
  RETIRED_PATHS,
  ROOT,
  countMatches,
  fileForPathname,
  isNoindex,
  publicAssetFiles,
  publicPageFiles,
  routeForFile,
  walkFiles,
} from "./static-site.mjs";

const failures = [];
const pages = publicPageFiles();
const canonicals = new Map();
const declaredDates = new Map();
const fragmentCache = new Map();
const ALLOWED_EMBED_HOSTS = new Set(["www.youtube-nocookie.com"]);
const ALLOWED_FORM_HOSTS = new Set();
const RETIRED_MARKUP =
  /wp-(?:content|includes|json|block|element|container|admin)|xmlrpc\.php|wlwmanifest|yoast|cdnjs\.cloudflare\.com|images\.unsplash\.com|preview\.adultstherapy\.com|vce-|visualcomposer/i;
const CANONICAL_TELEPHONE = "tel:+15413638817";

// The one third-party origin the pages are allowed to reach at render time.
// Everything else is still refused: see ALLOWED_EMBED_HOSTS and RETIRED_MARKUP.
const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2?family=Alike&family=Lexend:wght@400&display=swap";
const ALLOWED_PRECONNECT = new Set(["https://fonts.googleapis.com", "https://fonts.gstatic.com"]);

// A result listing truncates on pixel width, not characters, so these are the
// character counts that keep every title and description inside it with a
// little headroom. A title that outgrows this is not longer in the listing —
// it is cut, and the cut falls wherever the width runs out.
const MIN_TITLE = 30;
const MAX_TITLE = 65;
const MIN_DESCRIPTION = 70;
const MAX_DESCRIPTION = 158;

const unique = (items) => [...new Set(items)];
const attribute = (tag, name) =>
  tag.match(new RegExp(`(?:^|\\s)${name}=["']([^"']*)["']`, "i"))?.[1] || "";
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => match[0]);
const tagWith = (html, name, attributeName, expected) =>
  tags(html, name).find((tag) => attribute(tag, attributeName).toLowerCase() === expected.toLowerCase());
const decode = (value) => {
  try {
    return decodeURI(value.replaceAll("&amp;", "&"));
  } catch {
    return null;
  }
};
const pathName = (file) => relative(ROOT, file).split(sep).join("/");
const text = (value) =>
  value
    .replace(/<(?:script|style|svg)\b[^>]*>[\s\S]*?<\/(?:script|style|svg)>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|#160);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

if (pages.length !== EXPECTED_SHARED_PAGE_COUNT) {
  failures.push(`expected ${EXPECTED_SHARED_PAGE_COUNT} shared-template pages; found ${pages.length}`);
}

for (const required of REQUIRED_SHARED_ASSETS) {
  if (!existsSync(resolve(ROOT, required))) failures.push(`${required}: missing required public asset`);
}
for (const retired of RETIRED_PATHS) {
  if (existsSync(resolve(ROOT, retired))) failures.push(`${retired}: retired export artifact still exists`);
}

const allowedAssetPaths = new Set(
  publicAssetFiles().map((file) => relative(ROOT, file).split(sep).join("/")),
);
for (const file of walkFiles(resolve(ROOT, "assets"), new Set())) {
  const name = pathName(file);
  if (!allowedAssetPaths.has(name)) failures.push(`${name}: asset is outside the normalized allowlist`);
}

const localFileFor = (value) => {
  const decoded = decode(value);
  if (decoded === null) return false;
  const pathname = decoded.split(/[?#]/)[0];
  if (!pathname.startsWith("/") || pathname.startsWith("//")) return null;
  return fileForPathname(pathname);
};

const fragmentsFor = (file) => {
  if (fragmentCache.has(file)) return fragmentCache.get(file);
  const html = readFileSync(file, "utf8");
  const result = new Set(
    [...html.matchAll(/\b(?:id|name)=["']([^"']+)["']/gi)].map((match) => match[1]),
  );
  fragmentCache.set(file, result);
  return result;
};

for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const name = pathName(file);
  const route = routeForFile(file);
  const is404 = route === "/404.html";

  if (!/^<!doctype html>/i.test(html.trimStart())) failures.push(`${name}: missing HTML doctype`);
  if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) failures.push(`${name}: missing document language`);
  if (countMatches(html, /<title\b/gi) !== 1) failures.push(`${name}: expected one title`);
  const title = text(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  if (title && (title.length < MIN_TITLE || title.length > MAX_TITLE)) {
    failures.push(`${name}: title is ${title.length} characters; keep it ${MIN_TITLE}-${MAX_TITLE}`);
  }
  if (!tagWith(html, "meta", "name", "viewport")) failures.push(`${name}: missing viewport metadata`);
  if (!tagWith(html, "meta", "name", "robots")) failures.push(`${name}: missing explicit robots metadata`);

  const descriptionTag = tagWith(html, "meta", "name", "description");
  const canonicalTag = tags(html, "link").find((tag) => /(?:^|\s)canonical(?:\s|$)/i.test(attribute(tag, "rel")));
  if (!is404) {
    if (!descriptionTag) failures.push(`${name}: missing meta description`);
    const description = attribute(descriptionTag || "", "content");
    if (
      description &&
      (text(description).length < MIN_DESCRIPTION || text(description).length > MAX_DESCRIPTION)
    ) {
      failures.push(
        `${name}: description is ${text(description).length} characters; keep it ${MIN_DESCRIPTION}-${MAX_DESCRIPTION}`,
      );
    }
    if (!canonicalTag) failures.push(`${name}: missing canonical URL`);
    const canonical = decode(attribute(canonicalTag || "", "href"));
    const expected = `${ORIGIN}${route}`;
    if (canonical && canonical !== expected) failures.push(`${name}: canonical ${canonical} does not match ${expected}`);
    if (canonical) {
      if (canonicals.has(canonical)) failures.push(`${name}: duplicate canonical also used by ${canonicals.get(canonical)}`);
      canonicals.set(canonical, name);
    }
    for (const [kind, tag] of [
      ["Open Graph image", tagWith(html, "meta", "property", "og:image")],
      ["Open Graph image alt", tagWith(html, "meta", "property", "og:image:alt")],
      ["Twitter image", tagWith(html, "meta", "name", "twitter:image")],
      ["Twitter image alt", tagWith(html, "meta", "name", "twitter:image:alt")],
    ]) {
      if (!attribute(tag || "", "content")) failures.push(`${name}: missing ${kind}`);
    }
  } else if (!isNoindex(html)) {
    failures.push(`${name}: 404 page must be noindex`);
  }

  const stylesheetLinks = tags(html, "link")
    .filter((tag) => /(?:^|\s)stylesheet(?:\s|$)/i.test(attribute(tag, "rel")))
    .map((tag) => decode(attribute(tag, "href")));
  const expectedStyles = [GOOGLE_FONTS, "/assets/fontawesome.css", "/assets/site.css"];
  if (
    stylesheetLinks.length !== expectedStyles.length ||
    expectedStyles.some((href) => !stylesheetLinks.includes(href))
  ) {
    failures.push(`${name}: stylesheets must be exactly ${expectedStyles.join(" and ")}`);
  }
  for (const tag of tags(html, "link").filter((link) => /(?:^|\s)(?:preconnect|dns-prefetch)(?:\s|$)/i.test(attribute(link, "rel")))) {
    const href = attribute(tag, "href");
    if (!ALLOWED_PRECONNECT.has(href)) failures.push(`${name}: unapproved preconnect ${href}`);
  }
  // A preload is a request the browser makes before it knows why, so it is
  // worth only for the element that decides Largest Contentful Paint, and only
  // from this origin.
  for (const tag of tags(html, "link").filter((link) => /(?:^|\s)preload(?:\s|$)/i.test(attribute(link, "rel")))) {
    const href = attribute(tag, "href");
    if (!href.startsWith("/") || href.startsWith("//")) failures.push(`${name}: preload must be same-origin, found ${href}`);
    if (!attribute(tag, "as")) failures.push(`${name}: preload ${href} needs an "as" type`);
    const target = localFileFor(href);
    if (target && !existsSync(target)) failures.push(`${name}: preload target ${href} does not exist`);
  }
  const missingPreconnect = [...ALLOWED_PRECONNECT].filter(
    (origin) => !tags(html, "link").some((tag) => attribute(tag, "href") === origin),
  );
  if (missingPreconnect.length > 0) {
    failures.push(`${name}: missing preconnect for ${missingPreconnect.join(", ")}`);
  }

  const icon = tags(html, "link").find((tag) => /(?:^|\s)icon(?:\s|$)/i.test(attribute(tag, "rel")));
  if (attribute(icon || "", "href") !== "/assets/img/favicon.ico") {
    failures.push(`${name}: favicon must be /assets/img/favicon.ico`);
  }
  const runtimeScripts = tags(html, "script").map((tag) => attribute(tag, "src")).filter(Boolean);
  if (runtimeScripts.length !== 1 || runtimeScripts[0] !== "/assets/site.js") {
    failures.push(`${name}: runtime script must be exactly /assets/site.js`);
  }

  if (countMatches(html, /<main\b/gi) !== 1) failures.push(`${name}: expected one main landmark`);
  if (countMatches(html, /<h1\b/gi) !== 1) failures.push(`${name}: expected one h1`);
  for (const marker of ["masthead", "nav", "breadcrumbs", "footer", "bottombar"]) {
    if (!new RegExp(`class=["'][^"']*\\b${marker}\\b`, "i").test(html)) {
      failures.push(`${name}: missing shared ${marker} shell`);
    }
  }
  if (RETIRED_MARKUP.test(html)) failures.push(`${name}: contains retired WordPress/plugin markup or assets`);
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || "";
  if (/\b(?:href|src|action|poster|data-external-src)=["']https?:\/\/(?:www\.)?adultstherapy\.com/i.test(body)) {
    failures.push(`${name}: same-origin body URLs must be root-relative`);
  }
  for (const match of html.matchAll(/href=["'](tel:[^"']+)["']/gi)) {
    if (match[1] !== CANONICAL_TELEPHONE) {
      failures.push(`${name}: telephone link must be ${CANONICAL_TELEPHONE}, found ${match[1]}`);
    }
  }

  for (const match of html.matchAll(/\b(?:href|src|poster)=["']([^"']+)["']/gi)) {
    const target = localFileFor(match[1]);
    if (target === false) failures.push(`${name}: invalid local URL ${match[1]}`);
    if (target && !existsSync(target)) failures.push(`${name}: missing local target ${match[1]}`);
  }
  for (const match of html.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/gi)) {
    const target = localFileFor(match[1]);
    if (target === false) failures.push(`${name}: invalid inline asset URL ${match[1]}`);
    if (target && !existsSync(target)) failures.push(`${name}: missing inline asset ${match[1]}`);
  }

  for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    const href = decode(match[1]);
    if (!href || !href.includes("#")) continue;
    try {
      const targetUrl = new URL(href, `${ORIGIN}${route}`);
      const fragment = decodeURIComponent(targetUrl.hash.slice(1));
      if (
        targetUrl.origin !== ORIGIN ||
        !fragment ||
        fragment === "top" ||
        fragment.startsWith(":~:text=")
      ) continue;
      const targetFile = fileForPathname(targetUrl.pathname);
      if (existsSync(targetFile) && !fragmentsFor(targetFile).has(fragment)) {
        failures.push(`${name}: missing fragment target ${targetUrl.pathname}#${fragment}`);
      }
    } catch {
      failures.push(`${name}: invalid fragment link ${match[1]}`);
    }
  }

  for (const iframe of tags(html, "iframe")) {
    const source = attribute(iframe, "src");
    const deferred = attribute(iframe, "data-external-src");
    if (source && /^(?:https?:)?\/\//i.test(source)) {
      failures.push(`${name}: external iframe must be consent-gated with data-external-src`);
    }
    if (deferred) {
      try {
        const host = new URL(deferred, ORIGIN).hostname;
        if (!ALLOWED_EMBED_HOSTS.has(host)) failures.push(`${name}: unapproved embed host ${host}`);
      } catch {
        failures.push(`${name}: invalid deferred embed URL ${deferred}`);
      }
    }
  }
  for (const form of tags(html, "form")) {
    const action = attribute(form, "action");
    if (!/^https?:\/\//i.test(action)) continue;
    try {
      const host = new URL(action).hostname;
      if (!ALLOWED_FORM_HOSTS.has(host)) failures.push(`${name}: unapproved form host ${host}`);
    } catch {
      failures.push(`${name}: invalid form action ${action}`);
    }
  }

  const schemaMatches = [...html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )];
  if (!is404 && schemaMatches.length !== 1) {
    failures.push(`${name}: expected one consolidated JSON-LD graph; found ${schemaMatches.length}`);
  }
  for (const match of schemaMatches) {
    try {
      const schema = JSON.parse(match[1]);
      const graph = Array.isArray(schema?.["@graph"]) ? schema["@graph"] : [schema];
      if (!is404) {
        if (!graph.some((node) => [node?.["@type"]].flat().includes("Organization"))) {
          failures.push(`${name}: JSON-LD graph is missing Organization`);
        }
        if (!graph.some((node) => [node?.["@type"]].flat().includes("WebSite"))) {
          failures.push(`${name}: JSON-LD graph is missing WebSite`);
        }
      }
      const page = graph.find((node) =>
        [node?.["@type"]]
          .flat()
          .some((type) => ["WebPage", "CollectionPage", "ProfilePage", "MedicalWebPage"].includes(type)),
      );
      // Hidden FAQ markup earns nothing and risks a manual action, so the
      // marked-up text has to be the text on the page: same questions, same
      // answers, same order.
      const faqSection = html.match(/<section class="faq"[\s\S]*?<\/section>/)?.[0];
      const faqNode = graph.find((node) => node?.["@type"] === "FAQPage");
      if (faqSection && !faqNode) failures.push(`${name}: visible questions with no FAQPage markup`);
      if (faqNode && !faqSection) failures.push(`${name}: FAQPage markup with no visible questions`);
      if (faqSection && faqNode) {
        // The page holds entities, the JSON holds the characters they stand
        // for. Compare what a reader sees, not how it happens to be encoded.
        const readable = (value) =>
          text(value)
            .replace(/&#8217;|&rsquo;/g, "\u2019")
            .replace(/&#8220;/g, "\u201c")
            .replace(/&#8221;/g, "\u201d")
            .replace(/&amp;/g, "&");
        const visible = [...faqSection.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g)].map(
          (pair) => [readable(pair[1]), readable(pair[2])],
        );
        const marked = (faqNode.mainEntity || []).map((entry) => [
          readable(entry.name || ""),
          readable(entry.acceptedAnswer?.text || ""),
        ]);
        if (visible.length !== marked.length) {
          failures.push(`${name}: ${marked.length} questions marked up but ${visible.length} rendered`);
        } else if (marked.some((pair, index) => pair[0] !== visible[index][0] || pair[1] !== visible[index][1])) {
          failures.push(`${name}: FAQ markup carries text the page does not show`);
        }
      }

      const date = page?.dateModified || page?.datePublished;
      if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
        declaredDates.set(`${ORIGIN}${route}`, date.slice(0, 10));
      }
    } catch {
      failures.push(`${name}: invalid JSON-LD`);
    }
  }
}

for (const cssFile of publicAssetFiles().filter((file) => file.endsWith(".css"))) {
  const css = readFileSync(cssFile, "utf8");
  const name = pathName(cssFile);
  if (/(?:url\(|@import\s+)[\s"']*(?:https?:)?\/\//i.test(css)) {
    failures.push(`${name}: external runtime URL is not allowed in shared CSS`);
  }
  for (const match of css.matchAll(/(?:url\(|@import\s+)[\s"']*([^"')\s;]+)["']?\s*\)?/gi)) {
    if (/^(?:data:|#)/i.test(match[1])) continue;
    const relativeTarget = resolve(cssFile, "..", match[1].split(/[?#]/)[0]);
    const target = match[1].startsWith("/") ? localFileFor(match[1]) : relativeTarget;
    if (target === false) failures.push(`${name}: invalid local CSS URL ${match[1]}`);
    if (target && !existsSync(target)) failures.push(`${name}: missing local CSS target ${match[1]}`);
  }
}

const expectedSitemaps = ["page-sitemap.xml", "therapy-sitemap.xml"];
const sitemapMembership = new Map();
const sitemapDates = new Map();
for (const sitemap of expectedSitemaps) {
  const file = resolve(ROOT, sitemap);
  if (!existsSync(file)) {
    failures.push(`${sitemap}: missing generated sitemap`);
    continue;
  }
  const xml = readFileSync(file, "utf8");
  for (const match of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?\s*<\/url>/gi)) {
    const url = decode(match[1]);
    if (!url) {
      failures.push(`${sitemap}: invalid URL ${match[1]}`);
      continue;
    }
    sitemapMembership.set(url, (sitemapMembership.get(url) || 0) + 1);
    if (match[2]) sitemapDates.set(url, match[2]);
  }
}

const indexableCanonicals = new Set(
  pages
    .filter((file) => {
      const route = routeForFile(file);
      return !isNoindex(readFileSync(file, "utf8")) && route !== "/404.html";
    })
    .map((file) => `${ORIGIN}${routeForFile(file)}`),
);
for (const url of indexableCanonicals) {
  if ((sitemapMembership.get(url) || 0) !== 1) {
    failures.push(`${url}: expected exactly one generated sitemap membership`);
  }
}
for (const [url, membership] of sitemapMembership) {
  if (!indexableCanonicals.has(url)) failures.push(`${url}: sitemap URL is not an indexable shared page`);
  if (membership !== 1) failures.push(`${url}: duplicated across generated sitemaps`);
  if (sitemapDates.has(url) && declaredDates.has(url) && sitemapDates.get(url) !== declaredDates.get(url)) {
    failures.push(`${url}: sitemap and JSON-LD dates disagree`);
  }
}

const sitemapIndexPath = resolve(ROOT, "sitemap_index.xml");
if (!existsSync(sitemapIndexPath)) {
  failures.push("sitemap_index.xml: missing generated sitemap index");
} else {
  const index = readFileSync(sitemapIndexPath, "utf8");
  const listed = unique([...index.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1]));
  const expected = expectedSitemaps.map((name) => `${ORIGIN}/${name}`);
  if (listed.length !== expected.length || expected.some((url) => !listed.includes(url))) {
    failures.push("sitemap_index.xml: must list exactly the generated route sitemaps");
  }
}

const robots = existsSync(resolve(ROOT, "robots.txt"))
  ? readFileSync(resolve(ROOT, "robots.txt"), "utf8")
  : "";
if (!robots.includes(`${ORIGIN}/sitemap_index.xml`)) failures.push("robots.txt: missing sitemap index URL");

const cname = existsSync(resolve(ROOT, "CNAME"))
  ? readFileSync(resolve(ROOT, "CNAME"), "utf8").trim()
  : "";
if (cname !== "adultstherapy.com") failures.push(`CNAME: expected adultstherapy.com; found ${cname || "nothing"}`);

try {
  const manifest = JSON.parse(readFileSync(resolve(ROOT, "privacy/data-events.json"), "utf8"));
  const events = new Set(manifest.events?.map((event) => event.name));
  for (const event of [
    "page_view",
    "email_click",
    "phone_click",
    "privacy_preference",
    "external_embed_load",
  ]) {
    if (!events.has(event)) failures.push(`privacy/data-events.json: missing ${event}`);
  }
  const processors = new Set(manifest.processors?.map((processor) => processor.name));
  for (const processor of ["GitHub Pages", "Google Analytics 4", "YouTube", "Google Fonts"]) {
    if (!processors.has(processor)) failures.push(`privacy/data-events.json: missing ${processor}`);
  }
} catch {
  failures.push("privacy/data-events.json: invalid or missing JSON manifest");
}

if (failures.length > 0) {
  process.stderr.write(`${unique(failures).join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Site invariants passed for ${pages.length} shared-template pages and ${canonicals.size} canonical routes.\n`,
  );
}
