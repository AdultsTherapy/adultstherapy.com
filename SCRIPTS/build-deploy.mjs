#!/usr/bin/env node

/** Build and verify the exact GitHub Pages artifact without mutating source files. */

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import {
  EXPECTED_SHARED_PAGE_COUNT,
  OUTPUT,
  REQUIRED_SHARED_ASSETS,
  ROOT,
  ROOT_PUBLIC_FILES,
  fileForPathname,
  publicAssetFiles,
  publicPageFiles,
  walkFiles,
} from "./static-site.mjs";

const failures = [];
const sourcePages = publicPageFiles();
const sources = new Set([
  ...sourcePages,
  ...publicAssetFiles(),
  ...ROOT_PUBLIC_FILES.map((path) => resolve(ROOT, path)),
  ...REQUIRED_SHARED_ASSETS.map((path) => resolve(ROOT, path)),
]);

if (sourcePages.length !== EXPECTED_SHARED_PAGE_COUNT) {
  failures.push(
    `expected ${EXPECTED_SHARED_PAGE_COUNT} shared-template pages; found ${sourcePages.length}`,
  );
}

for (const source of sources) {
  if (!existsSync(source)) failures.push(`${relative(ROOT, source)}: missing deploy source`);
}

if (failures.length > 0) {
  process.stderr.write(`${failures.join("\n")}\n`);
  process.exit(1);
}

rmSync(OUTPUT, { recursive: true, force: true });
mkdirSync(OUTPUT, { recursive: true });

for (const source of [...sources].sort((left, right) => left.localeCompare(right))) {
  const path = relative(ROOT, source);
  const target = resolve(OUTPUT, path);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target);
}
writeFileSync(resolve(OUTPUT, ".nojekyll"), "");

const outputFiles = walkFiles(OUTPUT, new Set()).sort((left, right) => left.localeCompare(right));
const outputPaths = new Set(outputFiles.map((file) => relative(OUTPUT, file).split(sep).join("/")));
const expectedPaths = new Set([...sources].map((file) => relative(ROOT, file).split(sep).join("/")));
expectedPaths.add(".nojekyll");

for (const path of expectedPaths) {
  if (!outputPaths.has(path)) failures.push(`${path}: missing from deployment artifact`);
}
for (const path of outputPaths) {
  if (!expectedPaths.has(path)) failures.push(`${path}: unexpected deployment artifact`);
  if (/(?:^|\/)(?:wp-content|wp-includes|wp-json|DOCS|SCRIPTS)(?:\/|$)/i.test(path)) {
    failures.push(`${path}: retired or private layer leaked into deployment artifact`);
  }
}

const localTarget = (value) => {
  const path = value.replaceAll("&amp;", "&").split(/[?#]/)[0];
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  try {
    return fileForPathname(decodeURI(path), OUTPUT);
  } catch {
    return false;
  }
};

for (const file of outputFiles) {
  const name = relative(OUTPUT, file).split(sep).join("/");
  if (file.endsWith(".html")) {
    const html = readFileSync(file, "utf8");
    if (/wp-admin|wp-json|wlwmanifest|xmlrpc\.php|cdnjs\.cloudflare\.com|images\.unsplash\.com/i.test(html)) {
      failures.push(`${name}: references a retired runtime artifact`);
    }
    for (const match of html.matchAll(/\b(?:href|src|poster)=["']([^"']+)["']/gi)) {
      const target = localTarget(match[1]);
      if (target === false) failures.push(`${name}: invalid local URL ${match[1]}`);
      if (target && !existsSync(target)) failures.push(`${name}: missing artifact target ${match[1]}`);
    }
    for (const match of html.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/gi)) {
      const target = localTarget(match[1]);
      if (target === false) failures.push(`${name}: invalid local CSS URL ${match[1]}`);
      if (target && !existsSync(target)) failures.push(`${name}: missing artifact target ${match[1]}`);
    }
  }
  if (file.endsWith(".css")) {
    const css = readFileSync(file, "utf8");
    if (/https?:\/\/(?:www\.)?adultstherapy\.com(?=\/)/i.test(css)) {
      failures.push(`${name}: same-origin CSS URL must be root-relative`);
    }
    for (const match of css.matchAll(/(?:url\(|@import\s+)[\s"']*([^"')\s;]+)["']?\s*\)?/gi)) {
      if (/^(?:data:|#)/i.test(match[1])) continue;
      const target = match[1].startsWith("/")
        ? localTarget(match[1])
        : resolve(file, "..", match[1].split(/[?#]/)[0]);
      if (target === false) failures.push(`${name}: invalid local CSS URL ${match[1]}`);
      if (target && !existsSync(target)) failures.push(`${name}: missing artifact target ${match[1]}`);
    }
  }
}

const cname = readFileSync(resolve(OUTPUT, "CNAME"), "utf8").trim();
if (cname !== "adultstherapy.com") failures.push(`CNAME: expected adultstherapy.com; found ${cname}`);

if (failures.length > 0) {
  process.stderr.write(`${[...new Set(failures)].join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Built verified deployment artifact with ${sourcePages.length} pages and ${outputFiles.length} files.\n`,
  );
}
