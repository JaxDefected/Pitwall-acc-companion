/**
 * Workshop ACC export decoder: raw ACC click -> real value.
 *
 * IMPORTANT: these rules are INFERRED from the source data, not documented by it.
 * Keep every conversion rule in this file so it is easy to change; re-run
 * `npx tsx scripts/import-workshop-acc.ts <json>` after editing to regenerate the data.
 *
 * Guarantees:
 *  - Never throws. Any failed lookup falls back to the raw click with status "undecoded".
 *  - Tyre pressures and all PIT.* fields are kept as raw clicks (no psi mapping in the data).
 */
import type {
  DecodedField,
  DecodedValue,
  DecodeStatus,
  ImportedFieldLayout,
  LinearMap,
  PerWheelLinearKey,
  SingleLinearKey,
  WheelIndex,
  WorkshopRawCar,
} from "../types/workshopAcc";

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

type FieldRule =
  | { kind: "raw"; unit: string }
  | { kind: "linearPerWheel"; key: PerWheelLinearKey; unit: string }
  | { kind: "linear"; key: SingleLinearKey; unit: string }
  | { kind: "caster"; unit: string }
  | { kind: "wheelRate"; unit: string }
  | { kind: "rideHeight"; unit: string };

const raw = (unit = ""): FieldRule => ({ kind: "raw", unit });

/** Units follow the conventions already used in the app's setup viewer. */
export const FIELD_RULES: Readonly<Record<string, FieldRule>> = {
  "basicSetup.tyres.tyreCompound": raw(),
  "basicSetup.tyres.tyrePressure": raw("click"),
  "basicSetup.alignment.camber": { kind: "linearPerWheel", key: "camber", unit: "°" },
  "basicSetup.alignment.toe": { kind: "linearPerWheel", key: "toe", unit: "°" },
  "basicSetup.alignment.casterLF": { kind: "caster", unit: "°" },
  "basicSetup.alignment.steerRatio": { kind: "linear", key: "steer", unit: "" },
  "basicSetup.electronics.tC1": raw(),
  "basicSetup.electronics.tC2": raw(),
  "basicSetup.electronics.abs": raw(),
  "basicSetup.electronics.eCUMap": raw(),
  "basicSetup.electronics.telemetryLaps": raw(),
  // ACC stores fuel as litres (not clicks)
  "basicSetup.strategy.fuel": raw("L"),
  "basicSetup.strategy.fuelPerLap": raw("L/lap"),
  "basicSetup.strategy.tyreSet": raw(),
  "basicSetup.strategy.frontBrakePadCompound": raw(),
  "basicSetup.strategy.rearBrakePadCompound": raw(),
  "basicSetup.strategy.nPitStops": raw(),
  "PIT.fuelToAdd": raw(),
  "PIT.tyres.tyreCompound": raw(),
  "PIT.tyreSet": raw(),
  "PIT.tyres.tyrePressure": raw("click"),
  "PIT.frontBrakePadCompound": raw(),
  "PIT.rearBrakePadCompound": raw(),
  "advancedSetup.mechanicalBalance.aRBFront": { kind: "linear", key: "arbF", unit: "" },
  "advancedSetup.mechanicalBalance.aRBRear": { kind: "linear", key: "arbR", unit: "" },
  "advancedSetup.mechanicalBalance.wheelRate": { kind: "wheelRate", unit: "N/m" },
  "advancedSetup.mechanicalBalance.bumpStopRateUp": { kind: "linearPerWheel", key: "bumpRate", unit: "N/mm" },
  "advancedSetup.mechanicalBalance.bumpStopWindow": { kind: "linearPerWheel", key: "bumpRange", unit: "mm" },
  "advancedSetup.mechanicalBalance.brakeTorque": { kind: "linear", key: "power", unit: "%" },
  "advancedSetup.mechanicalBalance.brakeBias": { kind: "linear", key: "bias", unit: "%" },
  "advancedSetup.drivetrain.preload": { kind: "linear", key: "preload", unit: "Nm" },
  "advancedSetup.dampers.bumpSlow": { kind: "linearPerWheel", key: "bumpSlow", unit: "" },
  "advancedSetup.dampers.bumpFast": { kind: "linearPerWheel", key: "bumpFast", unit: "" },
  "advancedSetup.dampers.reboundSlow": { kind: "linearPerWheel", key: "reboundSlow", unit: "" },
  "advancedSetup.dampers.reboundFast": { kind: "linearPerWheel", key: "reboundFast", unit: "" },
  "advancedSetup.aeroBalance.rideHeight": { kind: "rideHeight", unit: "mm" },
  "advancedSetup.aeroBalance.splitter": { kind: "linear", key: "splitter", unit: "" },
  "advancedSetup.aeroBalance.rearWing": { kind: "linear", key: "wing", unit: "" },
  "advancedSetup.aeroBalance.brakeDuct": { kind: "linear", key: "duct", unit: "" },
};

export function unitFor(path: string): string {
  return FIELD_RULES[path]?.unit ?? "";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Removes binary float noise (e.g. -5 + 0.1 * 15 = -3.4999999999999996). */
export function roundValue(x: number): number {
  return Math.round(x * 1e6) / 1e6;
}

function isLinearMap(x: unknown): x is LinearMap {
  if (typeof x !== "object" || x === null) return false;
  const m = x as Record<string, unknown>;
  return typeof m.a === "number" && typeof m.b === "number" && Number.isFinite(m.a) && Number.isFinite(m.b);
}

function toWheel(slot: number): WheelIndex | null {
  return slot === 0 || slot === 1 || slot === 2 || slot === 3 ? slot : null;
}

function undecoded(click: number, unit: string, note: string): DecodedValue {
  return { click, value: null, unit, status: "undecoded", note };
}

function applyLinear(map: unknown, click: number, unit: string, label: string, status: DecodeStatus = "decoded", note?: string): DecodedValue {
  if (!isLinearMap(map)) return undecoded(click, unit, `No a/b table for ${label}`);
  const value = roundValue(map.a + map.b * click);
  if (!Number.isFinite(value)) return undecoded(click, unit, `Invalid result for ${label}`);
  return note ? { click, value, unit, status, note } : { click, value, unit, status };
}

/** True when a wheel-rate list holds indexes (0, 1, 2...) rather than N/m values. */
export function isIndexOnlyList(list: readonly number[]): boolean {
  return list.length > 0 && list.every((v) => Math.abs(v) < 100);
}

function lookupList(list: unknown, click: number, unit: string, label: string): DecodedValue {
  if (!Array.isArray(list) || list.length === 0) return undecoded(click, unit, `No ${label} list`);
  if (!Number.isInteger(click) || click < 0 || click >= list.length) {
    return undecoded(click, unit, `Click ${click} is outside the ${label} list (${list.length} entries)`);
  }
  const entry: unknown = list[click];
  if (typeof entry !== "number" || !Number.isFinite(entry)) return undecoded(click, unit, `Invalid ${label} entry`);
  return { click, value: roundValue(entry), unit, status: "decoded" };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Decodes one value.
 * @param slot index inside the field (wheel 0..3 = FL, FR, RL, RR; axle 0..1 = front, rear; 0 for scalars)
 */
export function decodeValue(car: WorkshopRawCar, path: string, slot: number, click: number): DecodedValue {
  try {
    const rule = FIELD_RULES[path];
    if (!rule) return { click, value: click, unit: "", status: "raw", note: "No decode rule for this field" };
    if (typeof click !== "number" || !Number.isFinite(click)) return undecoded(Number(click), rule.unit, "Click is not a number");

    switch (rule.kind) {
      case "raw":
        return { click, value: click, unit: rule.unit, status: "raw" };

      case "linear":
        return applyLinear(car[rule.key], click, rule.unit, rule.key);

      case "linearPerWheel": {
        const w = toWheel(slot);
        if (w === null) return undecoded(click, rule.unit, `Invalid wheel index ${slot}`);
        const key = `${rule.key}${w}` as const;
        return applyLinear(car[key], click, rule.unit, key);
      }

      case "rideHeight": {
        // ACC rideHeight array = [front, unused, rear, unused]. Slots 1 & 3 are decoded but flagged unused.
        const w = toWheel(slot);
        if (w === null) return undecoded(click, rule.unit, `Invalid wheel index ${slot}`);
        const isFront = w < 2;
        const key = isFront ? "rhF_0" : "rhR_0";
        const isUsed = w === 0 || w === 2;
        return isUsed
          ? applyLinear(car[key], click, rule.unit, key)
          : applyLinear(car[key], click, rule.unit, key, "unused", "Unused slot in ACC's ride height array");
      }

      case "caster":
        return lookupList(car.caster, click, rule.unit, "caster");

      case "wheelRate": {
        const w = toWheel(slot);
        if (w === null) return undecoded(click, rule.unit, `Invalid wheel index ${slot}`);
        const key = `wheelRate${w}` as const;
        const list = car[key];
        const result = lookupList(list, click, rule.unit, key);
        if (result.status !== "decoded") return result;
        if (isIndexOnlyList(list)) {
          return { click, value: null, unit: "", status: "index-only", note: `Lookup list holds indexes [${list.join(", ")}], not N/m` };
        }
        if (list.length === 1) {
          return { ...result, status: "single-option", note: "Lookup list has a single entry (fixed spring)" };
        }
        return result;
      }
    }
  } catch (err) {
    return undecoded(click, "", `Decode error: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/** Builds the offset table for a flat values array. */
export function buildLayout(paths: readonly string[], widths: readonly number[]): ImportedFieldLayout[] {
  let offset = 0;
  return paths.map((path, i) => {
    const width = widths[i] ?? 1;
    const entry: ImportedFieldLayout = { path, width, offset, unit: unitFor(path) };
    offset += width;
    return entry;
  });
}

/** Decodes a full flat values array into per-field values. */
export function decodeSetup(car: WorkshopRawCar, layout: readonly ImportedFieldLayout[], values: readonly number[]): DecodedField[] {
  return layout.map(({ path, width, offset }) => ({
    path,
    values: Array.from({ length: width }, (_, slot) => decodeValue(car, path, slot, values[offset + slot] ?? Number.NaN)),
  }));
}
