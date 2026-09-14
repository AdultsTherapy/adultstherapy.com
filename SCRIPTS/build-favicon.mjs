#!/usr/bin/env node

/**
 * Build assets/img/favicon.ico from the practice mark. An ICO directory can
 * carry PNG payloads directly, so the source PNGs are embedded unchanged and no
 * image library is needed.
 *
 *   node SCRIPTS/build-favicon.mjs
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { ROOT } from "./static-site.mjs";

const SOURCES = ["assets/img/mark-32.png", "assets/img/mark-180.png"];
const TARGET = resolve(ROOT, "assets/img/favicon.ico");

const pngSize = (buffer) => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });

const entries = SOURCES.map((path) => {
  const file = resolve(ROOT, path);
  if (!existsSync(file)) throw new Error(`${path}: missing favicon source`);
  const data = readFileSync(file);
  if (data.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error(`${path}: favicon sources must be PNG`);
  }
  return { data, ...pngSize(data) };
}).sort((left, right) => left.width - right.width);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2); // ICO
header.writeUInt16LE(entries.length, 4);

let offset = 6 + entries.length * 16;
const directory = Buffer.concat(
  entries.map(({ data, width, height }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  }),
);

writeFileSync(TARGET, Buffer.concat([header, directory, ...entries.map(({ data }) => data)]));
process.stdout.write(
  `Built favicon.ico with ${entries.length} sizes (${entries.map(({ width }) => `${width}px`).join(", ")}).\n`,
);
