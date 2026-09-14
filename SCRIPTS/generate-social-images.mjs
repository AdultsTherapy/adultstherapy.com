#!/usr/bin/env node

/** Generate dependency-free, branded 1200 x 630 Open Graph PNGs. */

import { deflateSync } from "node:zlib";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const WIDTH = 1200;
const HEIGHT = 630;
const OUTPUT = resolve(import.meta.dirname, "../assets/social");

const GLYPHS = Object.freeze({
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "00110", "00110"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "/": ["00001", "00010", "00100", "00100", "01000", "10000", "00000"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00001", "00001", "00001", "00001", "10001", "10001", "01110"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
});

const hex = (value) => [1, 3, 5].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
const pixels = Buffer.alloc(WIDTH * HEIGHT * 4);

const fill = (top, bottom) => {
  const a = hex(top);
  const b = hex(bottom);
  for (let y = 0; y < HEIGHT; y += 1) {
    const mix = y / (HEIGHT - 1);
    const color = a.map((channel, index) => Math.round(channel + (b[index] - channel) * mix));
    for (let x = 0; x < WIDTH; x += 1) {
      const offset = (y * WIDTH + x) * 4;
      pixels[offset] = color[0];
      pixels[offset + 1] = color[1];
      pixels[offset + 2] = color[2];
      pixels[offset + 3] = 255;
    }
  }
};

const rectangle = (x, y, width, height, color) => {
  const [red, green, blue] = hex(color);
  for (let row = Math.max(0, y); row < Math.min(HEIGHT, y + height); row += 1) {
    for (let column = Math.max(0, x); column < Math.min(WIDTH, x + width); column += 1) {
      const offset = (row * WIDTH + column) * 4;
      pixels[offset] = red;
      pixels[offset + 1] = green;
      pixels[offset + 2] = blue;
      pixels[offset + 3] = 255;
    }
  }
};

const textWidth = (value, scale) => Math.max(0, value.length * 6 * scale - scale);
const drawText = (value, x, y, maximumWidth, preferredScale, color) => {
  const upper = value.toUpperCase();
  const scale = Math.max(2, Math.min(preferredScale, Math.floor(maximumWidth / Math.max(1, upper.length * 6))));
  for (const [index, character] of [...upper].entries()) {
    const glyph = GLYPHS[character] || GLYPHS[" "];
    for (const [row, cells] of glyph.entries()) {
      for (const [column, cell] of [...cells].entries()) {
        if (cell === "1") rectangle(x + index * 6 * scale + column * scale, y + row * scale, scale, scale, color);
      }
    }
  }
  return textWidth(upper, scale);
};

const crcTable = Array.from({ length: 256 }, (_, number) => {
  let value = number;
  for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

const crc32 = (buffer) => {
  let value = 0xffffffff;
  for (const byte of buffer) value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
};

const png = () => {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(WIDTH, 0);
  header.writeUInt32BE(HEIGHT, 4);
  header[8] = 8;
  header[9] = 6;
  const scanlines = Buffer.alloc(HEIGHT * (WIDTH * 4 + 1));
  for (let y = 0; y < HEIGHT; y += 1) {
    const start = y * (WIDTH * 4 + 1);
    scanlines[start] = 0;
    pixels.copy(scanlines, start + 1, y * WIDTH * 4, (y + 1) * WIDTH * 4);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(scanlines, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};

const variants = Object.freeze([
  { file: "practice.png", accent: "#99b4df", top: "#4b3a5e", bottom: "#7e679b", label: "EVIDENCE-BASED THERAPY IN OREGON" },
  { file: "therapy.png", accent: "#66afa5", top: "#4b3a5e", bottom: "#63507b", label: "THERAPY APPROACHES" },
  { file: "couples.png", accent: "#e6b8c6", top: "#4b3a5e", bottom: "#75536b", label: "GOTTMAN METHOD COUPLES THERAPY" },
  { file: "military.png", accent: "#c7d59f", top: "#3b3f4e", bottom: "#5c6072", label: "MILITARY + VETERAN TRAUMA CARE" },
  { file: "skills.png", accent: "#f2c57c", top: "#4b3a5e", bottom: "#6f5a86", label: "PRACTICAL THERAPY SKILLS" },
  { file: "education.png", accent: "#99b4df", top: "#37485e", bottom: "#5b708c", label: "MENTAL HEALTH EDUCATION" },
  { file: "about.png", accent: "#66afa5", top: "#4b3a5e", bottom: "#7e679b", label: "ELAINE DINWIDDIE LPC" },
]);

mkdirSync(OUTPUT, { recursive: true });
let changed = 0;
for (const variant of variants) {
  fill(variant.top, variant.bottom);
  rectangle(72, 72, 12, 486, variant.accent);
  rectangle(104, 90, 152, 10, variant.accent);
  drawText("ADULTS + COUPLES", 112, 142, 980, 14, "#fafafa");
  drawText("THERAPY OF OREGON", 112, 244, 980, 14, "#fafafa");
  drawText(variant.label, 112, 376, 980, 8, variant.accent);
  drawText("ADULTSTHERAPY.COM", 112, 512, 760, 6, "#dcd6e6");
  rectangle(1020, 500, 88, 10, variant.accent);
  rectangle(1098, 422, 10, 88, variant.accent);
  const output = png();
  const target = resolve(OUTPUT, variant.file);
  if (!existsSync(target) || !readFileSync(target).equals(output)) {
    writeFileSync(target, output);
    changed += 1;
  }
}

process.stdout.write(`Generated ${changed} of ${variants.length} social images.\n`);
