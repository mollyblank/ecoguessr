import { describe, it, expect } from "vitest";
import { scoreFromKm } from "./score";

describe("scoreFromKm", () => {
  it("max score at 0 km", () => {
    expect(scoreFromKm(0)).toBe(5000);
  });

  it("decays monotonically", () => {
    const s1 = scoreFromKm(100);
    const s2 = scoreFromKm(1000);
    const s3 = scoreFromKm(5000);
    expect(s1).toBeGreaterThan(s2);
    expect(s2).toBeGreaterThan(s3);
  });

  it("yields ~3033 at 1000 km", () => {
    expect(scoreFromKm(1000)).toBeGreaterThan(3000);
    expect(scoreFromKm(1000)).toBeLessThan(3100);
  });

  it("approaches 0 for very far guesses", () => {
    expect(scoreFromKm(20000)).toBeLessThan(1);
  });
});
