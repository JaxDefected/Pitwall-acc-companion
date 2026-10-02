import { describe, it, expect } from "vitest";
import { calculateTransitionCoolingModel, getPressureColor } from "../thermalEngine";

describe("Thermal Behavior Engine v1.9", () => {
  it("calculates realistic cooling for a 45-minute sunset transition (18:00 start)", () => {
    const res = calculateTransitionCoolingModel({
      startTime: "18:00",
      durationMinutes: 45,
      startTrackTemp: 32,
      startAmbientTemp: 24,
    });

    expect(res.trend).toBe("cooling");
    expect(res.trackDrop).toBeGreaterThan(2.0);
    expect(res.trackDrop).toBeLessThan(5.0);
    expect(res.ambientDrop).toBeGreaterThan(0.5);
    expect(res.ambientDrop).toBeLessThan(2.0);
    // Pressure compensation should be positive (increase cold starting pressure)
    expect(res.compensationPSI).toBeGreaterThan(0.2);
    expect(res.compensationPSI).toBeLessThan(0.6);
    expect(res.compensationClicks).toBe(Math.round(res.compensationPSI * 10));
    expect(res.coolingType).toContain("Sunset");
  });

  it("handles multi-hour endurance transitions across sunset and dusk smoothly without runaway drops", () => {
    const res = calculateTransitionCoolingModel({
      startTime: "17:00",
      durationMinutes: 180, // 3-hour race ending at 20:00
      startTrackTemp: 35,
      startAmbientTemp: 26,
    });

    expect(res.trend).toBe("cooling");
    // Track drop over 3 hours should be around 10-12°C, not 30°C!
    expect(res.trackDrop).toBeGreaterThan(7.0);
    expect(res.trackDrop).toBeLessThan(15.0);
    expect(res.finishTrackTemp).toBeGreaterThan(20);
    expect(res.compensationPSI).toBeGreaterThan(0.5);
    expect(res.compensationPSI).toBeLessThan(1.2);
  });

  it("calculates morning warming correctly (08:00 start)", () => {
    const res = calculateTransitionCoolingModel({
      startTime: "08:00",
      durationMinutes: 60,
      startTrackTemp: 20,
      startAmbientTemp: 18,
    });

    expect(res.trend).toBe("warming");
    expect(res.trackDrop).toBeLessThan(0); // Negative drop means temperature increased
    expect(res.ambientDrop).toBeLessThan(0);
    expect(res.compensationPSI).toBeLessThan(0); // Cold pressures must decrease as temps rise
    expect(res.coolingType).toContain("Morning");
    expect(res.finishTrackTemp).toBeGreaterThan(20);
  });

  it("handles midday heat stability (12:00 start)", () => {
    const res = calculateTransitionCoolingModel({
      startTime: "12:00",
      durationMinutes: 30,
      startTrackTemp: 38,
      startAmbientTemp: 29,
    });

    expect(Math.abs(res.trackDrop)).toBeLessThan(1.0);
    expect(Math.abs(res.compensationPSI)).toBeLessThanOrEqual(0.1);
  });

  it("clamps track temperature to physical equilibrium bounds", () => {
    // If user enters absurd initial temperatures
    const res = calculateTransitionCoolingModel({
      startTime: "02:00",
      durationMinutes: 60,
      startTrackTemp: 15,
      startAmbientTemp: 20,
    });

    expect(res.finishTrackTemp).toBeGreaterThanOrEqual(res.finishAmbientTemp - 2.0);
  });

  describe("getPressureColor", () => {
    it("identifies optimal ACC v1.9 dry slick range (26.0 - 27.0 PSI)", () => {
      expect(getPressureColor(26.0)).toContain("text-emerald-700");
      expect(getPressureColor(26.6)).toContain("text-emerald-700");
      expect(getPressureColor(27.0)).toContain("text-emerald-700");
    });

    it("identifies marginal warning boundaries", () => {
      expect(getPressureColor(25.8)).toContain("text-amber-700");
      expect(getPressureColor(27.2)).toContain("text-amber-700");
    });

    it("identifies cold / underinflated tyres", () => {
      expect(getPressureColor(25.0)).toContain("text-blue-700");
      expect(getPressureColor(24.5)).toContain("text-blue-700");
    });

    it("identifies hot / overinflated tyres", () => {
      expect(getPressureColor(27.8)).toContain("text-red-700");
      expect(getPressureColor(28.5)).toContain("text-red-700");
    });

    it("identifies wet compound optimal window (29.5 - 30.5 PSI)", () => {
      expect(getPressureColor(30.0, true)).toContain("text-cyan-700");
      expect(getPressureColor(28.5, true)).toContain("text-blue-700");
      expect(getPressureColor(31.0, true)).toContain("text-red-700");
    });
  });
});
