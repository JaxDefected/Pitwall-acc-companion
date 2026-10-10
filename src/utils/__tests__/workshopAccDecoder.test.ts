import { describe, it, expect } from "vitest";
import { buildLayout, decodeSetup, decodeValue, isIndexOnlyList, roundValue } from "../workshopAccDecoder";
import type { LinearMap, WorkshopRawCar } from "../../types/workshopAcc";

const lin = (a: number, b: number): LinearMap => ({ a, b });

/** Minimal car fixture modelled on the BMW M2 record in the source dataset. */
function makeCar(overrides: Partial<WorkshopRawCar> = {}): WorkshopRawCar {
  const front = { camber: lin(-5, 0.1), toe: lin(-0.2, 0.01) };
  const rear = { camber: lin(-3.5, 0.1), toe: lin(0, 0.01) };
  const damper = lin(0, 1);
  return {
    n: "Test Car",
    c: "GT3",
    g: "GT3",
    id: "test_car",
    cls: "GT3",
    caster: [8.5, 8.7, 8.9],
    camber0: front.camber, camber1: front.camber, camber2: rear.camber, camber3: rear.camber,
    toe0: front.toe, toe1: front.toe, toe2: rear.toe, toe3: rear.toe,
    wheelRate0: [162000, 180000, 198000], wheelRate1: [162000, 180000, 198000],
    wheelRate2: [103000, 117000, 131000], wheelRate3: [103000, 117000, 131000],
    bumpRate0: lin(300, 100), bumpRate1: lin(300, 100), bumpRate2: lin(300, 100), bumpRate3: lin(300, 100),
    bumpRange0: lin(0, 1), bumpRange1: lin(0, 1), bumpRange2: lin(0, 1), bumpRange3: lin(0, 1),
    bumpSlow0: damper, bumpSlow1: damper, bumpSlow2: damper, bumpSlow3: damper,
    bumpFast0: damper, bumpFast1: damper, bumpFast2: damper, bumpFast3: damper,
    reboundSlow0: damper, reboundSlow1: damper, reboundSlow2: damper, reboundSlow3: damper,
    reboundFast0: damper, reboundFast1: damper, reboundFast2: damper, reboundFast3: damper,
    arbF: lin(0, 1), arbR: lin(0, 1), bias: lin(56, 0.2), power: lin(80, 1), preload: lin(20, 10),
    steer: lin(10, 1), duct: lin(0, 1), wing: lin(1, 1), splitter: lin(0, 1),
    rhF_0: lin(125, 1), rhR_0: lin(140, 1),
    ...overrides,
  };
}

const P = {
  camber: "basicSetup.alignment.camber",
  toe: "basicSetup.alignment.toe",
  caster: "basicSetup.alignment.casterLF",
  wheelRate: "advancedSetup.mechanicalBalance.wheelRate",
  rideHeight: "advancedSetup.aeroBalance.rideHeight",
  tyrePressure: "basicSetup.tyres.tyrePressure",
  pitPressure: "PIT.tyres.tyrePressure",
  bias: "advancedSetup.mechanicalBalance.brakeBias",
  duct: "advancedSetup.aeroBalance.brakeDuct",
} as const;

describe("workshopAccDecoder – camber", () => {
  const car = makeCar();
  it("applies a + b * click per wheel (front table)", () => {
    expect(decodeValue(car, P.camber, 0, 15)).toMatchObject({ value: -3.5, unit: "°", status: "decoded", click: 15 });
    expect(decodeValue(car, P.camber, 1, 0).value).toBe(-5);
  });
  it("uses the rear table for RL/RR", () => {
    expect(decodeValue(car, P.camber, 2, 10).value).toBe(-2.5);
    expect(decodeValue(car, P.camber, 3, 0).value).toBe(-3.5);
  });
  it("removes float noise", () => {
    expect(roundValue(-5 + 0.1 * 15)).toBe(-3.5);
  });
});

describe("workshopAccDecoder – toe", () => {
  const car = makeCar();
  it("decodes front and rear toe with their own tables", () => {
    expect(decodeValue(car, P.toe, 0, 20)).toMatchObject({ value: 0, unit: "°", status: "decoded" });
    expect(decodeValue(car, P.toe, 1, 15).value).toBe(-0.05);
    expect(decodeValue(car, P.toe, 2, 30).value).toBe(0.3);
    expect(decodeValue(car, P.toe, 3, 4).value).toBe(0.04);
  });
});

describe("workshopAccDecoder – wheelRate list lookup", () => {
  it("looks up N/m by click, front and rear lists separately", () => {
    const car = makeCar();
    expect(decodeValue(car, P.wheelRate, 0, 1)).toMatchObject({ value: 180000, unit: "N/m", status: "decoded" });
    expect(decodeValue(car, P.wheelRate, 3, 2).value).toBe(131000);
  });

  it("flags out-of-range clicks as undecoded without throwing", () => {
    const r = decodeValue(makeCar(), P.wheelRate, 0, 7);
    expect(r).toMatchObject({ click: 7, value: null, status: "undecoded" });
  });

  it("flags index-valued lists (Porsche 935 / 991 II GT2 RS / 991 II Cup) as index-only", () => {
    const idx = [0, 1, 2, 3];
    const car = makeCar({ wheelRate0: idx, wheelRate1: idx, wheelRate2: idx, wheelRate3: idx });
    const r = decodeValue(car, P.wheelRate, 0, 2);
    expect(r.status).toBe("index-only");
    expect(r.value).toBeNull();
    expect(r.click).toBe(2);
    expect(isIndexOnlyList(idx)).toBe(true);
  });

  it("flags the 992 GT3 Cup single index entry [1] as index-only", () => {
    const car = makeCar({ wheelRate0: [1], wheelRate1: [1], wheelRate2: [1], wheelRate3: [1] });
    expect(decodeValue(car, P.wheelRate, 2, 0).status).toBe("index-only");
  });

  it("flags the Mercedes AMG GT4 single physical rear entry as single-option but keeps the value", () => {
    const car = makeCar({ wheelRate2: [66000], wheelRate3: [66000], wheelRate0: [78000, 88000, 104000] });
    expect(decodeValue(car, P.wheelRate, 2, 0)).toMatchObject({ value: 66000, status: "single-option" });
    expect(decodeValue(car, P.wheelRate, 0, 2)).toMatchObject({ value: 104000, status: "decoded" });
  });
});

describe("workshopAccDecoder – rideHeight front/rear split", () => {
  const car = makeCar();
  it("uses rhF_0 for slot 0 and rhR_0 for slot 2", () => {
    expect(decodeValue(car, P.rideHeight, 0, 0)).toMatchObject({ value: 125, unit: "mm", status: "decoded" });
    expect(decodeValue(car, P.rideHeight, 2, 15)).toMatchObject({ value: 155, unit: "mm", status: "decoded" });
  });
  it("decodes slots 1 and 3 with the same axle table but marks them unused", () => {
    expect(decodeValue(car, P.rideHeight, 1, 6)).toMatchObject({ value: 131, status: "unused" });
    expect(decodeValue(car, P.rideHeight, 3, 18)).toMatchObject({ value: 158, status: "unused" });
  });
});

describe("workshopAccDecoder – caster edge case (Ferrari 488 Challenge Evo)", () => {
  const casterList = Array.from({ length: 98 }, (_, i) => roundValue(6 + i * 0.1));
  const car = makeCar({ caster: casterList });
  it("decodes in-range clicks via list lookup", () => {
    expect(decodeValue(car, P.caster, 0, 10)).toMatchObject({ value: 7, unit: "°", status: "decoded" });
  });
  it("click 98 is out of range: keeps the raw click, value n/a, status undecoded, no throw", () => {
    let r: ReturnType<typeof decodeValue> | undefined;
    expect(() => { r = decodeValue(car, P.caster, 0, 98); }).not.toThrow();
    expect(r).toMatchObject({ click: 98, value: null, status: "undecoded" });
    expect(r?.note).toMatch(/98/);
  });
});

describe("workshopAccDecoder – raw fields and fallbacks", () => {
  const car = makeCar();
  it("keeps tyre pressures and PIT.* as raw clicks", () => {
    expect(decodeValue(car, P.tyrePressure, 0, 34)).toMatchObject({ click: 34, value: 34, unit: "click", status: "raw" });
    expect(decodeValue(car, P.pitPressure, 3, 55)).toMatchObject({ value: 55, status: "raw" });
  });
  it("decodes scalar linear fields (brake bias) and width-2 brake ducts", () => {
    expect(decodeValue(car, P.bias, 0, 10).value).toBe(58);
    expect(decodeValue(car, P.duct, 1, 3).value).toBe(3);
  });
  it("marks a missing a/b table as undecoded instead of throwing", () => {
    const broken = makeCar({ camber0: undefined as unknown as LinearMap });
    expect(decodeValue(broken, P.camber, 0, 5)).toMatchObject({ click: 5, value: null, status: "undecoded" });
  });
  it("marks non-numeric clicks as undecoded", () => {
    expect(decodeValue(car, P.camber, 0, Number.NaN).status).toBe("undecoded");
  });
});

describe("workshopAccDecoder – full setup", () => {
  it("splits a 76-value array by layout and decodes every field", () => {
    const paths = [P.tyrePressure, P.camber, P.rideHeight, P.duct];
    const widths = [4, 4, 4, 2];
    const layout = buildLayout(paths, widths);
    expect(layout.map((l) => l.offset)).toEqual([0, 4, 8, 12]);
    const fields = decodeSetup(makeCar(), layout, [34, 54, 38, 55, 0, 0, 10, 10, 0, 6, 15, 18, 5, 2]);
    expect(fields[0].values.map((v) => v.value)).toEqual([34, 54, 38, 55]);
    expect(fields[1].values.map((v) => v.value)).toEqual([-5, -5, -2.5, -2.5]);
    expect(fields[2].values.map((v) => v.status)).toEqual(["decoded", "unused", "decoded", "unused"]);
    expect(fields[3].values.map((v) => v.value)).toEqual([5, 2]);
  });
});
