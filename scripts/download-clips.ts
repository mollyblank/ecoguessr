/**
 * One-time (and additive) clip downloader.
 *
 * Usage:
 *   tsx scripts/download-clips.ts
 *
 * Requires XC_API_KEY in .env. After the initial run, subsequent runs
 * only fetch clips for grid cells that are still under MAX_PER_CELL.
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CLIPS_DIR = path.join(ROOT, "public", "clips");
const MANIFEST_PATH = path.join(ROOT, "public", "clips.json");

// ── Config ──────────────────────────────────────────────────────────────────
const PAGES_PER_AREA = 8; // random pages sampled per XC area
const MAX_PER_CELL = 3; // max clips per CELL_SIZE_DEG × CELL_SIZE_DEG cell
const CELL_SIZE_DEG = 20;
const DOWNLOAD_DELAY_MS = 350; // between file downloads (polite but not rate-limited)
const XC_API_DELAY_MS = 1200; // between XC API calls

const AREAS = ["america", "europe", "asia", "africa", "australasia"] as const;
type XCArea = (typeof AREAS)[number];

// ── Types ────────────────────────────────────────────────────────────────────
interface XCRecording {
  id: string;
  gen: string;
  sp: string;
  en: string;
  rec: string;
  cnt: string;
  loc: string;
  lat: string;
  lon: string;
  url: string;
  file: string;
  lic: string;
  q: string;
  length: string;
  time: string;
  date: string;
  also: string[];
}

interface XCResponse {
  numPages: number;
  recordings: XCRecording[];
}

export interface LocalClip {
  id: string;
  area: XCArea;
  file: string; // "/clips/XC{id}.mp3"
  en: string;
  gen: string;
  sp: string;
  cnt: string;
  loc: string;
  lat: string;
  lon: string;
  rec: string;
  date: string;
  time: string;
  also: string[];
  url: string;
  lic: string;
  q: string;
  length: string;
}

// ── XC API ───────────────────────────────────────────────────────────────────
const BASE = "https://xeno-canto.org/api/3/recordings";

let lastXcCall = 0;
async function callXC(apiKey: string, area: XCArea, page: number): Promise<XCResponse> {
  const gap = Date.now() - lastXcCall;
  if (gap < XC_API_DELAY_MS) await sleep(XC_API_DELAY_MS - gap);
  lastXcCall = Date.now();

  const tags = ["q_gt:D", "len:10-20", "grp:birds", `area:${area}`];
  const params = new URLSearchParams({ query: tags.join(" "), key: apiKey, page: String(page) });
  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) throw new Error(`XC API ${res.status} for ${area} page ${page}`);
  return res.json() as Promise<XCResponse>;
}

// ── Geographic grid ───────────────────────────────────────────────────────────
function cellKey(lat: number, lon: number): string {
  return `${Math.floor((lat + 90) / CELL_SIZE_DEG)}_${Math.floor((lon + 180) / CELL_SIZE_DEG)}`;
}

function hasValidCoords(r: XCRecording): boolean {
  const lat = parseFloat(r.lat);
  const lon = parseFloat(r.lon);
  return !isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomPages(numPages: number, count: number): number[] {
  const all = Array.from({ length: numPages }, (_, i) => i + 1);
  return shuffle(all).slice(0, count);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const apiKey = process.env.XC_API_KEY;
  if (!apiKey) {
    console.error("XC_API_KEY is not set in .env");
    process.exit(1);
  }

  fs.mkdirSync(CLIPS_DIR, { recursive: true });

  // Load existing manifest
  const existing: LocalClip[] = fs.existsSync(MANIFEST_PATH)
    ? (JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as LocalClip[])
    : [];

  const existingIds = new Set(existing.map((c) => c.id));
  const cellCounts = new Map<string, number>();

  for (const clip of existing) {
    const lat = parseFloat(clip.lat);
    const lon = parseFloat(clip.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      const key = cellKey(lat, lon);
      cellCounts.set(key, (cellCounts.get(key) ?? 0) + 1);
    }
  }

  console.log(
    `Existing: ${existing.length} clips across ${cellCounts.size} cells. Target: ${MAX_PER_CELL} per cell.`,
  );

  // ── Step A: collect candidates ────────────────────────────────────────────
  const candidates: Array<XCRecording & { area: XCArea }> = [];

  for (const area of AREAS) {
    console.log(`\n[${area}] Fetching page 1 to get total pages…`);
    const first = await callXC(apiKey, area, 1);
    const numPages = Number(first.numPages);
    if (numPages === 0) {
      console.log(`  No pages for ${area}, skipping.`);
      continue;
    }

    // Include recordings from page 1 already fetched
    for (const r of first.recordings ?? []) {
      if (hasValidCoords(r) && !existingIds.has(r.id)) candidates.push({ ...r, area });
    }

    const pages = randomPages(numPages, PAGES_PER_AREA - 1); // -1 because we already have page 1
    console.log(`  Total pages: ${numPages}. Sampling pages: ${pages.join(", ")}`);

    for (const page of pages) {
      try {
        const res = await callXC(apiKey, area, page);
        let added = 0;
        for (const r of res.recordings ?? []) {
          if (hasValidCoords(r) && !existingIds.has(r.id)) {
            candidates.push({ ...r, area });
            added++;
          }
        }
        console.log(`  Page ${page}: +${added} valid candidates`);
      } catch (err) {
        console.warn(`  Page ${page} failed: ${err}`);
      }
    }
  }

  console.log(`\nTotal candidates: ${candidates.length}`);

  // ── Step B: geographic dedup ──────────────────────────────────────────────
  const grouped = new Map<string, Array<XCRecording & { area: XCArea }>>();
  for (const r of candidates) {
    const key = cellKey(parseFloat(r.lat), parseFloat(r.lon));
    const current = cellCounts.get(key) ?? 0;
    if (current >= MAX_PER_CELL) continue; // cell already full from existing clips
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r);
  }

  const selected: Array<XCRecording & { area: XCArea }> = [];
  for (const [key, recs] of grouped) {
    const existing = cellCounts.get(key) ?? 0;
    const slots = MAX_PER_CELL - existing;
    const picks = shuffle(recs).slice(0, slots);
    selected.push(...picks);
    console.log(`  Cell ${key}: picking ${picks.length} of ${recs.length} candidates (${existing} already in cell)`);
  }

  console.log(`\nSelected ${selected.length} new clips to download.`);
  if (selected.length === 0) {
    console.log("Nothing to download. All cells at capacity. Increase MAX_PER_CELL to add more.");
    return;
  }

  // ── Step C: download files ────────────────────────────────────────────────
  const newClips: LocalClip[] = [];
  let downloaded = 0;
  let skipped = 0;

  for (const rec of selected) {
    const filename = `XC${rec.id}.mp3`;
    const dest = path.join(CLIPS_DIR, filename);

    if (fs.existsSync(dest)) {
      skipped++;
    } else {
      try {
        const resp = await fetch(rec.file);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const buf = Buffer.from(await resp.arrayBuffer());
        fs.writeFileSync(dest, buf);
        downloaded++;
        process.stdout.write(`  [${downloaded + skipped}/${selected.length}] Downloaded ${filename}\r`);
        await sleep(DOWNLOAD_DELAY_MS);
      } catch (err) {
        console.warn(`\n  Failed to download ${filename}: ${err}`);
        continue; // don't add to manifest if download failed
      }
    }

    newClips.push({
      id: rec.id,
      area: rec.area,
      file: `/clips/${filename}`,
      en: rec.en,
      gen: rec.gen,
      sp: rec.sp,
      cnt: rec.cnt,
      loc: rec.loc,
      lat: rec.lat,
      lon: rec.lon,
      rec: rec.rec,
      date: rec.date,
      time: rec.time,
      also: rec.also ?? [],
      url: rec.url,
      lic: rec.lic,
      q: rec.q,
      length: rec.length,
    });
  }

  console.log(`\nDownloaded: ${downloaded}, Skipped (already existed): ${skipped}`);

  // ── Step D: write manifest ────────────────────────────────────────────────
  const merged = [...existing, ...newClips];
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(merged, null, 2));
  console.log(`\nManifest written: ${merged.length} total clips → ${MANIFEST_PATH}`);

  // Summary stats
  const byArea = new Map<string, number>();
  for (const c of merged) byArea.set(c.area, (byArea.get(c.area) ?? 0) + 1);
  console.log("\nClips by area:");
  for (const [area, count] of [...byArea.entries()].sort()) {
    console.log(`  ${area}: ${count}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
