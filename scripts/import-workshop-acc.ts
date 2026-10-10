/**
 * One-off importer for the "Workshop ACC export" setup dataset.
 *
 * Usage:
 *   npx tsx scripts/import-workshop-acc.ts <path/to/workshop_acc_data.json>
 *
 * Output (all generated, safe to delete to remove the import):
 *   public/data/imported/workshop-acc/manifest.json        – source info, layout, car index, track stats
 *   public/data/imported/workshop-acc/cars/<appCarId>.json – per-car a/b + list tables and setups
 *   reports/workshop-acc-import-report.md                  – matching, row counts, slider-range mismatches
 *
 * Existing setups / Firestore data are never touched. Files are served statically and
 * fetched lazily per car by src/services/importedSetups.ts.
 */
import fs from "node:fs";
import path from "node:path";
import { cars, type CarSetupConfig } from "../src/data/cars";
import { ACC_CARS, ACC_TRACKS } from "../src/utils/accParser";
import { buildLayout, decodeSetup, isIndexOnlyList, roundValue } from "../src/utils/workshopAccDecoder";
import {
  WORKSHOP_SLOTS,
  WORKSHOP_SOURCE_ID,
  type DecodeStatus,
  type ImportedCarFile,
  type ImportedCarIndexEntry,
  type ImportedFieldLayout,
  type ImportedManifest,
  type ImportedSetupRow,
  type ImportedSourceInfo,
  type ImportedTrackStats,
  type LinearMap,
  type WorkshopRawCar,
  type WorkshopRawDataset,
  type WorkshopRawSetupRow,
  type WorkshopSlot,
} from "../src/types/workshopAcc";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "data", "imported", WORKSHOP_SOURCE_ID);
const REPORT_PATH = path.join(ROOT, "reports", "workshop-acc-import-report.md");
const EXPECTED_SETUPS = 8325;
const EXPECTED_VALUES = 76;
const EXPECTED_SLOT_COUNTS: Readonly<Record<WorkshopSlot, number>> = {
  "Q-ATTACK": 1350,
  "Q-STEADY": 1350,
  "R-ATTACK": 1350,
  "R-STEADY": 1350,
  WET: 1350,
  HYBRID: 925,
  LFM: 650,
};

/** Source car id -> existing app car id, for cars the source names differently. */
const CAR_ID_ALIASES: Readonly<Record<string, string>> = {
  audi_r8_gt4: "audi_r8_lms_gt4",
};

/** Source track id -> existing app track id (none needed today). */
const TRACK_ID_ALIASES: Readonly<Record<string, string>> = {};

// ---------------------------------------------------------------------------
// Validation (no `any`: parse as unknown, then assert the shape)
// ---------------------------------------------------------------------------

function fail(msg: string): never {
  throw new Error(`[import-workshop-acc] ${msg}`);
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function isNumArray(x: unknown): x is number[] {
  return Array.isArray(x) && x.every((v) => typeof v === "number");
}

function isLinear(x: unknown): x is LinearMap {
  return isRecord(x) && typeof x.a === "number" && typeof x.b === "number";
}

const PER_WHEEL_LINEAR = ["camber", "toe", "bumpRate", "bumpRange", "bumpSlow", "bumpFast", "reboundSlow", "reboundFast"];
const SINGLE_LINEAR = ["arbF", "arbR", "bias", "power", "preload", "steer", "duct", "wing", "splitter", "rhF_0", "rhR_0"];

function assertCar(x: unknown, i: number): asserts x is WorkshopRawCar {
  if (!isRecord(x)) fail(`cars[${i}] is not an object`);
  for (const k of ["n", "c", "g", "id", "cls"]) if (typeof x[k] !== "string") fail(`cars[${i}].${k} must be a string`);
  if (!isNumArray(x.caster)) fail(`cars[${i}].caster must be a number[]`);
  for (const k of SINGLE_LINEAR) if (!isLinear(x[k])) fail(`cars[${i}].${k} must be {a,b}`);
  for (let w = 0; w < 4; w++) {
    for (const k of PER_WHEEL_LINEAR) if (!isLinear(x[`${k}${w}`])) fail(`cars[${i}].${k}${w} must be {a,b}`);
    if (!isNumArray(x[`wheelRate${w}`])) fail(`cars[${i}].wheelRate${w} must be a number[]`);
  }
}

function assertRow(x: unknown, i: number): asserts x is WorkshopRawSetupRow {
  if (!Array.isArray(x) || x.length !== 9) fail(`setups[${i}] must be a 9-element array`);
  const [c, t, s, f3, f4, f5, f6, adj, values] = x as unknown[];
  if (![c, t, s, f4, f5, f6].every((v) => typeof v === "number")) fail(`setups[${i}] has non-numeric index/unknown fields`);
  if (typeof f3 !== "string") fail(`setups[${i}][3] must be a string`);
  if (!Array.isArray(adj) || !adj.every((a) => Array.isArray(a) && a.length === 4 && typeof a[0] === "string")) {
    fail(`setups[${i}][7] must be an adjustments array`);
  }
  if (!isNumArray(values) || values.length !== EXPECTED_VALUES) fail(`setups[${i}][8] must be ${EXPECTED_VALUES} numbers`);
}

function assertDataset(x: unknown): asserts x is WorkshopRawDataset {
  if (!isRecord(x)) fail("root is not an object");
  if (typeof x.v !== "string") fail("v must be a string");
  if (!Array.isArray(x.paths) || !x.paths.every((p) => typeof p === "string")) fail("paths must be string[]");
  if (!isNumArray(x.widths) || x.widths.length !== x.paths.length) fail("widths must be number[] matching paths");
  const sum = x.widths.reduce((a, b) => a + b, 0);
  if (sum !== EXPECTED_VALUES) fail(`widths sum to ${sum}, expected ${EXPECTED_VALUES}`);
  if (!Array.isArray(x.slots) || x.slots.join() !== WORKSHOP_SLOTS.join()) fail(`slots must be ${WORKSHOP_SLOTS.join(",")}`);
  if (!Array.isArray(x.cars)) fail("cars must be an array");
  x.cars.forEach((c, i) => assertCar(c, i));
  if (!Array.isArray(x.tracks)) fail("tracks must be an array");
  x.tracks.forEach((t, i) => {
    if (!isRecord(t) || typeof t.id !== "string" || typeof t.n !== "string") fail(`tracks[${i}] needs id and n`);
    for (const k of ["avg_kmh", "top_kmh", "brake_zones", "hot_psi", "brake_peak_C", "len", "lap"]) {
      if (typeof t[k] !== "number") fail(`tracks[${i}].${k} must be a number`);
    }
  });
  if (!Array.isArray(x.setups)) fail("setups must be an array");
  const carCount = x.cars.length, trackCount = x.tracks.length;
  x.setups.forEach((r, i) => {
    assertRow(r, i);
    if (r[0] < 0 || r[0] >= carCount || r[1] < 0 || r[1] >= trackCount || r[2] < 0 || r[2] >= WORKSHOP_SLOTS.length) {
      fail(`setups[${i}] has an out-of-range car/track/slot index`);
    }
  });
}

// ---------------------------------------------------------------------------
// Slider range validation against src/data/cars.ts (report only; cars.ts is not modified)
// ---------------------------------------------------------------------------

interface RangeMismatch {
  car: string;
  param: string;
  app: string;
  dataset: string;
  note: string;
}

const EPS = 1e-6;
const fmt = (n: number) => String(roundValue(n));
const fmtRange = (r: readonly number[] | undefined) => (r ? `[${r.map(fmt).join(", ")}]` : "—");

function checkCarRanges(appId: string, cfg: CarSetupConfig, car: WorkshopRawCar, clickRange: [number, number][], layout: ImportedFieldLayout[]): RangeMismatch[] {
  const out: RangeMismatch[] = [];
  const offsetOf = (p: string) => layout.find((l) => l.path === p)?.offset ?? -1;
  const maxClickAt = (p: string, slot: number) => clickRange[offsetOf(p) + slot]?.[1] ?? 0;

  /** Compares an app [min,max] range with a linear map + highest observed click. */
  const linear = (param: string, appRange: [number, number] | undefined, map: LinearMap, fieldPath: string, slot: number) => {
    const datasetMin = map.a;
    const observedMax = map.a + map.b * maxClickAt(fieldPath, slot);
    const dsText = `min ${fmt(datasetMin)}, step ${fmt(map.b)}, observed max ${fmt(observedMax)}`;
    if (!appRange) {
      out.push({ car: appId, param, app: "—", dataset: dsText, note: "Range missing in app" });
      return;
    }
    if (Math.abs(appRange[0] - datasetMin) > EPS) {
      out.push({ car: appId, param, app: fmtRange(appRange), dataset: dsText, note: "Min differs" });
    }
    if (observedMax > appRange[1] + EPS) {
      out.push({ car: appId, param, app: fmtRange(appRange), dataset: dsText, note: "Imported setups exceed app max" });
    }
  };

  const step = (param: string, appStep: number | undefined, map: LinearMap) => {
    if (map.b === 0 || appStep === undefined) return; // b = 0 means a fixed (non-adjustable) parameter
    if (Math.abs(appStep - map.b) > EPS) {
      out.push({ car: appId, param, app: fmt(appStep), dataset: fmt(map.b), note: "Step differs" });
    }
  };

  const list = (param: string, appList: number[] | undefined, dsList: number[]) => {
    if (isIndexOnlyList(dsList)) return; // dataset holds indexes only – not comparable
    if (!appList) {
      out.push({ car: appId, param, app: "—", dataset: `${dsList.length} entries`, note: "List missing in app" });
      return;
    }
    const same = appList.length === dsList.length && appList.every((v, i) => Math.abs(v - (dsList[i] ?? NaN)) < 0.051);
    if (!same) {
      const summary = (l: number[]) => `${l.length} entries ${fmt(l[0] ?? NaN)}…${fmt(l[l.length - 1] ?? NaN)}`;
      out.push({ car: appId, param, app: summary(appList), dataset: summary(dsList), note: "List differs" });
    }
  };

  const P = {
    camber: "basicSetup.alignment.camber",
    toe: "basicSetup.alignment.toe",
    arbF: "advancedSetup.mechanicalBalance.aRBFront",
    arbR: "advancedSetup.mechanicalBalance.aRBRear",
    bsRate: "advancedSetup.mechanicalBalance.bumpStopRateUp",
    bsWin: "advancedSetup.mechanicalBalance.bumpStopWindow",
    torque: "advancedSetup.mechanicalBalance.brakeTorque",
    bias: "advancedSetup.mechanicalBalance.brakeBias",
    steer: "basicSetup.alignment.steerRatio",
    preload: "advancedSetup.drivetrain.preload",
    bumpSlow: "advancedSetup.dampers.bumpSlow",
    bumpFast: "advancedSetup.dampers.bumpFast",
    rebSlow: "advancedSetup.dampers.reboundSlow",
    rebFast: "advancedSetup.dampers.reboundFast",
    rh: "advancedSetup.aeroBalance.rideHeight",
    splitter: "advancedSetup.aeroBalance.splitter",
    wing: "advancedSetup.aeroBalance.rearWing",
    duct: "advancedSetup.aeroBalance.brakeDuct",
  } as const;

  linear("camberFrontRange", cfg.camberFrontRange, car.camber0, P.camber, 0);
  linear("camberRearRange", cfg.camberRearRange, car.camber2, P.camber, 2);
  step("camberStep", cfg.camberStep, car.camber0);
  linear("toeFrontRange", cfg.toeFrontRange, car.toe0, P.toe, 0);
  linear("toeRearRange", cfg.toeRearRange, car.toe2, P.toe, 2);
  step("toeStep", cfg.toeStep, car.toe0);
  list("casterArr", cfg.casterArr, car.caster);
  list("wheelRatesFront", cfg.wheelRatesFront, car.wheelRate0);
  list("wheelRatesRear", cfg.wheelRatesRear, car.wheelRate2);
  linear("antirollBarFrontRange", cfg.antirollBarFrontRange, car.arbF, P.arbF, 0);
  linear("antirollBarRearRange", cfg.antirollBarRearRange, car.arbR, P.arbR, 0);
  linear("bumpStopRate (front)", cfg.bumpStopFrontRateRange ?? cfg.bumpStopRateRange, car.bumpRate0, P.bsRate, 0);
  linear("bumpStopRate (rear)", cfg.bumpStopRearRateRange ?? cfg.bumpStopRateRange, car.bumpRate2, P.bsRate, 2);
  step("bumpStopRateStep (front)", cfg.bumpStopRateFrontStep ?? cfg.bumpStopRateStep, car.bumpRate0);
  step("bumpStopRateStep (rear)", cfg.bumpStopRateRearStep ?? cfg.bumpStopRateStep, car.bumpRate2);
  linear("bumpStopWindowFrontRange", cfg.bumpStopWindowFrontRange, car.bumpRange0, P.bsWin, 0);
  linear("bumpStopWindowRearRange", cfg.bumpStopWindowRearRange, car.bumpRange2, P.bsWin, 2);
  step("bumpStopWindowStep", cfg.bumpStopWindowStep, car.bumpRange0);
  linear("brakeTorqueRange", cfg.brakeTorqueRange, car.power, P.torque, 0);
  step("brakeTorqueStep", cfg.brakeTorqueStep, car.power);
  linear("brakeBiasRange", cfg.brakeBiasRange, car.bias, P.bias, 0);
  step("brakeBiasStep", cfg.brakeBiasStep, car.bias);
  linear("steerRatioRange", cfg.steerRatioRange, car.steer, P.steer, 0);
  step("steerRatioStep", cfg.steerRatioStep, car.steer);
  linear("preloadRange", cfg.preloadRange, car.preload, P.preload, 0);
  step("preloadStep", cfg.preloadStep, car.preload);
  linear("bumpSlowRange (front)", cfg.bumpSlowRange, car.bumpSlow0, P.bumpSlow, 0);
  linear("bumpSlowRange (rear)", cfg.bumpSlowRange, car.bumpSlow2, P.bumpSlow, 2);
  linear("bumpFastRange (front)", cfg.bumpFastRange, car.bumpFast0, P.bumpFast, 0);
  linear("bumpFastRange (rear)", cfg.bumpFastRange, car.bumpFast2, P.bumpFast, 2);
  linear("reboundSlowRange (front)", cfg.reboundSlowRange, car.reboundSlow0, P.rebSlow, 0);
  linear("reboundSlowRange (rear)", cfg.reboundSlowRange, car.reboundSlow2, P.rebSlow, 2);
  linear("reboundFastRange (front)", cfg.reboundFastRange, car.reboundFast0, P.rebFast, 0);
  linear("reboundFastRange (rear)", cfg.reboundFastRange, car.reboundFast2, P.rebFast, 2);
  step("damperStep", cfg.damperStep, car.bumpSlow0);
  linear("rideHeightFrontRange", cfg.rideHeightFrontRange, car.rhF_0, P.rh, 0);
  linear("rideHeightRearRange", cfg.rideHeightRearRange, car.rhR_0, P.rh, 2);
  step("rideHeightStep", cfg.rideHeightStep, car.rhF_0);
  linear("splitterRange", cfg.splitterRange, car.splitter, P.splitter, 0);
  step("splitterStep", cfg.splitterStep, car.splitter);
  linear("rearWingRange", cfg.rearWingRange, car.wing, P.wing, 0);
  step("rearWingStep", cfg.rearWingStep, car.wing);
  linear("brakeDuctRange", cfg.brakeDuctRange, car.duct, P.duct, 0);
  step("brakeDuctStep", cfg.brakeDuctStep, car.duct);
  return out;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function mostCommon<T>(items: T[]): T | undefined {
  const counts = new Map<T, number>();
  let best: T | undefined;
  let bestCount = 0;
  for (const it of items) {
    const c = (counts.get(it) ?? 0) + 1;
    counts.set(it, c);
    if (c > bestCount) {
      best = it;
      bestCount = c;
    }
  }
  return best;
}

function main(): void {
  const inputArg = process.argv[2];
  if (!inputArg) fail("Usage: npx tsx scripts/import-workshop-acc.ts <path/to/workshop_acc_data.json>");
  const inputPath = path.resolve(inputArg);
  const parsed: unknown = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  assertDataset(parsed);
  const data = parsed;

  const source: ImportedSourceInfo = {
    id: WORKSHOP_SOURCE_ID,
    version: data.v,
    label: `Source: Workshop ACC export, data version ${data.v}. Original author unverified.`,
  };
  const layout = buildLayout(data.paths, data.widths);
  const slots = WORKSHOP_SLOTS;

  // --- Match cars -----------------------------------------------------------
  const appCarIds = new Set([...Object.keys(cars), ...Object.keys(ACC_CARS)]);
  const carMatches = data.cars.map((c) => {
    const alias = CAR_ID_ALIASES[c.id];
    const appId = alias ?? c.id;
    return { sourceId: c.id, appId, matched: appCarIds.has(appId), viaAlias: Boolean(alias), name: c.n };
  });
  const seenApp = new Map<string, string>();
  for (const m of carMatches) {
    const prev = seenApp.get(m.appId);
    if (prev) fail(`Two source cars map to the same app id "${m.appId}" (${prev}, ${m.sourceId}). Refusing to merge.`);
    seenApp.set(m.appId, m.sourceId);
  }

  // --- Match tracks ---------------------------------------------------------
  const trackMatches = data.tracks.map((t) => {
    const appId = TRACK_ID_ALIASES[t.id] ?? t.id;
    return { sourceId: t.id, appId, matched: appId in ACC_TRACKS, name: t.n };
  });

  const tracks: ImportedTrackStats[] = data.tracks.map((t, i) => ({
    id: trackMatches[i].appId,
    sourceId: t.id,
    name: t.n,
    matched: trackMatches[i].matched,
    avgKmh: t.avg_kmh,
    topKmh: t.top_kmh,
    brakeZones: t.brake_zones,
    hotPsi: t.hot_psi,
    brakePeakC: t.brake_peak_C,
    lengthKm: t.len,
    lapSeconds: t.lap,
  }));

  // --- Group rows by car ----------------------------------------------------
  const rowsByCar = new Map<number, WorkshopRawSetupRow[]>();
  const uniqueKeys = new Set<string>();
  const slotCounts = Object.fromEntries(slots.map((s) => [s, 0])) as Record<WorkshopSlot, number>;
  for (const row of data.setups) {
    const key = `${row[0]}|${row[1]}|${row[2]}`;
    if (uniqueKeys.has(key)) fail(`Duplicate setup for car/track/slot ${key}`);
    uniqueKeys.add(key);
    slotCounts[slots[row[2]]] += 1;
    const list = rowsByCar.get(row[0]) ?? [];
    list.push(row);
    rowsByCar.set(row[0], list);
  }

  // --- Write files ----------------------------------------------------------
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT_DIR, "cars"), { recursive: true });

  const carIndex: ImportedCarIndexEntry[] = [];
  const mismatches: RangeMismatch[] = [];
  const decodeIssues: string[] = [];
  const slotCoverage: string[] = [];
  let written = 0;

  data.cars.forEach((car, carIdx) => {
    const match = carMatches[carIdx];
    const rows = rowsByCar.get(carIdx) ?? [];

    const decodedRows = rows.map((r) => ({ row: r, flat: decodeSetup(car, layout, r[8]).flatMap((f) => f.values) }));

    // Car-level default status/note per flat index = most common across this car's setups
    const status: DecodeStatus[] = [];
    const notes: Record<number, string> = {};
    for (let i = 0; i < EXPECTED_VALUES; i++) {
      const perRow = decodedRows.map((d) => d.flat[i]);
      const s = mostCommon(perRow.map((v) => v.status)) ?? "raw";
      status.push(s);
      const note = perRow.find((v) => v.status === s && v.note)?.note;
      if (note) notes[i] = note;
    }

    const clickRange: [number, number][] = Array.from({ length: EXPECTED_VALUES }, (_, i) => {
      const col = rows.map((r) => r[8][i]);
      return col.length ? [Math.min(...col), Math.max(...col)] : [0, 0];
    });

    const setups: ImportedSetupRow[] = decodedRows.map(({ row, flat }) => {
      const overrides: Record<number, { status: DecodeStatus; note?: string }> = {};
      flat.forEach((v, i) => {
        if (v.status === "undecoded") {
          decodeIssues.push(`${match.appId} @ ${trackMatches[row[1]].appId} ${slots[row[2]]}: ${layout.find((l) => i >= l.offset && i < l.offset + l.width)?.path} – ${v.note ?? ""}`);
        }
        if (v.status !== status[i]) {
          overrides[i] = v.note ? { status: v.status, note: v.note } : { status: v.status };
        }
      });
      const setup: ImportedSetupRow = {
        track: trackMatches[row[1]].appId,
        slot: slots[row[2]],
        clicks: row[8],
        values: flat.map((v) => v.value),
        unknown: { f3: row[3], f4: row[4], f5: row[5], f6: row[6], adjustments: row[7] },
      };
      if (Object.keys(overrides).length) setup.overrides = overrides;
      return setup;
    });

    const file = `cars/${match.appId}.json`;
    const carFile: ImportedCarFile = {
      source,
      appId: match.appId,
      sourceId: match.sourceId,
      name: car.n,
      matched: match.matched,
      params: car,
      status,
      notes,
      clickRange,
      setups,
    };
    fs.writeFileSync(path.join(OUT_DIR, file), JSON.stringify(carFile));
    written += setups.length;

    carIndex.push({
      appId: match.appId,
      sourceId: match.sourceId,
      name: car.n,
      cls: car.cls,
      classCode: car.c,
      matched: match.matched,
      file,
      setupCount: setups.length,
      slotMask: setups.reduce<Record<string, number>>((acc, s) => {
        acc[s.track] = (acc[s.track] ?? 0) | (1 << slots.indexOf(s.slot));
        return acc;
      }, {}),
    });

    // Slot coverage: each slot a car has should cover every track
    for (const s of slots) {
      const n = setups.filter((x) => x.slot === s).length;
      if (n !== 0 && n !== data.tracks.length) slotCoverage.push(`${match.appId} ${s}: ${n}/${data.tracks.length} tracks`);
    }

    const cfg = cars[match.appId];
    if (cfg) mismatches.push(...checkCarRanges(match.appId, cfg, car, clickRange, layout));
  });

  const manifest: ImportedManifest = {
    source,
    generatedFrom: path.basename(inputPath),
    slots: [...slots],
    layout,
    totalSetups: written,
    slotCounts,
    cars: carIndex,
    tracks,
  };
  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest));

  // --- Row count check --------------------------------------------------------
  const carsPerSlot = slots.map((s, si) => ({
    slot: s,
    cars: carIndex.filter((c) => Object.values(c.slotMask).some((m) => (m & (1 << si)) !== 0)).length,
    rows: slotCounts[s],
    expected: EXPECTED_SLOT_COUNTS[s],
  }));
  const rowCountOk = written === EXPECTED_SETUPS && uniqueKeys.size === EXPECTED_SETUPS && carsPerSlot.every((c) => c.rows === c.expected);

  // --- Report -----------------------------------------------------------------
  const unmatchedCars = carMatches.filter((m) => !m.matched);
  const aliasedCars = carMatches.filter((m) => m.viaAlias);
  const unmatchedTracks = trackMatches.filter((t) => !t.matched);
  const appTracksWithoutData = Object.keys(ACC_TRACKS).filter((k) => !trackMatches.some((t) => t.appId === k));
  const appCarsWithoutData = Object.keys(cars).filter((k) => !carMatches.some((m) => m.appId === k));
  const indexOnly = data.cars.filter((c) => [0, 1, 2, 3].some((w) => isIndexOnlyList(c[`wheelRate${w as 0 | 1 | 2 | 3}`]))).map((c) => c.id);
  const singleOption = data.cars
    .filter((c) => [0, 1, 2, 3].some((w) => { const l = c[`wheelRate${w as 0 | 1 | 2 | 3}`]; return l.length === 1 && !isIndexOnlyList(l); }))
    .map((c) => c.id);

  const byCar = new Map<string, number>();
  for (const m of mismatches) byCar.set(m.car, (byCar.get(m.car) ?? 0) + 1);
  const byParam = new Map<string, number>();
  for (const m of mismatches) byParam.set(`${m.param} – ${m.note}`, (byParam.get(`${m.param} – ${m.note}`) ?? 0) + 1);

  const md: string[] = [];
  md.push(`# Workshop ACC import report`, ``);
  md.push(`${source.label}`, ``);
  md.push(`Generated from \`${path.basename(inputPath)}\` by \`scripts/import-workshop-acc.ts\`. Source tag: \`${WORKSHOP_SOURCE_ID}\`.`, ``);
  md.push(`## Row counts`, ``);
  md.push(`- Imported setups: **${written}** (expected ${EXPECTED_SETUPS}) – unique car/track/slot keys: ${uniqueKeys.size} – ${rowCountOk ? "✅ OK" : "❌ MISMATCH"}`);
  md.push(`- Cars: ${data.cars.length}, tracks: ${data.tracks.length}`, ``);
  md.push(`| Slot | Rows | Expected | Cars with slot | Tracks per car |`, `|---|---|---|---|---|`);
  for (const c of carsPerSlot) {
    const full = c.rows === c.cars * data.tracks.length;
    md.push(`| ${c.slot} | ${c.rows} | ${c.expected} ${c.rows === c.expected ? "✅" : "❌"} | ${c.cars} | ${full ? `all ${data.tracks.length}` : "partial (see below)"} |`);
  }
  md.push(``, slotCoverage.length ? `Partial track coverage (data property, not an import loss):\n${slotCoverage.map((s) => `- ${s}`).join("\n")}` : `Every car/slot combination covers all ${data.tracks.length} tracks.`, ``);

  md.push(`## Car matching`, ``);
  md.push(`- Matched to existing app ids: ${carMatches.length - unmatchedCars.length}/${carMatches.length}`);
  for (const a of aliasedCars) md.push(`- Aliased: \`${a.sourceId}\` → existing \`${a.appId}\` (${a.name})`);
  for (const u of unmatchedCars) md.push(`- **Unmatched**: \`${u.sourceId}\` (${u.name}) – imported under its source id; not added to the app car list`);
  md.push(`- App cars with no imported setups: ${appCarsWithoutData.map((k) => `\`${k}\``).join(", ") || "none"} (aliases of imported ids where noted in cars.ts)`, ``);

  md.push(`## Track matching`, ``);
  md.push(`- Matched: ${trackMatches.length - unmatchedTracks.length}/${trackMatches.length}`);
  for (const u of unmatchedTracks) md.push(`- **Unmatched**: \`${u.sourceId}\` (${u.name})`);
  md.push(`- App tracks with no imported setups: ${appTracksWithoutData.map((k) => `\`${k}\``).join(", ") || "none"}`, ``);

  md.push(`## Decoding edge cases`, ``);
  md.push(`- Wheel rate lists that hold indexes only (flagged \`index-only\`): ${indexOnly.map((k) => `\`${k}\``).join(", ")}`);
  md.push(`- Single-entry physical wheel rate lists (flagged \`single-option\`): ${singleOption.map((k) => `\`${k}\``).join(", ") || "none"}`);
  md.push(`- Ride height: only array slots 0 (front) and 2 (rear) are shown; slots 1 and 3 are stored but flagged \`unused\`.`);
  md.push(`- Undecoded values (${decodeIssues.length}):`);
  const uniqIssues = [...new Set(decodeIssues.map((s) => s.replace(/ @ .*?: /, ": ")))];
  for (const s of uniqIssues) md.push(`  - ${s} (${decodeIssues.filter((d) => d.replace(/ @ .*?: /, ": ") === s).length} setups)`);
  md.push(``);

  md.push(`## Slider range mismatches (app \`src/data/cars.ts\` vs imported a/b tables)`, ``);
  md.push(`Report only – \`cars.ts\` was not modified. "Min" = value at click 0 (a). Max cannot be derived from a/b; "observed max" is the highest value used by any imported setup (a lower bound for the true max).`, ``);
  md.push(`Total: **${mismatches.length}** across ${byCar.size} cars.`, ``);
  md.push(`### By parameter`, ``, `| Parameter | Cars |`, `|---|---|`);
  for (const [k, n] of [...byParam.entries()].sort((a, b) => b[1] - a[1])) md.push(`| ${k} | ${n} |`);
  md.push(``, `### Detail`, ``, `| Car | Parameter | App | Imported | Issue |`, `|---|---|---|---|---|`);
  for (const m of mismatches) md.push(`| ${m.car} | ${m.param} | ${m.app} | ${m.dataset} | ${m.note} |`);
  md.push(``);

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, md.join("\n"));

  // --- Console summary --------------------------------------------------------
  console.log(`\n${source.label}`);
  console.log(`Imported ${written}/${EXPECTED_SETUPS} setups -> ${path.relative(ROOT, OUT_DIR)} (${rowCountOk ? "row count OK" : "ROW COUNT MISMATCH"})`);
  console.log(`Slots: ${carsPerSlot.map((c) => `${c.slot}=${c.rows}`).join(", ")}`);
  console.log(`Unmatched cars: ${unmatchedCars.map((u) => u.sourceId).join(", ") || "none"}; aliased: ${aliasedCars.map((a) => `${a.sourceId}->${a.appId}`).join(", ") || "none"}`);
  console.log(`Unmatched tracks: ${unmatchedTracks.map((u) => u.sourceId).join(", ") || "none"}`);
  console.log(`Undecoded values: ${decodeIssues.length}`);
  console.log(`Slider range mismatches: ${mismatches.length} across ${byCar.size} cars (see ${path.relative(ROOT, REPORT_PATH)})`);
  if (!rowCountOk) process.exitCode = 1;
}

main();
