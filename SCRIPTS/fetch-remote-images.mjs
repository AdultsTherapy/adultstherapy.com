#!/usr/bin/env node

/**
 * Pull every remotely hosted image referenced by the site into assets/img, so
 * no page depends on a third-party host at render time.
 *
 *   node SCRIPTS/fetch-remote-images.mjs [--source <dir>]
 *
 * Re-running is cheap: a file already present is left alone.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { ROOT, walkFiles } from "./static-site.mjs";

const index = process.argv.indexOf("--source");
const SOURCE = index === -1 ? ROOT : resolve(process.argv[index + 1]);
const IMAGES = resolve(ROOT, "assets/img");
const WIDTH = 1600;
const QUALITY = 70;

const pages = walkFiles(SOURCE, new Set([".git", ".github", "_site", "node_modules", "SCRIPTS", "assets"]))
  .filter((file) => file.endsWith(".html"));

const identifiers = new Set();
for (const file of pages) {
  for (const match of readFileSync(file, "utf8").matchAll(/https:\/\/images\.unsplash\.com\/(photo-[0-9a-f-]+)/gi)) {
    identifiers.add(match[1]);
  }
}

mkdirSync(IMAGES, { recursive: true });

const failures = [];
let fetched = 0;
let present = 0;

for (const identifier of [...identifiers].sort()) {
  const target = resolve(IMAGES, `${identifier}.jpg`);
  if (existsSync(target)) {
    present += 1;
    continue;
  }
  const url = `https://images.unsplash.com/${identifier}?q=${QUALITY}&w=${WIDTH}&auto=format&fit=crop`;
  try {
    const response = await fetch(url, { redirect: "follow" });
    if (!response.ok) {
      failures.push(`${identifier}: HTTP ${response.status}`);
      continue;
    }
    writeFileSync(target, Buffer.from(await response.arrayBuffer()));
    fetched += 1;
  } catch (error) {
    failures.push(`${identifier}: ${error.message}`);
  }
}

if (failures.length > 0) {
  process.stderr.write(`${failures.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Remote images local: ${fetched} fetched, ${present} already present, ${identifiers.size} referenced.\n`,
  );
}
