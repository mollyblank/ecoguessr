const MAX_SCORE = 5000;
const DECAY_KM = 2000;

export function scoreFromKm(km: number): number {
  return Math.round(MAX_SCORE * Math.exp(-km / DECAY_KM));
}
