import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Database, Gauge, Info, Loader2 } from "lucide-react";
import { ACC_CARS, ACC_TRACKS } from "../utils/accParser";
import {
  expandImportedSetup,
  findImportedSetup,
  loadImportedCar,
  loadImportedManifest,
  slotsFor,
} from "../services/importedSetups";
import {
  AXLE_LABELS,
  WHEEL_LABELS,
  WORKSHOP_SLOTS,
  type DecodedField,
  type DecodedValue,
  type ImportedCarFile,
  type ImportedManifest,
  type ImportedTrackStats,
  type WorkshopSlot,
} from "../types/workshopAcc";

// ---------------------------------------------------------------------------
// Garage-screen grouping (mirrors ACC's setup screens)
// ---------------------------------------------------------------------------

type GroupId = "tyres" | "alignment" | "electronics" | "strategy" | "mechanical" | "dampers" | "aero";

const GROUPS: { id: GroupId; label: string; paths: string[] }[] = [
  { id: "tyres", label: "Tyres", paths: ["basicSetup.tyres.tyreCompound", "basicSetup.tyres.tyrePressure"] },
  { id: "alignment", label: "Alignment", paths: ["basicSetup.alignment.camber", "basicSetup.alignment.toe", "basicSetup.alignment.casterLF"] },
  {
    id: "electronics",
    label: "Electronics",
    paths: ["basicSetup.electronics.tC1", "basicSetup.electronics.tC2", "basicSetup.electronics.abs", "basicSetup.electronics.eCUMap", "basicSetup.electronics.telemetryLaps"],
  },
  {
    id: "strategy",
    label: "Strategy",
    paths: [
      "basicSetup.strategy.fuel",
      "basicSetup.strategy.fuelPerLap",
      "basicSetup.strategy.tyreSet",
      "basicSetup.strategy.frontBrakePadCompound",
      "basicSetup.strategy.rearBrakePadCompound",
      "basicSetup.strategy.nPitStops",
      "PIT.fuelToAdd",
      "PIT.tyres.tyreCompound",
      "PIT.tyreSet",
      "PIT.tyres.tyrePressure",
      "PIT.frontBrakePadCompound",
      "PIT.rearBrakePadCompound",
    ],
  },
  {
    id: "mechanical",
    label: "Mechanical Balance",
    paths: [
      "advancedSetup.mechanicalBalance.aRBFront",
      "advancedSetup.mechanicalBalance.aRBRear",
      "advancedSetup.mechanicalBalance.brakeTorque",
      "advancedSetup.mechanicalBalance.brakeBias",
      "basicSetup.alignment.steerRatio",
      "advancedSetup.drivetrain.preload",
      "advancedSetup.mechanicalBalance.wheelRate",
      "advancedSetup.mechanicalBalance.bumpStopRateUp",
      "advancedSetup.mechanicalBalance.bumpStopWindow",
    ],
  },
  { id: "dampers", label: "Dampers", paths: ["advancedSetup.dampers.bumpSlow", "advancedSetup.dampers.bumpFast", "advancedSetup.dampers.reboundSlow", "advancedSetup.dampers.reboundFast"] },
  { id: "aero", label: "Aero", paths: ["advancedSetup.aeroBalance.rideHeight", "advancedSetup.aeroBalance.splitter", "advancedSetup.aeroBalance.rearWing", "advancedSetup.aeroBalance.brakeDuct"] },
];

const FIELD_LABELS: Record<string, string> = {
  "basicSetup.tyres.tyreCompound": "Tyre Compound",
  "basicSetup.tyres.tyrePressure": "Tyre Pressure",
  "basicSetup.alignment.camber": "Camber",
  "basicSetup.alignment.toe": "Toe",
  "basicSetup.alignment.casterLF": "Caster",
  "basicSetup.alignment.steerRatio": "Steer Ratio",
  "basicSetup.electronics.tC1": "TC",
  "basicSetup.electronics.tC2": "TC Cut",
  "basicSetup.electronics.abs": "ABS",
  "basicSetup.electronics.eCUMap": "ECU Map",
  "basicSetup.electronics.telemetryLaps": "Telemetry Laps",
  "basicSetup.strategy.fuel": "Fuel",
  "basicSetup.strategy.fuelPerLap": "Fuel per Lap",
  "basicSetup.strategy.tyreSet": "Tyre Set",
  "basicSetup.strategy.frontBrakePadCompound": "Front Brake Pads",
  "basicSetup.strategy.rearBrakePadCompound": "Rear Brake Pads",
  "basicSetup.strategy.nPitStops": "Pit Stops",
  "PIT.fuelToAdd": "Pit: Fuel to Add",
  "PIT.tyres.tyreCompound": "Pit: Tyre Compound",
  "PIT.tyreSet": "Pit: Tyre Set",
  "PIT.tyres.tyrePressure": "Pit: Tyre Pressure",
  "PIT.frontBrakePadCompound": "Pit: Front Brake Pads",
  "PIT.rearBrakePadCompound": "Pit: Rear Brake Pads",
  "advancedSetup.mechanicalBalance.aRBFront": "Front Anti-Roll Bar",
  "advancedSetup.mechanicalBalance.aRBRear": "Rear Anti-Roll Bar",
  "advancedSetup.mechanicalBalance.wheelRate": "Wheel Rate",
  "advancedSetup.mechanicalBalance.bumpStopRateUp": "Bumpstop Rate",
  "advancedSetup.mechanicalBalance.bumpStopWindow": "Bumpstop Range",
  "advancedSetup.mechanicalBalance.brakeTorque": "Brake Power",
  "advancedSetup.mechanicalBalance.brakeBias": "Brake Bias",
  "advancedSetup.drivetrain.preload": "Preload Differential",
  "advancedSetup.dampers.bumpSlow": "Bump (Slow)",
  "advancedSetup.dampers.bumpFast": "Bump (Fast)",
  "advancedSetup.dampers.reboundSlow": "Rebound (Slow)",
  "advancedSetup.dampers.reboundFast": "Rebound (Fast)",
  "advancedSetup.aeroBalance.rideHeight": "Ride Height",
  "advancedSetup.aeroBalance.splitter": "Splitter",
  "advancedSetup.aeroBalance.rearWing": "Rear Wing",
  "advancedSetup.aeroBalance.brakeDuct": "Brake Ducts",
};

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const fmtNum = (n: number) => String(Number(n.toFixed(3)));

const fmtLap = (secs: number) => {
  const m = Math.floor(secs / 60);
  return `${m}:${(secs - m * 60).toFixed(3).padStart(6, "0")}`;
};

function ValueCell({ dv }: { dv: DecodedValue }) {
  const click = <span className="text-[10px] font-bold text-zinc-400 ml-1">[{dv.click}]</span>;
  const badge = (text: string, cls: string) => (
    <span title={dv.note} className={`ml-1.5 text-[9px] font-mono font-extrabold uppercase tracking-wider px-1 py-0.5 rounded border ${cls}`}>
      {text}
    </span>
  );

  switch (dv.status) {
    case "raw":
      return dv.unit === "click" ? (
        <span>
          <strong className="text-zinc-900 font-extrabold">{dv.click}</strong>
          <span className="text-[10px] font-bold text-zinc-400 ml-1">clicks</span>
        </span>
      ) : (
        <strong className="text-zinc-900 font-extrabold">
          {dv.value === null ? dv.click : fmtNum(dv.value)}
          {dv.unit && <span className="text-[10px] font-bold text-zinc-400 ml-0.5">{dv.unit}</span>}
        </strong>
      );
    case "undecoded":
      return (
        <span>
          <strong className="text-zinc-500 font-extrabold">n/a</strong>
          {click}
          {badge("undecoded", "bg-amber-50 text-amber-700 border-amber-200")}
        </span>
      );
    case "index-only":
      return (
        <span>
          <strong className="text-zinc-500 font-extrabold">index</strong>
          {click}
          {badge("index only", "bg-zinc-100 text-zinc-600 border-zinc-200")}
        </span>
      );
    default:
      return (
        <span>
          <strong className="text-zinc-900 font-extrabold">
            {dv.value === null ? "n/a" : fmtNum(dv.value)}
            {dv.unit && <span className="text-[10px] font-bold text-zinc-400 ml-0.5">{dv.unit}</span>}
          </strong>
          {click}
          {dv.status === "single-option" && badge("fixed", "bg-zinc-100 text-zinc-600 border-zinc-200")}
        </span>
      );
  }
}

function FieldCard({ field }: { field: DecodedField }) {
  const label = FIELD_LABELS[field.path] ?? field.path;
  const width = field.values.length;

  // Ride height: ACC array is [front, unused, rear, unused] – show only the used slots.
  const isRideHeight = field.path === "advancedSetup.aeroBalance.rideHeight";
  const cells: { label: string; dv: DecodedValue }[] = isRideHeight
    ? field.values.map((dv, i) => ({ label: i < 2 ? "Front" : "Rear", dv })).filter((c) => c.dv.status !== "unused")
    : width === 4
      ? field.values.map((dv, i) => ({ label: WHEEL_LABELS[i] ?? String(i), dv }))
      : width === 2
        ? field.values.map((dv, i) => ({ label: AXLE_LABELS[i] ?? String(i), dv }))
        : field.values.map((dv) => ({ label: "", dv }));

  return (
    <div className="bg-zinc-50 border border-zinc-200/60 rounded p-3 text-zinc-900 shadow-3xs">
      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold pb-1.5 border-b border-zinc-150">{label}</span>
      <div className={`mt-2 grid gap-x-4 gap-y-1.5 text-xs font-mono ${cells.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
        {cells.map((c, i) => (
          <div key={i} className="flex items-baseline justify-between gap-2">
            {c.label && <span className="text-[10px] text-zinc-400 font-bold uppercase">{c.label}</span>}
            <ValueCell dv={c.dv} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackStatsCard({ stats }: { stats: ImportedTrackStats }) {
  const items: [string, string][] = [
    ["Avg speed", `${fmtNum(stats.avgKmh)} km/h`],
    ["Top speed", `${fmtNum(stats.topKmh)} km/h`],
    ["Brake zones", fmtNum(stats.brakeZones)],
    ["Hot pressure", `${fmtNum(stats.hotPsi)} psi`],
    ["Brake peak", `${fmtNum(stats.brakePeakC)} °C`],
    ["Lap time", fmtLap(stats.lapSeconds)],
    ["Length", `${fmtNum(stats.lengthKm)} km`],
  ];
  return (
    <div className="border-t border-zinc-200 bg-zinc-50/60 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="w-4 h-4 text-zinc-500" />
        <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-zinc-600">
          Track info · {ACC_TRACKS[stats.id] ?? stats.name}
        </span>
        <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
          Imported
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {items.map(([k, v]) => (
          <div key={k} className="bg-white border border-zinc-200 rounded px-2.5 py-2">
            <span className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">{k}</span>
            <span className="text-xs font-mono font-black text-zinc-900">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Viewer
// ---------------------------------------------------------------------------

export interface ImportedSetupViewerProps {
  /** Optional initial car id (e.g. the active setup's car) */
  initialCar?: string;
  /** Optional initial track id */
  initialTrack?: string;
}

export default function ImportedSetupViewer({ initialCar, initialTrack }: ImportedSetupViewerProps) {
  const [manifest, setManifest] = useState<ImportedManifest | null>(null);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const [carId, setCarId] = useState<string>("");
  const [trackId, setTrackId] = useState<string>("");
  const [slot, setSlot] = useState<WorkshopSlot>("Q-ATTACK");
  const [carFile, setCarFile] = useState<ImportedCarFile | null>(null);
  const [carLoading, setCarLoading] = useState(false);
  const [carError, setCarError] = useState<string | null>(null);
  const [group, setGroup] = useState<GroupId>("tyres");

  // Load manifest once
  useEffect(() => {
    let cancelled = false;
    loadImportedManifest()
      .then((m) => {
        if (cancelled) return;
        setManifest(m);
        const car = m.cars.find((c) => c.appId === initialCar) ?? m.cars[0];
        const track = m.tracks.find((t) => t.id === initialTrack) ?? m.tracks[0];
        setCarId(car?.appId ?? "");
        setTrackId(track?.id ?? "");
      })
      .catch((err: unknown) => !cancelled && setManifestError(err instanceof Error ? err.message : String(err)));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carEntry = useMemo(() => manifest?.cars.find((c) => c.appId === carId), [manifest, carId]);
  const trackStats = useMemo(() => manifest?.tracks.find((t) => t.id === trackId), [manifest, trackId]);
  const availableSlots = useMemo(() => slotsFor(carEntry, trackId), [carEntry, trackId]);

  // Lazy-load the selected car's file
  useEffect(() => {
    if (!carEntry) return;
    let cancelled = false;
    setCarLoading(true);
    setCarError(null);
    loadImportedCar(carEntry)
      .then((f) => !cancelled && setCarFile(f))
      .catch((err: unknown) => !cancelled && setCarError(err instanceof Error ? err.message : String(err)))
      .finally(() => !cancelled && setCarLoading(false));
    return () => {
      cancelled = true;
    };
  }, [carEntry]);

  // Keep the slot valid for the current car/track
  useEffect(() => {
    if (availableSlots.length && !availableSlots.includes(slot)) setSlot(availableSlots[0]);
  }, [availableSlots, slot]);

  const fields = useMemo<DecodedField[] | null>(() => {
    if (!manifest || !carFile || carFile.appId !== carId) return null;
    const row = findImportedSetup(carFile, trackId, slot);
    return row ? expandImportedSetup(carFile, manifest.layout, row) : null;
  }, [manifest, carFile, carId, trackId, slot]);

  const fieldsByPath = useMemo(() => new Map((fields ?? []).map((f) => [f.path, f])), [fields]);

  const carsByClass = useMemo(() => {
    const groups = new Map<string, NonNullable<typeof manifest>["cars"]>();
    for (const c of manifest?.cars ?? []) groups.set(c.cls, [...(groups.get(c.cls) ?? []), c]);
    return [...groups.entries()];
  }, [manifest]);

  const carLabel = (id: string, name: string, matched: boolean) => `${ACC_CARS[id] ?? name}${matched ? "" : " (not in Pitwall car list)"}`;

  if (manifestError) {
    return (
      <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-8 text-center text-xs text-zinc-600 font-mono">
        <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
        Imported setup library unavailable: {manifestError}
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-12 flex items-center justify-center gap-2 text-xs font-mono text-zinc-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading imported setup library…
      </div>
    );
  }

  const selectCls = "w-full bg-white border border-zinc-250 hover:border-zinc-350 px-2.5 py-2 text-zinc-900 rounded font-mono text-xs font-bold focus:ring-1 focus:ring-red-500 outline-none cursor-pointer";

  return (
    <div id="imported-setup-viewer" className="bg-white border border-zinc-200 shadow-xs rounded-lg overflow-hidden flex flex-col">
      {/* Header + selectors */}
      <div className="p-5 md:p-6 bg-zinc-50 border-b border-zinc-200 space-y-4">
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono bg-zinc-100 text-zinc-700 border border-zinc-200 px-2 py-0.5 rounded uppercase font-extrabold tracking-widest inline-flex items-center gap-1.5">
            <Database className="w-3 h-3" /> Imported setup library
          </span>
          <h2 className="text-xl md:text-2xl font-black text-zinc-950 tracking-tight leading-snug">
            {carEntry ? carLabel(carEntry.appId, carEntry.name, carEntry.matched) : "Select a car"}
          </h2>
          <p className="text-xs text-zinc-650 font-mono font-semibold">
            {trackStats ? ACC_TRACKS[trackStats.id] ?? trackStats.name : ""} · {slot}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-[10px] font-mono font-black uppercase text-zinc-500 tracking-wider mb-1">Car</span>
            <select className={selectCls} value={carId} onChange={(e) => setCarId(e.target.value)}>
              {carsByClass.map(([cls, list]) => (
                <optgroup key={cls} label={cls}>
                  {list.map((c) => (
                    <option key={c.appId} value={c.appId}>
                      {carLabel(c.appId, c.name, c.matched)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-[10px] font-mono font-black uppercase text-zinc-500 tracking-wider mb-1">Circuit</span>
            <select className={selectCls} value={trackId} onChange={(e) => setTrackId(e.target.value)}>
              {manifest.tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {ACC_TRACKS[t.id] ?? t.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Slot selector */}
        <div>
          <span className="block text-[10px] font-mono font-black uppercase text-zinc-500 tracking-wider mb-1">Slot</span>
          <div role="radiogroup" aria-label="Setup slot" className="flex flex-wrap gap-1.5">
            {WORKSHOP_SLOTS.map((s) => {
              const enabled = availableSlots.includes(s);
              const active = s === slot;
              return (
                <button
                  key={s}
                  role="radio"
                  aria-checked={active}
                  disabled={!enabled}
                  onClick={() => setSlot(s)}
                  title={enabled ? s : `${s} not available for this car/circuit`}
                  className={`px-2.5 py-1.5 rounded border text-[10px] sm:text-xs font-mono font-extrabold tracking-wider transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
                    active ? "bg-red-600 border-red-700 text-white" : "bg-white border-zinc-250 text-zinc-700 hover:border-red-300"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Source label (always visible on imported setups) */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 sm:px-5 py-2.5 flex items-start gap-2 text-[11px] font-mono text-amber-800 font-semibold">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>{manifest.source.label}</span>
      </div>

      {/* Group tabs */}
      <div role="tablist" className="flex overflow-x-auto bg-white border-b border-zinc-200 text-xs font-mono">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={group === g.id}
            onClick={() => setGroup(g.id)}
            className={`px-4 py-3 border-b-2 font-bold cursor-pointer transition-colors shrink-0 uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
              group === g.id ? "border-red-600 text-brand" : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 min-h-[220px]">
        {carError ? (
          <div className="text-xs bg-red-50 border border-red-200 text-red-700 p-2.5 rounded flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {carError}
          </div>
        ) : carLoading || !fields ? (
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-500 py-12">
            {carLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Loading setups for this car…
              </>
            ) : (
              "No imported setup for this car, circuit and slot."
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(GROUPS.find((g) => g.id === group)?.paths ?? []).map((p) => {
              const f = fieldsByPath.get(p);
              return f ? <FieldCard key={p} field={f} /> : null;
            })}
          </div>
        )}
        <p className="mt-4 text-[10px] font-mono text-zinc-400 leading-relaxed">
          Real units are decoded from per-car tables in the imported data (inferred, unverified); the raw ACC click is shown in [brackets].
          Tyre pressures and pit-strategy values are shown as raw clicks.
        </p>
      </div>

      {trackStats && <TrackStatsCard stats={trackStats} />}
    </div>
  );
}
