import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { SetupPanel, TABS, type GetValue, type TabId } from "../ImportedSetupViewer";
import { expandImportedSetup, findImportedSetup } from "../../services/importedSetups";
import type { ImportedCarFile, ImportedManifest, WorkshopSlot } from "../../types/workshopAcc";

/**
 * The JaxTune (imported) viewer mirrors the native Cloud Sync viewer: values are grouped per axle
 * and then per corner (LF/RF/LR/RR) rather than by field type.
 */
const DIR = path.resolve(__dirname, "../../../public/data/imported/workshop-acc");
const hasData = fs.existsSync(path.join(DIR, "manifest.json"));
const readJson = <T,>(p: string): T => JSON.parse(fs.readFileSync(path.join(DIR, p), "utf8")) as T;

const count = (haystack: string, needle: string) => haystack.split(needle).length - 1;

function renderTab(tab: TabId, carId: string, trackId: string, slot: WorkshopSlot): string {
  const manifest = readJson<ImportedManifest>("manifest.json");
  const car = readJson<ImportedCarFile>(`cars/${carId}.json`);
  const row = findImportedSetup(car, trackId, slot);
  if (!row) throw new Error(`No setup for ${carId} / ${trackId} / ${slot}`);
  const byPath = new Map(expandImportedSetup(car, manifest.layout, row).map((f) => [f.path, f]));
  const get: GetValue = (p, i = 0) => byPath.get(p)?.values[i];
  return renderToStaticMarkup(<SetupPanel tab={tab} get={get} carId={carId} />);
}

describe("JaxTune setup panels (grouped per axle / corner like the native viewer)", () => {
  it("exposes the same tab set as the native viewer (minus the persistent fuel strategy)", () => {
    expect(TABS.map((t) => t.label)).toEqual(["Tyres & Alignment", "Electronics", "Mechanical Grip", "Suspension Dampers", "Aero & Ducts"]);
  });

  it("renders missing values as dashes instead of throwing", () => {
    for (const t of TABS) {
      const html = renderToStaticMarkup(<SetupPanel tab={t.id} get={() => undefined} carId="unknown_car" />);
      expect(html.length).toBeGreaterThan(0);
      expect(html).toContain("—");
    }
  });

  describe.skipIf(!hasData)("with the imported data (BMW M4 GT3, Barcelona, Q-ATTACK)", () => {
    const args = ["bmw_m4_gt3", "barcelona", "Q-ATTACK"] as const;

    it("Tyres & Alignment: per-axle cards with pressure, toe and camber on every corner, caster on the front", () => {
      const html = renderTab("tyres", ...args);
      expect(html).toContain("FRONT TYRES &amp; ALIGNMENT (LF/RF)");
      expect(html).toContain("REAR TYRES &amp; ALIGNMENT (LR/RR)");
      for (const w of ["LF Front Wheel", "RF Front Wheel", "LR Rear Wheel", "RR Rear Wheel"]) expect(html).toContain(w);
      expect(count(html, "Tyre Pressure:")).toBe(4);
      expect(count(html, "Toe:")).toBe(4);
      expect(count(html, "Camber:")).toBe(4);
      expect(count(html, "Caster:")).toBe(2);
      // clicks [42, 58, 40, 52] from a 20.3 PSI minimum, 0.1 PSI per click -> 24.5 / 26.1 / 24.3 / 25.5
      const order = ["24.5", "26.1", "24.3", "25.5"].map((v) => html.indexOf(`${v}<`));
      expect(order.every((i) => i > -1)).toBe(true);
      expect([...order].sort((a, b) => a - b)).toEqual(order);
    });

    it("Tyres & Alignment: shows the compound (Wet for the wet setup)", () => {
      expect(renderTab("tyres", ...args)).toContain("Dry");
      expect(renderTab("tyres", "bmw_m4_gt3", "barcelona", "WET")).toContain("Wet");
    });

    it("Electronics: TC, TC cut, ABS, ECU map and telemetry laps", () => {
      const html = renderTab("electronics", ...args);
      for (const s of ["Traction Control 1 (TC1)", "Traction Control 2 (TC2 / Cut)", "Anti-Lock Braking System (ABS)", "ECU Engine Map", "Recorded Telemetry Laps"]) {
        expect(html).toContain(s);
      }
    });

    it("Mechanical Grip: top bar, per-corner spring blocks and the rear ARB / diff preload cards", () => {
      const html = renderTab("mechanical", ...args);
      for (const s of ["Front ARB", "Brake Power", "Brake Bias", "Steer Ratio", "FRONT WHEELS (LF/RF)", "REAR WHEELS (LR/RR)", "Rear Anti-Roll Bar", "Diff Preload Torque"]) {
        expect(html).toContain(s);
      }
      expect(count(html, "Wheel Rate:")).toBe(4);
      expect(count(html, "Bumpstop Rate:")).toBe(4);
      expect(count(html, "Bumpstop Range:")).toBe(4);
    });

    it("Suspension Dampers: front and rear cards with all four damper values per corner", () => {
      const html = renderTab("dampers", ...args);
      expect(html).toContain("FRONT DAMPERS (LF/RF)");
      expect(html).toContain("REAR DAMPERS (LR/RR)");
      for (const label of ["Bump (Slow):", "Fast Bump:", "Rebound:", "Fast Rebound:"]) expect(count(html, label)).toBe(4);
    });

    it("Aero & Ducts: front/rear ride height, splitter, wing, ducts and the rake difference", () => {
      const html = renderTab("aero", ...args);
      for (const s of ["Front Ride Height", "Rear Ride Height", "Front Splitter", "Aero (Rear Wing Angle)", "Front Brake Duct", "Rear Brake Duct"]) {
        expect(html).toContain(s);
      }
      // front 50 mm, rear 76 mm (the unused ride-height slots must not be shown)
      expect(html).toContain("26 mm Nose-Down angle");
    });
  });

  describe.skipIf(!hasData)("every imported car renders every tab", () => {
    it("does not throw and always renders content", () => {
      const manifest = readJson<ImportedManifest>("manifest.json");
      for (const entry of manifest.cars) {
        const car = readJson<ImportedCarFile>(entry.file);
        const row = car.setups[0];
        for (const t of TABS) {
          const html = renderTab(t.id, entry.appId, row.track, row.slot);
          expect(html.length, `${entry.appId} / ${t.id}`).toBeGreaterThan(200);
        }
      }
    });
  });
});
