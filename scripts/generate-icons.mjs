#!/usr/bin/env node
/**
 * Rasterize the Minny Agents favicon set from the SVG geometry in app/mark.ts.
 * Writes public/favicon.ico, public/apple-touch-icon.png, public/icon-192.png,
 * public/icon-512.png, and a copy of the ico into app/favicon.ico.
 */
import { writeFileSync, readFileSync, copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const INK = "#060A1A";
const TEAL = "#3CDBC0";

const FAVICON_STAR_D =
  "M16 6.2L20.2 12.8L26 16L20.2 19.2L16 25.8L11.8 19.2L6 16L11.8 12.8Z";
const FAVICON_MARK_STAR_D =
  "M16 6.6L19.4 11.8L25 14.4L19.4 17L16 22.2L12.6 17L7 14.4L12.6 11.8Z";
const FAVICON_MARK_WAVE_D =
  "M7.2 23.6C10.6 21.8 13.2 25.4 16 23.6C18.8 21.8 21.4 25.4 24.8 23.6L24.8 25.8C21.4 27.6 18.8 24 16 25.8C13.2 27.6 10.6 24 7.2 25.8Z";

function svg({ size, radius, star, wave }) {
  const r = radius == null ? 0 : (radius / size) * 32;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="${r}" fill="${INK}"/>
  <path fill="${TEAL}" d="${star}"/>
  ${wave ? `<path fill="${TEAL}" d="${wave}"/>` : ""}
</svg>`;
}

function icoFromPngs(pngs) {
  const count = pngs.length;
  const header = Buffer.alloc(6 + 16 * count);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  let offset = 6 + 16 * count;
  const chunks = [header];
  pngs.forEach((png, i) => {
    const entry = 6 + 16 * i;
    const meta = png.meta;
    header.writeUInt8(meta.width >= 256 ? 0 : meta.width, entry);
    header.writeUInt8(meta.height >= 256 ? 0 : meta.height, entry + 1);
    header.writeUInt8(0, entry + 2);
    header.writeUInt8(0, entry + 3);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.buffer.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    chunks.push(png.buffer);
    offset += png.buffer.length;
  });
  return Buffer.concat(chunks);
}

async function raster(size, { star, wave, radius }) {
  const buf = await sharp(Buffer.from(svg({ size, radius, star, wave })))
    .png()
    .toBuffer();
  const meta = await sharp(buf).metadata();
  return { buffer: buf, meta };
}

async function edgeInkRatio(png, size) {
  const { data } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const band = Math.max(1, Math.round(size * 0.08));
  let ink = 0;
  let n = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const edge = x < band || y < band || x >= size - band || y >= size - band;
      if (!edge) continue;
      const i = (y * size + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const dist = Math.abs(r - 6) + Math.abs(g - 10) + Math.abs(b - 26);
      if (dist < 24) ink++;
      n++;
    }
  }
  return n ? ink / n : 0;
}

mkdirSync(join(root, "test-results"), { recursive: true });

const png32 = await raster(32, { star: FAVICON_STAR_D, radius: 6 });
const png16 = await raster(16, { star: FAVICON_STAR_D, radius: 3 });
const apple = await raster(180, { star: FAVICON_MARK_STAR_D, wave: FAVICON_MARK_WAVE_D });
const icon192 = await raster(192, { star: FAVICON_MARK_STAR_D, wave: FAVICON_MARK_WAVE_D, radius: 36 });
const icon512 = await raster(512, { star: FAVICON_MARK_STAR_D, wave: FAVICON_MARK_WAVE_D, radius: 96 });

const ico = icoFromPngs([png16, png32]);
writeFileSync(join(root, "public/favicon.ico"), ico);
copyFileSync(join(root, "public/favicon.ico"), join(root, "app/favicon.ico"));
writeFileSync(join(root, "public/apple-touch-icon.png"), apple.buffer);
writeFileSync(join(root, "public/icon-192.png"), icon192.buffer);
writeFileSync(join(root, "public/icon-512.png"), icon512.buffer);
writeFileSync(join(root, "test-results/favicon-32.png"), png32.buffer);

const edge = await edgeInkRatio(png32.buffer, 32);
const svgOnDisk = readFileSync(join(root, "public/favicon.svg"), "utf8");
if (!svgOnDisk.includes(FAVICON_STAR_D)) {
  throw new Error("public/favicon.svg is out of sync with generate-icons.mjs");
}

console.log("Wrote favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png");
console.log("32px preview: test-results/favicon-32.png");
console.log(`32px edge-band ink ratio: ${(edge * 100).toFixed(1)}% (want >90%)`);
if (edge < 0.9) {
  throw new Error("32px favicon edges are not clear ink — mark is still too close to the rim");
}
