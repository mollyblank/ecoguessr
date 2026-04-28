const BASE = "https://xeno-canto.org/api/3/recordings";

export const AREAS = ["worldwide", "america", "europe", "asia", "africa", "australasia"] as const;
export type Area = (typeof AREAS)[number];

export interface XCRecording {
  id: string;
  gen: string;
  sp: string;
  ssp?: string;
  en: string;
  rec: string;
  cnt: string;
  loc: string;
  lat: string;
  lon: string;
  alt?: string;
  type?: string;
  url: string;
  file: string;
  "file-name"?: string;
  lic: string;
  q: string;
  length: string;
  time: string;
  date: string;
  also: string[];
}

interface XCResponse {
  numRecordings: string | number;
  numSpecies: string | number;
  page: number;
  numPages: number;
  recordings: XCRecording[];
}

const META_TTL_MS = 60 * 60 * 1000;
const metaCache = new Map<Area, { numPages: number; expires: number }>();

function buildQuery(area: Area): string {
  const tags = ["q_gt:D", "len:10-20", "grp:birds"];
  if (area !== "worldwide") tags.push(`area:${area}`);
  return tags.join(" ");
}

// Polite serial gate: at most one in-flight Xeno-Canto request, with at
// least MIN_INTERVAL_MS between the end of one and the start of the next.
const MIN_INTERVAL_MS = 1100;
let xcChain: Promise<unknown> = Promise.resolve();

function rateLimited<T>(fn: () => Promise<T>): Promise<T> {
  const previous = xcChain;
  let releaseSlot!: () => void;
  xcChain = new Promise<void>((r) => {
    releaseSlot = r;
  });
  return (async () => {
    await previous.catch(() => {});
    try {
      return await fn();
    } finally {
      setTimeout(releaseSlot, MIN_INTERVAL_MS);
    }
  })();
}

async function callXC(apiKey: string, query: string, page: number): Promise<XCResponse> {
  return rateLimited(async () => {
    const params = new URLSearchParams({
      query,
      key: apiKey,
      page: String(page),
    });
    const url = `${BASE}?${params}`;
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Xeno-Canto ${res.status}: ${body.slice(0, 200)}`);
    }
    return (await res.json()) as XCResponse;
  });
}

async function getNumPages(apiKey: string, area: Area, query: string): Promise<number> {
  const cached = metaCache.get(area);
  if (cached && cached.expires > Date.now()) return cached.numPages;

  const res = await callXC(apiKey, query, 1);
  const numPages = Number(res.numPages);
  metaCache.set(area, { numPages, expires: Date.now() + META_TTL_MS });
  return numPages;
}

export async function fetchRandomRecording(apiKey: string, area: Area): Promise<XCRecording> {
  const query = buildQuery(area);
  const numPages = await getNumPages(apiKey, area, query);
  if (numPages === 0) throw new Error(`No recordings found for area "${area}"`);

  const randomPage = Math.floor(Math.random() * numPages) + 1;
  const res = await callXC(apiKey, query, randomPage);
  const recs = res.recordings ?? [];
  if (recs.length === 0) throw new Error(`Empty page ${randomPage}/${numPages} for area "${area}"`);
  const rec = recs[Math.floor(Math.random() * recs.length)];
  return rec;
}
