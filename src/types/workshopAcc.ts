/**
 * Types for the imported "Workshop ACC export" setup dataset.
 *
 * Two groups of types live here:
 *  1. `WorkshopRaw*`  – the exact shape of the source JSON (workshop_acc_data.json).
 *  2. `Imported*`     – the compact per-car files the build script writes to
 *                       `public/data/imported/workshop-acc/` and the app loads lazily.
 *
 * The source does not document its format; field meanings are inferred.
 * See `src/utils/workshopAccDecoder.ts` for the click -> real value rules.
 */

// ---------------------------------------------------------------------------
// Constants shared by the build script, decoder and UI
// ---------------------------------------------------------------------------

export const WORKSHOP_SLOTS = [
  "Q-ATTACK",
  "Q-STEADY",
  "R-ATTACK",
  "R-STEADY",
  "WET",
  "HYBRID",
  "LFM",
] as const;
export type WorkshopSlot = (typeof WORKSHOP_SLOTS)[number];

export const WHEEL_LABELS = ["FL", "FR", "RL", "RR"] as const;
export const AXLE_LABELS = ["Front", "Rear"] as const;
export type WheelIndex = 0 | 1 | 2 | 3;

/** Single tag identifying every imported record. Delete everything with this tag to remove the import. */
export const WORKSHOP_SOURCE_ID = "workshop-acc" as const;

// ---------------------------------------------------------------------------
// Raw source dataset
// ---------------------------------------------------------------------------

/** Linear click mapping: value = a + b * click */
export interface LinearMap {
  a: number;
  b: number;
}

export type PerWheelLinearKey =
  | "camber"
  | "toe"
  | "bumpRate"
  | "bumpRange"
  | "bumpSlow"
  | "bumpFast"
  | "reboundSlow"
  | "reboundFast";

export type RawCarPerWheelLinear = {
  [K in `${PerWheelLinearKey}${WheelIndex}`]: LinearMap;
};

export type RawCarWheelRates = {
  [K in `wheelRate${WheelIndex}`]: number[];
};

export type SingleLinearKey =
  | "arbF"
  | "arbR"
  | "bias"
  | "power"
  | "preload"
  | "steer"
  | "duct"
  | "wing"
  | "splitter"
  | "rhF_0"
  | "rhR_0";

export type RawCarSingleLinear = {
  [K in SingleLinearKey]: LinearMap;
};

export interface RawCarMeta {
  /** Display name */
  n: string;
  /** Class code, e.g. "GT3", "TCX", "CHL" */
  c: string;
  /** Group, e.g. "GT3", "GT4" */
  g: string;
  /** ACC internal car id, e.g. "bmw_m2_cs_racing" */
  id: string;
  /** Class label, e.g. "GT3", "GTC", "BMW M2" */
  cls: string;
  /** Caster lookup list (degrees), indexed by click */
  caster: number[];
}

export type WorkshopRawCar = RawCarMeta & RawCarPerWheelLinear & RawCarWheelRates & RawCarSingleLinear;

export interface WorkshopRawTrack {
  id: string;
  n: string;
  avg_kmh: number;
  top_kmh: number;
  full_thr_pct: number;
  brake_zones: number;
  latg_p95: number;
  bump_F: number;
  bump_R: number;
  kerb_F: number;
  bstop_F_pct: number;
  slow_pct: number;
  fast_pct: number;
  yaw_turns: number;
  laps: number;
  hot_psi: number;
  brake_peak_C: number;
  /** Track length, km */
  len: number;
  /** Reference lap time, seconds */
  lap: number;
}

/** Unlabelled adjustment entry: [field, wheelIndex (-1 = n/a), from, to]. Meaning unverified. */
export type WorkshopRawAdjustment = [field: string, wheel: number, from: number, to: number];

/** [carIndex, trackIndex, slotIndex, f3, f4, f5, f6, adjustments, values[76]] */
export type WorkshopRawSetupRow = [
  carIndex: number,
  trackIndex: number,
  slotIndex: number,
  f3: string,
  f4: number,
  f5: number,
  f6: number,
  adjustments: WorkshopRawAdjustment[],
  values: number[],
];

export interface WorkshopRawDataset {
  v: string;
  paths: string[];
  widths: number[];
  slots: string[];
  classes: string[];
  cars: WorkshopRawCar[];
  tracks: WorkshopRawTrack[];
  setups: WorkshopRawSetupRow[];
}

// ---------------------------------------------------------------------------
// Decoded values
// ---------------------------------------------------------------------------

/**
 * - decoded:       real value computed from the car's a/b or list table
 * - raw:           field intentionally not converted (e.g. tyre pressure clicks, PIT.*, electronics)
 * - undecoded:     a conversion was expected but failed (missing table, out-of-range list index)
 * - index-only:    the car's lookup list holds indexes, not physical values
 * - single-option: the car's lookup list has exactly one (physical) entry
 * - unused:        slot exists in ACC's array but is not used by the game (ride height idx 1 & 3)
 */
export type DecodeStatus = "decoded" | "raw" | "undecoded" | "index-only" | "single-option" | "unused";

export interface DecodedValue {
  click: number;
  /** Real value, or null when it could not / should not be expressed in physical units */
  value: number | null;
  unit: string;
  status: DecodeStatus;
  note?: string;
}

export interface DecodedField {
  path: string;
  values: DecodedValue[];
}

// ---------------------------------------------------------------------------
// Compact output files (public/data/imported/workshop-acc/)
// ---------------------------------------------------------------------------

export interface ImportedSourceInfo {
  id: typeof WORKSHOP_SOURCE_ID;
  /** Data version string from the source (`v`) */
  version: string;
  label: string;
}

export interface ImportedFieldLayout {
  path: string;
  width: number;
  /** Offset of this field's first value in the flat values array */
  offset: number;
  unit: string;
}

export interface ImportedTrackStats {
  /** App track id (matches ACC_TRACKS) */
  id: string;
  sourceId: string;
  name: string;
  matched: boolean;
  avgKmh: number;
  topKmh: number;
  brakeZones: number;
  hotPsi: number;
  brakePeakC: number;
  lengthKm: number;
  lapSeconds: number;
}

export interface ImportedCarIndexEntry {
  /** Id used by the app (existing id when matched, otherwise the source id) */
  appId: string;
  sourceId: string;
  name: string;
  cls: string;
  classCode: string;
  /** True when appId exists in the app's car list */
  matched: boolean;
  file: string;
  setupCount: number;
  /** "trackId|slot" keys available for this car */
  keys: string[];
}

export interface ImportedManifest {
  source: ImportedSourceInfo;
  generatedFrom: string;
  slots: WorkshopSlot[];
  layout: ImportedFieldLayout[];
  totalSetups: number;
  slotCounts: Record<WorkshopSlot, number>;
  cars: ImportedCarIndexEntry[];
  tracks: ImportedTrackStats[];
}

export interface ImportedUnknownFields {
  f3: string;
  f4: number;
  f5: number;
  f6: number;
  adjustments: WorkshopRawAdjustment[];
}

export interface ImportedSetupRow {
  /** App track id */
  track: string;
  slot: WorkshopSlot;
  /** Raw ACC click values, flat (76) */
  clicks: number[];
  /** Decoded values, flat (76); null where not expressible */
  values: (number | null)[];
  /** Flat indexes whose status differs from the car-level status (e.g. out-of-range lookups) */
  overrides?: Record<number, { status: DecodeStatus; note?: string }>;
  /** Unlabelled source columns, stored but never displayed */
  unknown: ImportedUnknownFields;
}

export interface ImportedCarFile {
  source: ImportedSourceInfo;
  appId: string;
  sourceId: string;
  name: string;
  matched: boolean;
  /** Per-car click tables from the source (a/b maps and lookup lists) */
  params: WorkshopRawCar;
  /** Default status per flat index for this car */
  status: DecodeStatus[];
  /** Notes per flat index (e.g. "index only") */
  notes: Record<number, string>;
  /** Observed [min, max] click per flat index across this car's setups */
  clickRange: [number, number][];
  setups: ImportedSetupRow[];
}
