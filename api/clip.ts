import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

const AREAS = ["worldwide", "america", "europe", "asia", "africa", "australasia"] as const;
type Area = (typeof AREAS)[number];

interface LocalClip {
  id: string;
  area: string;
  file: string;
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

let clips: LocalClip[] | null = null;

function loadClips(): LocalClip[] {
  if (clips) return clips;
  const manifestPath = path.resolve(process.cwd(), "public/clips.json");
  clips = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as LocalClip[];
  return clips;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const allClips = loadClips();

  const areaParam = (req.query.area as string | undefined) ?? "worldwide";
  if (!(AREAS as readonly string[]).includes(areaParam)) {
    return res.status(400).json({ error: `Invalid area "${areaParam}". Valid: ${AREAS.join(", ")}` });
  }

  const pool =
    areaParam === "worldwide"
      ? allClips
      : allClips.filter((c) => c.area === areaParam);

  if (pool.length === 0) {
    return res.status(404).json({ error: `No clips available for area "${areaParam}"` });
  }

  const clip = pool[Math.floor(Math.random() * pool.length)];
  return res.json(clip);
}
