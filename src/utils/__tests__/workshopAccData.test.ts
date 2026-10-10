import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { WORKSHOP_SLOTS, type ImportedCarFile, type ImportedManifest } from "../../types/workshopAcc";
import { ACC_TRACKS } from "../accParser";

/** Integrity checks on the generated files in public/data/imported/workshop-acc/. */
const DIR = path.resolve(__dirname, "../../../public/data/imported/workshop-acc");
const readJson = <T,>(p: string): T => JSON.parse(fs.readFileSync(path.join(DIR, p), "utf8")) as T;
const hasData = fs.existsSync(path.join(DIR, "manifest.json"));

describe.skipIf(!hasData)("Workshop ACC imported data", () => {
  const manifest = hasData ? readJson<ImportedManifest>("manifest.json") : null;

  it("contains 8,325 setups with the expected per-slot counts", () => {
    expect(manifest?.totalSetups).toBe(8325);
    expect(manifest?.slotCounts).toEqual({
      "Q-ATTACK": 1350, "Q-STEADY": 1350, "R-ATTACK": 1350, "R-STEADY": 1350, WET: 1350, HYBRID: 925, LFM: 650,
    });
    expect(manifest?.cars).toHaveLength(54);
    expect(manifest?.tracks).toHaveLength(25);
  });

  it("every setup is stored exactly once across the per-car files, with 76 clicks and values", () => {
    let total = 0;
    const keys = new Set<string>();
    for (const entry of manifest?.cars ?? []) {
      const car = readJson<ImportedCarFile>(entry.file);
      expect(car.source.id).toBe("workshop-acc");
      expect(car.setups).toHaveLength(entry.setupCount);
      for (const s of car.setups) {
        expect(s.clicks).toHaveLength(76);
        expect(s.values).toHaveLength(76);
        expect(WORKSHOP_SLOTS).toContain(s.slot);
        keys.add(`${car.appId}|${s.track}|${s.slot}`);
      }
      total += car.setups.length;
    }
    expect(total).toBe(8325);
    expect(keys.size).toBe(8325);
  });

  it("all imported tracks use existing app track ids", () => {
    for (const t of manifest?.tracks ?? []) expect(Object.keys(ACC_TRACKS)).toContain(t.id);
  });

  it("Ferrari 488 Challenge Evo caster click 98 is stored as undecoded with the raw click kept", () => {
    const car = readJson<ImportedCarFile>("cars/ferrari_488_challenge_evo.json");
    const offset = manifest?.layout.find((l) => l.path === "basicSetup.alignment.casterLF")?.offset ?? -1;
    const s = car.setups.find((x) => x.clicks[offset] === 98);
    expect(s).toBeDefined();
    const status = s?.overrides?.[offset]?.status ?? car.status[offset];
    expect(status).toBe("undecoded");
    expect(s?.values[offset]).toBeNull();
  });

  it("Porsche 935 wheel rates are flagged index-only", () => {
    const car = readJson<ImportedCarFile>("cars/porsche_935.json");
    const offset = manifest?.layout.find((l) => l.path === "advancedSetup.mechanicalBalance.wheelRate")?.offset ?? -1;
    expect(car.status.slice(offset, offset + 4)).toEqual(["index-only", "index-only", "index-only", "index-only"]);
  });
});
