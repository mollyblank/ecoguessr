import "dotenv/config";
import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import { AREAS } from "./xc.js";

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

function loadClips(): LocalClip[] {
  const manifestPath = path.resolve(process.cwd(), "public/clips.json");
  if (!fs.existsSync(manifestPath)) {
    console.warn("[server] WARNING: public/clips.json not found — run `npm run download` first");
    return [];
  }
  const clips = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as LocalClip[];
  console.log(`[server] Loaded ${clips.length} clips from manifest`);
  return clips;
}

const allClips = loadClips();

const app = express();
app.use(cors());

const PORT = Number(process.env.PORT ?? 3001);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, clips: allClips.length });
});

app.get("/api/clip", (req, res) => {
  if (allClips.length === 0) {
    res.status(503).json({ error: "No clips available — run `npm run download` to populate the library" });
    return;
  }

  const areaParam = (req.query.area as string | undefined) ?? "worldwide";
  if (!(AREAS as readonly string[]).includes(areaParam)) {
    res.status(400).json({ error: `Invalid area "${areaParam}". Valid: ${AREAS.join(", ")}` });
    return;
  }

  const pool =
    areaParam === "worldwide" ? allClips : allClips.filter((c) => c.area === areaParam);

  if (pool.length === 0) {
    res.status(404).json({ error: `No clips available for area "${areaParam}"` });
    return;
  }

  const clip = pool[Math.floor(Math.random() * pool.length)];
  res.json(clip);
});

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
