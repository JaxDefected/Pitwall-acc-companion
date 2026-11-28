import { describe, it, expect } from "vitest";
import {
  resolveTrackKey,
  resolveCarKey,
  resolveRoundStatus,
  resolveClassId,
  canonicalizeDriverId,
  CALENDAR_SHEET_MAPPING,
  RESULTS_SHEET_MAPPING,
  STANDINGS_SHEET_MAPPING,
  PACE_METRICS_MAPPING,
} from "../mapping";

describe("Google Sheets Data & Schema Mapping", () => {
  describe("canonicalizeDriverId", () => {
    it("converts gamertags into lowercase slug format", () => {
      expect(canonicalizeDriverId("ApexHunter")).toBe("apexhunter");
      expect(canonicalizeDriverId("Turbo Tadpole")).toBe("turbo-tadpole");
      expect(canonicalizeDriverId("  Shadow_Shift  ")).toBe("shadow_shift");
      expect(canonicalizeDriverId("Driver#123!*")).toBe("driver-123");
    });

    it("handles empty or falsy inputs gracefully", () => {
      expect(canonicalizeDriverId("")).toBe("unknown-driver");
    });
  });

  describe("resolveClassId", () => {
    it("maps strings to pro, proam, or am", () => {
      expect(resolveClassId("PRO")).toBe("pro");
      expect(resolveClassId("Pro")).toBe("pro");
      expect(resolveClassId("PRO-AM")).toBe("proam");
      expect(resolveClassId("ProAm")).toBe("proam");
      expect(resolveClassId("Silver")).toBe("proam");
      expect(resolveClassId("AM")).toBe("am");
      expect(resolveClassId("Bronze")).toBe("am");
      expect(resolveClassId("Amateur")).toBe("am");
    });

    it("defaults to pro for empty or unrecognised classes", () => {
      expect(resolveClassId("")).toBe("pro");
      expect(resolveClassId("Open")).toBe("pro");
    });
  });

  describe("resolveTrackKey", () => {
    it("matches exact keys and fuzzy aliases", () => {
      expect(resolveTrackKey("monza")).toBe("monza");
      expect(resolveTrackKey("Autodromo Nazionale Monza")).toBe("monza");
      expect(resolveTrackKey("Bathurst")).toBe("mount_panorama");
      expect(resolveTrackKey("Mount Panorama Circuit")).toBe("mount_panorama");
      expect(resolveTrackKey("Spa-Francorchamps")).toBe("spa");
      expect(resolveTrackKey("Kyalami Grand Prix")).toBe("kyalami");
      expect(resolveTrackKey("Silverstone")).toBe("silverstone");
      expect(resolveTrackKey("Nurburgring 24h")).toBe("nurburgring_24h");
      expect(resolveTrackKey("Nürburgring GP")).toBe("nurburgring");
      expect(resolveTrackKey("Watkins Glen International")).toBe("watkins_glen");
      expect(resolveTrackKey("Barcelona-Catalunya")).toBe("barcelona");
      expect(resolveTrackKey("Suzuka Circuit")).toBe("suzuka");
    });

    it("falls back to monza if track cannot be resolved", () => {
      expect(resolveTrackKey("")).toBe("monza");
      expect(resolveTrackKey("Unknown Oval")).toBe("monza");
    });
  });

  describe("resolveCarKey", () => {
    it("matches car keys and aliases", () => {
      expect(resolveCarKey("ferrari_296_gt3")).toBe("ferrari_296_gt3");
      expect(resolveCarKey("Ferrari 296 GT3")).toBe("ferrari_296_gt3");
      expect(resolveCarKey("296")).toBe("ferrari_296_gt3");
      expect(resolveCarKey("Ginetta G55 GT4")).toBe("ginetta_g55_gt4");
      expect(resolveCarKey("BMW M4 GT3")).toBe("bmw_m4_gt3");
      expect(resolveCarKey("Porsche 992 GT3 R")).toBe("porsche_992_gt3_r");
      expect(resolveCarKey("Aston Martin Vantage")).toBe("amr_v8_vantage_gt3");
      expect(resolveCarKey("Audi R8 LMS Evo II")).toBe("audi_r8_lms_evo_ii");
      expect(resolveCarKey("Mercedes AMG GT3 Evo")).toBe("mercedes_amg_gt3_evo");
      expect(resolveCarKey("McLaren 720S GT3 Evo")).toBe("mclaren_720s_gt3_evo");
      expect(resolveCarKey("Lamborghini Huracan GT3 EVO2")).toBe("lamborghini_huracan_gt3_evo2");
      expect(resolveCarKey("Ford Mustang GT3")).toBe("ford_mustang_gt3");
    });

    it("falls back to all_gt3 or amr_v8_vantage_gt3", () => {
      expect(resolveCarKey("")).toBe("amr_v8_vantage_gt3");
      expect(resolveCarKey("Custom Prototype")).toBe("all_gt3");
    });
  });

  describe("resolveRoundStatus", () => {
    it("resolves status string aliases correctly", () => {
      expect(resolveRoundStatus("Completed")).toBe("completed");
      expect(resolveRoundStatus("Done")).toBe("completed");
      expect(resolveRoundStatus("Past")).toBe("completed");
      expect(resolveRoundStatus("Live")).toBe("live");
      expect(resolveRoundStatus("Active")).toBe("live");
      expect(resolveRoundStatus("Current")).toBe("live");
      expect(resolveRoundStatus("Upcoming")).toBe("upcoming");
      expect(resolveRoundStatus("Next")).toBe("upcoming");
    });

    it("computes automatic status based on raceDateUtc timestamp", () => {
      const now = Date.now();
      const pastDate = new Date(now - 3 * 60 * 60 * 1000).toISOString(); // 3 hours ago -> completed
      const liveDate = new Date(now - 30 * 60 * 1000).toISOString(); // 30 mins ago -> live (within 2h window)
      const futureDate = new Date(now + 24 * 60 * 60 * 1000).toISOString(); // tomorrow -> upcoming

      expect(resolveRoundStatus("", pastDate)).toBe("completed");
      expect(resolveRoundStatus("", liveDate)).toBe("live");
      expect(resolveRoundStatus("", futureDate)).toBe("upcoming");
    });
  });

  describe("Column Header Mappings", () => {
    it("defines valid aliases for all essential calendar columns", () => {
      expect(CALENDAR_SHEET_MAPPING.columns.round).toContain("Round");
      expect(CALENDAR_SHEET_MAPPING.columns.trackKey).toContain("Circuit");
      expect(CALENDAR_SHEET_MAPPING.columns.raceAt).toContain("Race");
    });

    it("defines valid aliases for all essential results columns", () => {
      expect(RESULTS_SHEET_MAPPING.columns.driver).toContain("Driver");
      expect(RESULTS_SHEET_MAPPING.columns.position).toContain("Pos");
      expect(RESULTS_SHEET_MAPPING.columns.points).toContain("Points");
    });

    it("defines valid aliases for standings and pace metrics", () => {
      expect(STANDINGS_SHEET_MAPPING.columns.points).toContain("Total Points");
      expect(PACE_METRICS_MAPPING.columns.pacePercentage).toContain("Pace %");
    });
  });
});
