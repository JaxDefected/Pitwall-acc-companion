import { useEffect, useMemo, useState } from "react";
import { Layers, Loader2 } from "lucide-react";
import { ACC_CARS, ACC_TRACKS } from "../utils/accParser";
import { loadImportedCar, loadImportedManifest, slotsFor } from "../services/importedSetups";
import { WORKSHOP_SLOTS, type ImportedCarFile, type ImportedManifest, type WorkshopSlot } from "../types/workshopAcc";

export interface ImportedSelection {
  car: string;
  track: string;
  slot: WorkshopSlot;
}

export interface ImportedTeamListProps {
  carFilter: string;
  trackFilter: string;
  searchText: string;
  selected: ImportedSelection | null;
  onSelect: (sel: ImportedSelection) => void;
}

const countBits = (n: number) => {
  let c = 0;
  for (let x = n; x; x &= x - 1) c++;
  return c;
};

/**
 * Imported (Workshop ACC export) setups shown inside the Team Workspace list.
 * Read-only, static data: nothing is written to Firestore. Each car's file is
 * only fetched once a car filter is chosen (or a car row is opened).
 */
export default function ImportedTeamList({ carFilter, trackFilter, searchText, selected, onSelect }: ImportedTeamListProps) {
  const [manifest, setManifest] = useState<ImportedManifest | null>(null);
  const [carFile, setCarFile] = useState<ImportedCarFile | null>(null);
  const [loadingCar, setLoadingCar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadImportedManifest()
      .then((m) => !cancelled && setManifest(m))
      .catch((err: unknown) => !cancelled && setError(err instanceof Error ? err.message : String(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  const carEntry = useMemo(() => (carFilter === "all" ? undefined : manifest?.cars.find((c) => c.appId === carFilter)), [manifest, carFilter]);

  useEffect(() => {
    if (!carEntry) {
      setCarFile(null);
      return;
    }
    let cancelled = false;
    setLoadingCar(true);
    loadImportedCar(carEntry)
      .then((f) => !cancelled && setCarFile(f))
      .catch((err: unknown) => !cancelled && setError(err instanceof Error ? err.message : String(err)))
      .finally(() => !cancelled && setLoadingCar(false));
    return () => {
      cancelled = true;
    };
  }, [carEntry]);

  const q = searchText.toLowerCase().trim();
  const carName = (id: string, fallback: string) => ACC_CARS[id] ?? fallback;
  const trackName = (id: string) => ACC_TRACKS[id] ?? manifest?.tracks.find((t) => t.id === id)?.name ?? id;

  /** No car filter: one row per car, with the number of setups matching the track filter. */
  const carRows = useMemo(() => {
    if (!manifest || carFilter !== "all") return [];
    return manifest.cars
      .map((c) => {
        const count = trackFilter === "all" ? c.setupCount : countBits(c.slotMask[trackFilter] ?? 0);
        return { entry: c, count, name: carName(c.appId, c.name) };
      })
      .filter((r) => r.count > 0 && (q === "" || r.name.toLowerCase().includes(q) || r.entry.appId.includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest, carFilter, trackFilter, q]);

  /** Car filter set: one row per setup (track × slot). */
  const setupRows = useMemo(() => {
    if (!carFile || !carEntry || carFile.appId !== carEntry.appId) return [];
    return carFile.setups
      .filter((s) => trackFilter === "all" || s.track === trackFilter)
      .filter((s) => q === "" || trackName(s.track).toLowerCase().includes(q) || s.slot.toLowerCase().includes(q) || carName(carFile.appId, carFile.name).toLowerCase().includes(q))
      .sort((a, b) => trackName(a.track).localeCompare(trackName(b.track)) || WORKSHOP_SLOTS.indexOf(a.slot) - WORKSHOP_SLOTS.indexOf(b.slot));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carFile, carEntry, trackFilter, q]);

  if (error) return null; // keep Team Workspace usable if the static library is missing
  if (!manifest) return null;
  if (carFilter !== "all" && !carEntry) return null; // car has no imported setups

  const total = carFilter === "all" ? carRows.reduce((n, r) => n + r.count, 0) : setupRows.length;
  const badge = (
    <span className="font-mono text-[9px] uppercase tracking-wider text-amber-700 bg-amber-100/60 font-black px-1.5 py-0.5 rounded border border-amber-250/30 shrink-0">
      Imported
    </span>
  );

  return (
    <div id="imported-team-list" className="border-t-2 border-zinc-200">
      <div className="px-3.5 py-2 bg-zinc-50 border-b border-zinc-150 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[10px] font-mono font-extrabold uppercase tracking-wider text-zinc-600">
          <Layers className="w-3.5 h-3.5" /> Imported setups ({total})
        </span>
        <span className="text-[9px] font-mono text-amber-800 truncate" title={manifest.source.label}>
          Workshop ACC export · v{manifest.source.version} · author unverified
        </span>
      </div>

      <div className="md:max-h-[380px] md:overflow-y-auto divide-y divide-zinc-150">
        {carFilter === "all" ? (
          carRows.length === 0 ? (
            <div className="p-4 text-center text-zinc-500 text-[11px]">No imported setups match current filters.</div>
          ) : (
            carRows.map(({ entry, count, name }) => (
              <button
                key={entry.appId}
                onClick={() => {
                  const track = trackFilter !== "all" ? trackFilter : manifest.tracks[0]?.id ?? "";
                  const slot = slotsFor(entry, track)[0] ?? "Qualli-Fast";
                  onSelect({ car: entry.appId, track, slot });
                }}
                className={`w-full text-left p-3 hover:bg-zinc-50 transition-all cursor-pointer flex items-center justify-between gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  selected?.car === entry.appId ? "bg-red-50/60 border-l-4 border-red-600" : "bg-white"
                }`}
              >
                <span className="min-w-0">
                  <span className="block font-bold text-xs text-zinc-900 truncate tracking-tight">
                    {name}
                    {!entry.matched && <span className="text-zinc-400 font-semibold"> (not in Pitwall car list)</span>}
                  </span>
                  <span className="block text-[10px] font-mono text-zinc-400 mt-0.5">
                    {count} setups{trackFilter !== "all" ? ` at ${trackName(trackFilter)}` : ""} · {entry.cls}
                  </span>
                </span>
                {badge}
              </button>
            ))
          )
        ) : loadingCar ? (
          <div className="p-4 flex items-center justify-center gap-2 text-[11px] font-mono text-zinc-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading imported setups…
          </div>
        ) : setupRows.length === 0 ? (
          <div className="p-4 text-center text-zinc-500 text-[11px]">No imported setups match current filters.</div>
        ) : (
          setupRows.map((s) => {
            const isActive = selected?.car === carFilter && selected.track === s.track && selected.slot === s.slot;
            return (
              <button
                key={`${s.track}|${s.slot}`}
                onClick={() => onSelect({ car: carFilter, track: s.track, slot: s.slot })}
                className={`w-full text-left p-3 hover:bg-zinc-50 transition-all cursor-pointer flex items-start justify-between gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  isActive ? "bg-red-50/60 border-l-4 border-red-600" : "bg-white"
                }`}
              >
                <span className="min-w-0">
                  <span className={`block font-bold text-xs truncate tracking-tight ${isActive ? "text-brand font-black" : "text-zinc-900"}`}>
                    {carName(carFile?.appId ?? carFilter, carFile?.name ?? carFilter)}
                  </span>
                  <span className="block text-[10px] font-semibold text-zinc-500 mt-0.5">{trackName(s.track)}</span>
                  <span className="block text-[10px] font-mono text-zinc-400 mt-0.5">{s.slot} · Workshop ACC export</span>
                </span>
                {badge}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
