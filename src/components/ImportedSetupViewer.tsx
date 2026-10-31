import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Database, Flame, Gauge, Info, Loader2 } from "lucide-react";
import { ACC_CARS, ACC_TRACKS } from "../utils/accParser";
import { getTargetRacePaceSeconds } from "../data/carNameMap";
import { cars } from "../data/cars";
import FuelStrategyTab from "./FuelStrategyTab";
import {
  expandImportedSetup,
  findImportedSetup,
  loadImportedCar,
  loadImportedManifest,
  slotsFor,
} from "../services/importedSetups";
import {
  SLOT_LABELS,
  WORKSHOP_SLOTS,
  type DecodedField,
  type DecodedValue,
  type ImportedCarFile,
  type ImportedManifest,
  type ImportedTrackStats,
  type WorkshopSlot,
} from "../types/workshopAcc";

// ---------------------------------------------------------------------------
// Tabs & field paths
// Laid out like the native Cloud Sync setup viewer: values are grouped per axle
// and then per corner (LF/RF/LR/RR) instead of by field type.
// ---------------------------------------------------------------------------

export type TabId = "tyres" | "electronics" | "mechanical" | "dampers" | "aero";

export const TABS: { id: TabId; label: string }[] = [
  { id: "tyres", label: "Tyres & Alignment" },
  { id: "electronics", label: "Electronics" },
  { id: "mechanical", label: "Mechanical Grip" },
  { id: "dampers", label: "Suspension Dampers" },
  { id: "aero", label: "Aero & Ducts" },
];

const P = {
  compound: "basicSetup.tyres.tyreCompound",
  pressure: "basicSetup.tyres.tyrePressure",
  camber: "basicSetup.alignment.camber",
  toe: "basicSetup.alignment.toe",
  caster: "basicSetup.alignment.casterLF",
  steerRatio: "basicSetup.alignment.steerRatio",
  tc1: "basicSetup.electronics.tC1",
  tc2: "basicSetup.electronics.tC2",
  abs: "basicSetup.electronics.abs",
  ecuMap: "basicSetup.electronics.eCUMap",
  telemetryLaps: "basicSetup.electronics.telemetryLaps",
  arbFront: "advancedSetup.mechanicalBalance.aRBFront",
  arbRear: "advancedSetup.mechanicalBalance.aRBRear",
  wheelRate: "advancedSetup.mechanicalBalance.wheelRate",
  bumpStopRate: "advancedSetup.mechanicalBalance.bumpStopRateUp",
  bumpStopRange: "advancedSetup.mechanicalBalance.bumpStopWindow",
  brakePower: "advancedSetup.mechanicalBalance.brakeTorque",
  brakeBias: "advancedSetup.mechanicalBalance.brakeBias",
  preload: "advancedSetup.drivetrain.preload",
  bumpSlow: "advancedSetup.dampers.bumpSlow",
  bumpFast: "advancedSetup.dampers.bumpFast",
  reboundSlow: "advancedSetup.dampers.reboundSlow",
  reboundFast: "advancedSetup.dampers.reboundFast",
  rideHeight: "advancedSetup.aeroBalance.rideHeight",
  splitter: "advancedSetup.aeroBalance.splitter",
  rearWing: "advancedSetup.aeroBalance.rearWing",
  brakeDuct: "advancedSetup.aeroBalance.brakeDuct",
} as const;

/** Wheel indexes inside the 4-wide fields: 0 = LF, 1 = RF, 2 = LR, 3 = RR. */
const FRONT_WHEELS = [
  { idx: 0, short: "LF", aria: "Front Left Wheel" },
  { idx: 1, short: "RF", aria: "Front Right Wheel" },
] as const;
const REAR_WHEELS = [
  { idx: 2, short: "LR", aria: "Rear Left Wheel" },
  { idx: 3, short: "RR", aria: "Rear Right Wheel" },
] as const;

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const fmtNum = (n: number) => String(Number(n.toFixed(3)));

const fmtLap = (secs: number) => {
  const m = Math.floor(secs / 60);
  return `${m}:${(secs - m * 60).toFixed(3).padStart(6, "0")}`;
};

function ValueCell({ dv, carId }: { dv: DecodedValue; carId: string }) {
  const click = <span className="text-[10px] font-bold text-zinc-400 ml-1">[{dv.click}]</span>;
  const badge = (text: string, cls: string) => (
    <span title={dv.note} className={`ml-1.5 text-[9px] font-mono font-extrabold uppercase tracking-wider px-1 py-0.5 rounded border ${cls}`}>
      {text}
    </span>
  );

  switch (dv.status) {
    case "raw": {
      if (dv.unit === "click") {
        const carCfg = cars[carId] ?? (carId === "lamborghini_huracan_st" ? cars.lamborghini_huracan_st_evo2 : undefined);
        const minPsi = carCfg?.tyrePressureRange?.[0];
        const stepPsi = carCfg?.tyrePressureStep ?? 0.1;
        const psi = typeof minPsi === "number" && Number.isFinite(dv.click) ? minPsi + dv.click * stepPsi : null;
        return (
          <span>
            {psi !== null ? (
              <>
                <strong className="text-zinc-900 font-extrabold">
                  {psi.toFixed(1)}
                  <span className="text-[10px] font-bold text-zinc-400 ml-0.5">PSI</span>
                </strong>
                <span className="text-[10px] font-bold text-zinc-400 ml-1">[{dv.click} clicks]</span>
              </>
            ) : (
              <>
                <strong className="text-zinc-900 font-extrabold">{dv.click}</strong>
                <span className="text-[10px] font-bold text-zinc-400 ml-1">clicks</span>
              </>
            )}
          </span>
        );
      }
      return (
        <strong className="text-zinc-900 font-extrabold">
          {dv.value === null ? dv.click : fmtNum(dv.value)}
          {dv.unit && <span className="text-[10px] font-bold text-zinc-400 ml-0.5">{dv.unit}</span>}
        </strong>
      );
    }
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

// ---------------------------------------------------------------------------
// Layout building blocks (mirror the native Cloud Sync setup viewer's cards)
// ---------------------------------------------------------------------------

export type GetValue = (path: string, index?: number) => DecodedValue | undefined;

interface PanelProps {
  get: GetValue;
  carId: string;
}

function ValueOrDash({ dv, carId }: { dv?: DecodedValue; carId: string }) {
  return dv ? <ValueCell dv={dv} carId={carId} /> : <span className="text-zinc-400 font-bold">—</span>;
}

/** One "Label: value" line inside a wheel block. */
function SetupRow({ label, dv, carId, labelClass = "text-zinc-500" }: { label: string; dv?: DecodedValue; carId: string; labelClass?: string }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 text-xs">
      <span className={labelClass}>{label}:</span>
      <ValueOrDash dv={dv} carId={carId} />
    </div>
  );
}

/** Axle card (front / rear) holding one block per corner. */
function AxleCard({ title, subtitle, ariaLabel, children }: { title: string; subtitle: string; ariaLabel: string; children: ReactNode }) {
  return (
    <div className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm" role="group" aria-label={ariaLabel}>
      <div className="border-b border-zinc-200 pb-2 mb-3.5 flex justify-between items-center gap-2">
        <span className="text-xs font-mono font-extrabold tracking-widest text-emerald-700 uppercase">{title}</span>
        <span className="text-[10px] text-zinc-400 font-mono font-bold text-right">{subtitle}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs text-zinc-900">{children}</div>
    </div>
  );
}

/** Single corner (LF / RF / LR / RR) block. */
function WheelBlock({ title, ariaLabel, compact = false, children }: { title: string; ariaLabel: string; compact?: boolean; children: ReactNode }) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`${compact ? "p-3" : "p-4"} rounded-lg border bg-zinc-50 border-zinc-200 hover:border-brand transition-colors space-y-2.5`}
    >
      <div className="text-[10px] text-zinc-500 uppercase border-b border-zinc-200 pb-1.5 font-black tracking-wider">{title}</div>
      {children}
    </div>
  );
}

/** Label / value / description card used for single (non per-corner) values. */
function StatCard({ label, dv, carId, valueClass = "", children }: { label: string; dv?: DecodedValue; carId: string; valueClass?: string; children: ReactNode }) {
  return (
    <div className="bg-white border border-zinc-200 p-4 rounded-lg flex justify-between items-center gap-3 font-mono shadow-sm">
      <div>
        <span className="text-zinc-500 text-[10px] uppercase block font-bold">{label}</span>
        <div className={`mt-1 text-xl font-extrabold text-zinc-900 ${valueClass}`}>
          <ValueOrDash dv={dv} carId={carId} />
        </div>
      </div>
      <span className="text-[10px] text-zinc-500 max-w-[200px] text-right font-medium font-sans">{children}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab panels
// ---------------------------------------------------------------------------

function TyresPanel({ get, carId }: PanelProps) {
  const compound = get(P.compound);
  const compoundName = compound ? (compound.click === 0 ? "Dry" : compound.click === 1 ? "Wet" : `Type ${compound.click}`) : null;

  const wheelBlock = (w: { idx: number; short: string; aria: string }, axle: "Front" | "Rear") => (
    <WheelBlock key={w.idx} title={`${w.short} ${axle} Wheel`} ariaLabel={w.aria}>
      <SetupRow label="Tyre Pressure" dv={get(P.pressure, w.idx)} carId={carId} labelClass="text-zinc-600 font-semibold" />
      <SetupRow label="Toe" dv={get(P.toe, w.idx)} carId={carId} />
      <SetupRow label="Camber" dv={get(P.camber, w.idx)} carId={carId} />
      {/* ACC stores a single caster value (casterLF) shared by both front wheels */}
      {axle === "Front" && <SetupRow label="Caster" dv={get(P.caster, 0)} carId={carId} />}
    </WheelBlock>
  );

  return (
    <div className="space-y-4">
      {compound && (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-lg px-4 py-3 flex items-center justify-between gap-3 font-mono text-xs">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-black">Tyre Compound</span>
          <span>
            <strong className="text-zinc-900 font-extrabold">{compoundName}</strong>
            <span className="text-[10px] font-bold text-zinc-400 ml-1">[{compound.click}]</span>
          </span>
        </div>
      )}
      <AxleCard title="FRONT TYRES & ALIGNMENT (LF/RF)" subtitle="PRESSURE & CAR OUTLINES" ariaLabel="Front Tyres & Alignment">
        {FRONT_WHEELS.map((w) => wheelBlock(w, "Front"))}
      </AxleCard>
      <AxleCard title="REAR TYRES & ALIGNMENT (LR/RR)" subtitle="PRESSURE & CAR OUTLINES" ariaLabel="Rear Tyres & Alignment">
        {REAR_WHEELS.map((w) => wheelBlock(w, "Rear"))}
      </AxleCard>
    </div>
  );
}

function BigStatCard({ title, hoverClass, valueClass, dv, carId, children }: { title: string; hoverClass: string; valueClass: string; dv?: DecodedValue; carId: string; children: ReactNode }) {
  return (
    <div className={`bg-white border border-zinc-200 rounded-lg p-5 text-center shadow-sm ${hoverClass} transition-all`}>
      <span className="text-zinc-500 font-mono text-[10px] tracking-wider uppercase block font-bold">{title}</span>
      <div className={`text-4xl font-mono font-black mt-2 flex items-center justify-center ${valueClass}`}>
        <ValueOrDash dv={dv} carId={carId} />
      </div>
      <p className="text-[10px] text-zinc-600 mt-2.5 leading-relaxed bg-zinc-50 p-2 rounded-lg font-medium">{children}</p>
    </div>
  );
}

function ElectronicsPanel({ get, carId }: PanelProps) {
  const ecuMap = get(P.ecuMap);
  const telemetryLaps = get(P.telemetryLaps);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BigStatCard title="Traction Control 1 (TC1)" hoverClass="hover:border-brand" valueClass="[&_strong]:text-brand" dv={get(P.tc1)} carId={carId}>
          Initial slip detection severity. Lower is more aggressive, permitting greater slide slip angle before deployment.
        </BigStatCard>
        <BigStatCard title="Traction Control 2 (TC2 / Cut)" hoverClass="hover:border-blue-500" valueClass="[&_strong]:text-blue-700" dv={get(P.tc2)} carId={carId}>
          Engine torque cut depth once traction loss occurs. Higher numbers initiate deeper fuel cuts to limit wheelspin.
        </BigStatCard>
        <BigStatCard title="Anti-Lock Braking System (ABS)" hoverClass="hover:border-emerald-600" valueClass="[&_strong]:text-emerald-700" dv={get(P.abs)} carId={carId}>
          Wheel speed lock threshold limit. Lower limits create tighter threshold braking but raise the lock up risk on bumps.
        </BigStatCard>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-center shadow-xs">
          <span className="text-zinc-500 font-mono text-[10px] block font-bold">ECU Engine Map</span>
          <div className="flex items-center justify-center gap-1.5 mt-1.5 text-sm font-mono font-black text-zinc-900">
            {ecuMap && <span>Map</span>}
            <ValueOrDash dv={ecuMap} carId={carId} />
          </div>
        </div>
        <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-center shadow-xs flex flex-col justify-center items-center">
          <span className="text-zinc-500 font-mono text-[10px] block font-bold">Recorded Telemetry Laps</span>
          <div className="flex items-center justify-center gap-1.5 mt-1.5 text-sm font-mono font-black text-zinc-900">
            <ValueOrDash dv={telemetryLaps} carId={carId} />
            {telemetryLaps && <span>Laps</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopStat({ label, dv, carId, valueClass, captions }: { label: string; dv?: DecodedValue; carId: string; valueClass: string; captions: string[] }) {
  return (
    <div className="px-2 flex flex-col items-center justify-center md:border-r md:border-zinc-200 md:last:border-0">
      <span className="text-zinc-500 font-mono text-[10px] uppercase block tracking-wider font-bold">{label}</span>
      <div className={`mt-1 text-2xl font-mono font-extrabold text-zinc-900 ${valueClass}`}>
        <ValueOrDash dv={dv} carId={carId} />
      </div>
      {captions.map((c) => (
        <span key={c} className="text-[10px] text-zinc-500 font-mono block mt-0.5 font-medium">
          {c}
        </span>
      ))}
    </div>
  );
}

function MechanicalPanel({ get, carId }: PanelProps) {
  const springBlock = (w: { idx: number; short: string; aria: string }) => (
    <WheelBlock key={w.idx} title={`${w.short} Wheel`} ariaLabel={w.aria} compact>
      <SetupRow label="Wheel Rate" dv={get(P.wheelRate, w.idx)} carId={carId} labelClass="text-zinc-600 font-normal" />
      <SetupRow label="Bumpstop Rate" dv={get(P.bumpStopRate, w.idx)} carId={carId} labelClass="text-zinc-600 font-normal" />
      <SetupRow label="Bumpstop Range" dv={get(P.bumpStopRange, w.idx)} carId={carId} labelClass="text-zinc-600 font-normal" />
    </WheelBlock>
  );

  return (
    <div className="space-y-4">
      {/* Top chassis setup bar */}
      <div className="bg-white border border-zinc-200 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4 text-center shadow-sm text-zinc-900">
        <TopStat label="Front ARB" dv={get(P.arbFront)} carId={carId} valueClass="" captions={["Anti-Roll Bar Steps"]} />
        <TopStat label="Brake Power" dv={get(P.brakePower)} carId={carId} valueClass="[&_strong]:text-emerald-600" captions={["Typically 100% but can try above figure if running no ABS"]} />
        <TopStat label="Brake Bias" dv={get(P.brakeBias)} carId={carId} valueClass="[&_strong]:text-blue-600" captions={["Towards the front of the car"]} />
        <TopStat label="Steer Ratio" dv={get(P.steerRatio)} carId={carId} valueClass="[&_strong]:text-amber-600" captions={["Low = Faster & Sharper", "High = Smoother & Slower"]} />
      </div>

      <AxleCard title="FRONT WHEELS (LF/RF)" subtitle="FRONT AXLE SPRING RATES" ariaLabel="Front Wheels Spring Rates">
        {FRONT_WHEELS.map(springBlock)}
      </AxleCard>
      <AxleCard title="REAR WHEELS (LR/RR)" subtitle="REAR AXLE SPRING RATES" ariaLabel="Rear Wheels Spring Rates">
        {REAR_WHEELS.map(springBlock)}
      </AxleCard>

      {/* Rear stabilizer and Diff Preload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-1">
        <StatCard label="Rear Anti-Roll Bar (Rear ARB)" dv={get(P.arbRear)} carId={carId}>
          Rear lateral roll resistance step settings.
        </StatCard>
        <StatCard label="Diff Preload Torque" dv={get(P.preload)} carId={carId} valueClass="[&_strong]:text-amber-700">
          Clutch spring threshold to lock the rear differential.
        </StatCard>
      </div>
    </div>
  );
}

function DampersPanel({ get, carId }: PanelProps) {
  const damperBlock = (w: { idx: number; short: string; aria: string }) => (
    <WheelBlock key={w.idx} title={`${w.short} Wheel`} ariaLabel={w.aria} compact>
      <SetupRow label="Bump (Slow)" dv={get(P.bumpSlow, w.idx)} carId={carId} />
      <SetupRow label="Fast Bump" dv={get(P.bumpFast, w.idx)} carId={carId} labelClass="text-orange-600 font-semibold" />
      <SetupRow label="Rebound" dv={get(P.reboundSlow, w.idx)} carId={carId} labelClass="text-zinc-600 font-semibold" />
      <SetupRow label="Fast Rebound" dv={get(P.reboundFast, w.idx)} carId={carId} labelClass="text-teal-600 font-semibold" />
    </WheelBlock>
  );

  return (
    <div className="space-y-4">
      <AxleCard title="FRONT DAMPERS (LF/RF)" subtitle="BUMP / REBOUND" ariaLabel="Front Dampers">
        {FRONT_WHEELS.map(damperBlock)}
      </AxleCard>
      <AxleCard title="REAR DAMPERS (LR/RR)" subtitle="BUMP / REBOUND" ariaLabel="Rear Dampers">
        {REAR_WHEELS.map(damperBlock)}
      </AxleCard>
    </div>
  );
}

function AeroRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between bg-zinc-50 border border-zinc-200 p-2 rounded text-zinc-900 font-semibold items-center gap-2">
      <span className="text-zinc-500 font-sans font-medium">{label}:</span>
      {children}
    </div>
  );
}

function AeroPanel({ get, carId }: PanelProps) {
  // ACC ride height array is [front, unused, rear, unused]
  const frontRide = get(P.rideHeight, 0);
  const rearRide = get(P.rideHeight, 2);
  const rake = frontRide?.value != null && rearRide?.value != null ? rearRide.value - frontRide.value : null;
  const ductMax = cars[carId]?.brakeDuctRange?.[1] ?? 6;

  const duct = (i: number) => {
    const dv = get(P.brakeDuct, i);
    return (
      <span className="flex items-center">
        <ValueOrDash dv={dv} carId={carId} />
        {dv && <span className="text-[10px] font-bold text-zinc-400 ml-1">/ {ductMax}</span>}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Front Aero */}
        <div className="bg-white border border-zinc-200 p-4 rounded-lg flex flex-col justify-between shadow-sm">
          <div>
            <div className="border-b border-zinc-200 pb-2 mb-3 flex justify-between items-center">
              <span className="text-xs font-mono font-extrabold tracking-widest text-emerald-700 uppercase">FRONT AERODYNAMICS & DUCTS</span>
              <span className="text-[10px] font-mono font-bold text-zinc-400">GRIP INPUTS</span>
            </div>
            <div className="space-y-3 font-mono text-xs">
              <AeroRow label="Front Ride Height">
                <ValueOrDash dv={frontRide} carId={carId} />
              </AeroRow>
              <AeroRow label="Front Splitter">
                <ValueOrDash dv={get(P.splitter)} carId={carId} />
              </AeroRow>
              <AeroRow label="Front Brake Duct">{duct(0)}</AeroRow>
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 mt-3 pt-3 border-t border-zinc-200 font-sans leading-relaxed font-semibold">
            Lowers static nose height to force air over hood creating downforce, cooling tires via Front Brake Ducts.
          </div>
        </div>

        {/* Rear Aero */}
        <div className="bg-white border border-zinc-200 p-4 rounded-lg flex flex-col justify-between shadow-sm">
          <div>
            <div className="border-b border-zinc-200 pb-2 mb-3 flex justify-between items-center">
              <span className="text-xs font-mono font-extrabold tracking-widest text-emerald-700 uppercase">REAR AERODYNAMICS & DUCTS</span>
              <span className="text-[10px] font-mono font-bold text-zinc-400">DOWNFORCE STABILITY</span>
            </div>
            <div className="space-y-3 font-mono text-xs">
              <AeroRow label="Rear Ride Height">
                <ValueOrDash dv={rearRide} carId={carId} />
              </AeroRow>
              <AeroRow label="Aero (Rear Wing Angle)">
                <ValueOrDash dv={get(P.rearWing)} carId={carId} />
              </AeroRow>
              <AeroRow label="Rear Brake Duct">{duct(1)}</AeroRow>
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 mt-3 pt-3 border-t border-zinc-200 font-sans leading-relaxed font-semibold">
            High tail heights combined with rear wing angles generate exponential suction drag (ground effect rake).
          </div>
        </div>
      </div>

      {rake !== null && (
        <div className="bg-white border border-zinc-200 p-3 rounded font-mono text-xs text-center flex justify-between items-center shadow-sm">
          <span className="text-zinc-500 uppercase text-[10px] font-bold">Aero Rake Height Difference</span>
          <span className="font-black text-emerald-700 text-sm">
            {fmtNum(Math.abs(rake))} mm {rake >= 0 ? "Nose-Down" : "Nose-Up"} angle
          </span>
        </div>
      )}
    </div>
  );
}

export function SetupPanel({ tab, get, carId }: PanelProps & { tab: TabId }) {
  switch (tab) {
    case "tyres":
      return <TyresPanel get={get} carId={carId} />;
    case "electronics":
      return <ElectronicsPanel get={get} carId={carId} />;
    case "mechanical":
      return <MechanicalPanel get={get} carId={carId} />;
    case "dampers":
      return <DampersPanel get={get} carId={carId} />;
    case "aero":
      return <AeroPanel get={get} carId={carId} />;
  }
}

function TrackStatsCard({ stats, carId }: { stats: ImportedTrackStats; carId: string }) {
  const targetRacePaceSecs = getTargetRacePaceSeconds(carId, stats.id);
  const items: [string, string][] = [
    ["Avg speed", `${fmtNum(stats.avgKmh)} km/h`],
    ["Top speed", `${fmtNum(stats.topKmh)} km/h`],
    ["Brake zones", fmtNum(stats.brakeZones)],
    ["Hot pressure", `${fmtNum(stats.hotPsi)} psi`],
    ["Brake peak", `${fmtNum(stats.brakePeakC)} °C`],
    // No LFM reference for this car/track -> show N/A rather than the generic imported average
    ["Target Race Pace", targetRacePaceSecs !== null ? fmtLap(targetRacePaceSecs) : "N/A"],
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
  /** Optional initial slot */
  initialSlot?: WorkshopSlot;
  /** Optional pinned series cars from user profile */
  pinnedCars?: string[];
  /** Whether to filter cars to only pinned series cars */
  onlyPinnedCars?: boolean;
  /** Callback to toggle the "Series Only" filter */
  onToggleOnlyPinnedCars?: (checked: boolean) => void;
}

export default function ImportedSetupViewer({
  initialCar,
  initialTrack,
  initialSlot,
  pinnedCars,
  onlyPinnedCars,
  onToggleOnlyPinnedCars,
}: ImportedSetupViewerProps) {
  const [manifest, setManifest] = useState<ImportedManifest | null>(null);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const [carId, setCarId] = useState<string>("");
  const [trackId, setTrackId] = useState<string>("");
  const [slot, setSlot] = useState<WorkshopSlot>(initialSlot ?? "Q-ATTACK");
  const [carFile, setCarFile] = useState<ImportedCarFile | null>(null);
  const [carLoading, setCarLoading] = useState(false);
  const [carError, setCarError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("tyres");

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

  /** Looks up one decoded value: `index` is the wheel (0 = LF, 1 = RF, 2 = LR, 3 = RR) or axle slot. */
  const getValue: GetValue = (path, index = 0) => fieldsByPath.get(path)?.values[index];

  const importedFuel = useMemo(() => {
    const dv = fieldsByPath.get("basicSetup.strategy.fuel")?.values[0];
    const v = dv?.value ?? dv?.click;
    return typeof v === "number" && Number.isFinite(v) ? v : 20;
  }, [fieldsByPath]);

  const hasPinnedCars = Boolean(pinnedCars && pinnedCars.length > 0);
  const isFilteringPinned = Boolean(hasPinnedCars && onlyPinnedCars);

  const visibleCars = useMemo(() => {
    const all = manifest?.cars ?? [];
    if (!isFilteringPinned || !pinnedCars) return all;
    const filtered = all.filter((c) => pinnedCars.includes(c.appId));
    return filtered.length > 0 ? filtered : all;
  }, [manifest, isFilteringPinned, pinnedCars]);

  useEffect(() => {
    if (!visibleCars.length) return;
    if (!visibleCars.some((c) => c.appId === carId)) {
      const preferred = (initialCar && visibleCars.find((c) => c.appId === initialCar)) ?? visibleCars[0];
      if (preferred) setCarId(preferred.appId);
    }
  }, [visibleCars, carId, initialCar]);

  const carsByClass = useMemo(() => {
    const groups = new Map<string, NonNullable<typeof manifest>["cars"]>();
    for (const c of visibleCars) groups.set(c.cls, [...(groups.get(c.cls) ?? []), c]);
    return [...groups.entries()];
  }, [visibleCars]);

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
            {trackStats ? ACC_TRACKS[trackStats.id] ?? trackStats.name : ""} · {SLOT_LABELS[slot]}
          </p>
        </div>

        {hasPinnedCars && (
          <div className="flex items-center justify-between bg-red-50/45 border border-red-200/50 rounded-lg p-2.5 hover:bg-red-50/60 transition-all">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-black text-red-700 tracking-tight leading-none">Series Vehicles Active</p>
                <p className="text-[10px] text-zinc-500 mt-0.5 font-mono leading-none">Pin list: {pinnedCars!.length} cars configured</p>
              </div>
            </div>
            {onToggleOnlyPinnedCars && (
              <label className="flex items-center gap-2 text-xs text-red-600 font-bold bg-white border border-red-200 hover:border-red-350 shadow-3xs px-3 py-1.5 rounded-lg cursor-pointer select-none active:scale-95 transition-all h-9 shrink-0">
                <input
                  type="checkbox"
                  checked={Boolean(onlyPinnedCars)}
                  onChange={(e) => onToggleOnlyPinnedCars(e.target.checked)}
                  className="accent-brand w-4 h-4 cursor-pointer block shrink-0"
                />
                <span className="font-mono text-[10px] font-black uppercase tracking-wider">Series Only</span>
              </label>
            )}
          </div>
        )}

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
          <span className="block text-[10px] font-mono font-black uppercase text-zinc-500 tracking-wider mb-1">Setup Type</span>
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
                  title={enabled ? SLOT_LABELS[s] : `${SLOT_LABELS[s]} not available for this car/circuit`}
                  className={`px-2.5 py-1.5 rounded border text-[10px] sm:text-xs font-mono font-extrabold tracking-wider transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
                    active ? "bg-red-600 border-red-700 text-white" : "bg-white border-zinc-250 text-zinc-700 hover:border-red-300"
                  }`}
                >
                  {SLOT_LABELS[s]}
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

      {/* Setup tabs (same tab strip as the native setup viewer) */}
      <div className="bg-zinc-100/85 border-b border-zinc-200 flex font-mono text-xs overflow-x-auto scrollbar-none" role="tablist" aria-label="Setup Parameters">
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`imported-tab-btn-${t.id}`}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`imported-tabpanel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3.5 md:py-3 border-b-2 font-bold cursor-pointer transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
              tab === t.id ? "border-red-600 text-brand bg-white font-black" : "border-transparent text-zinc-500 hover:text-zinc-900 font-medium"
            }`}
          >
            {t.label}
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
              "No imported setup for this car, circuit and setup type."
            )}
          </div>
        ) : (
          <div id={`imported-tabpanel-${tab}`} role="tabpanel" aria-labelledby={`imported-tab-btn-${tab}`}>
            <SetupPanel tab={tab} get={getValue} carId={carId} />
          </div>
        )}
        <div className="mt-4 p-3 rounded border border-zinc-200 bg-zinc-50 text-xs font-mono text-zinc-800 leading-relaxed">
  <span className="font-bold text-zinc-900">Note:</span> Setup units are decoded from per-car tables in the imported data (inferred, unverified); the raw ACC click is shown in [brackets]. Tyre pressures are shown in PSI (the car's minimum pressure plus 0.1 PSI per click).
</div>
      </div>

      {trackStats && <TrackStatsCard stats={trackStats} carId={carId} />}

      <div className="border-t border-zinc-200 bg-zinc-50/60 p-4 sm:p-5">
        <FuelStrategyTab
          fuel={importedFuel}
          activeTrack={trackId}
          isTuneMode={false}
          onAdjustSetupValue={() => {}}
        />
      </div>
    </div>
  );
}
