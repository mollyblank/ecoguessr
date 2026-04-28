import { describe, it, expect } from "vitest";
import { distanceKm } from "./haversine";

describe("distanceKm", () => {
  it("returns 0 for identical points", () => {
    expect(distanceKm({ lat: 51.5, lng: -0.12 }, { lat: 51.5, lng: -0.12 })).toBe(0);
  });

  it("matches London → Paris (~344 km)", () => {
    const london = { lat: 51.5074, lng: -0.1278 };
    const paris = { lat: 48.8566, lng: 2.3522 };
    expect(distanceKm(london, paris)).toBeGreaterThan(330);
    expect(distanceKm(london, paris)).toBeLessThan(360);
  });

  it("matches NYC → Sydney (~15990 km)", () => {
    const nyc = { lat: 40.7128, lng: -74.006 };
    const sydney = { lat: -33.8688, lng: 151.2093 };
    expect(distanceKm(nyc, sydney)).toBeGreaterThan(15800);
    expect(distanceKm(nyc, sydney)).toBeLessThan(16100);
  });

  it("is symmetric", () => {
    const a = { lat: 35, lng: 139 };
    const b = { lat: -22, lng: -43 };
    expect(distanceKm(a, b)).toBeCloseTo(distanceKm(b, a), 6);
  });
});
