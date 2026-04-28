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
  url: string;
  file: string;
  lic: string;
  q: string;
  length: string;
  time: string;
  date: string;
  also: string[];
}

export type Area = "worldwide" | "america" | "europe" | "asia" | "africa" | "australasia";

export interface LatLng {
  lat: number;
  lng: number;
}

export type Phase = "idle" | "loading" | "guessing" | "revealed" | "error";
