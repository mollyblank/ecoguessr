import type { Area, XCRecording } from "../types";

export async function fetchClip(area: Area): Promise<XCRecording> {
  const res = await fetch(`/api/clip?area=${encodeURIComponent(area)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return (await res.json()) as XCRecording;
}
