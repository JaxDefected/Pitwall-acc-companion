import laptimesDataImport from "./acc_laptimes.json";
import { CIRCUIT_NOTES } from "./circuitNotes";

// Safe JSON casting to prevent type errors
const laptimesData = laptimesDataImport as any;

/**
 * Alignment lookup mappings for matching ACC internal identifiers
 * from parsed setup JSON files to display names in acc_laptimes.json.
 */

export const CAR_NAME_MAP: Record<string, string> = {
  // GT3 Cars
  "amr_v8_vantage_gt3": "AMR V8 Vantage (2019)",
  "audi_r8_lms_evo": "Audi R8 LMS Evo (2019)",
  "audi_r8_lms_evo_ii": "Audi R8 LMS GT3 evo II (2022)",
  "bentley_continental_gt3_2018": "Bentley Continental (2018)",
  "bmw_m4_gt3": "BMW M4 GT3 (2021)",
  "bmw_m6_gt3": "BMW M6 GT3 (2017)",
  "ferrari_296_gt3": "Ferrari 296 GT3 (2023)",
  "ferrari_488_gt3_evo": "Ferrari 488 GT3 Evo (2020)",
  "ford_mustang_gt3": "Ford Mustang GT3 (2024)",
  "honda_nsx_gt3_evo": "Honda NSX GT3 Evo (2019)",
  "lamborghini_huracan_gt3_evo": "Lamborghini Huracan GT3 Evo (2019)",
  "lamborghini_huracan_gt3_evo2": "Lamborghini Huracan GT3 EVO 2 (2023)",
  "lexus_rc_f_gt3": "Lexus RC F GT3 (2016)",
  "mclaren_720s_gt3": "McLaren 720S GT3 (2019)",
  "mclaren_720s_gt3_evo": "McLaren 720S GT3 Evo (2023)",
  "mercedes_amg_gt3_evo": "Mercedes-AMG GT3 (2020)",
  "nissan_gt_r_gt3_2018": "Nissan GT-R Nismo GT3 (2018)",
  "porsche_991ii_gt3_r": "Porsche 991II GT3 R (2019)",
  "porsche_992_gt3_r": "Porsche 992 GT3 R (2023)",
  "aston_martin_v12_vantage_gt3": "AMR V12 Vantage GT3 (2013)",
  "jaguar_g3": "Emil Frey Jaguar G3 (2012)",
  "audi_r8_lms": "Audi R8 LMS (2015)",
  "bentley_continental_gt3_2016": "Bentley Continental GT3 (2016)",
  "ferrari_488_gt3": "Ferrari 488 GT3 (2015)",
  "honda_nsx_gt3": "Honda NSX GT3 (2016)",
  "lamborghini_gallardo_rex": "Reiter Engineering R-EX GT3 (Gallardo) (2015)",
  "lamborghini_huracan_gt3": "Lamborghini Huracán GT3 (2015)",
  "mclaren_650s_gt3": "McLaren 650S GT3 (2015)",
  "mercedes_amg_gt3": "Mercedes-AMG GT3 (2015)",
  "nissan_gt_r_gt3_2017": "Nissan GT-R Nismo GT3 (2017)",
  "porsche_991_gt3_r": "Porsche 911 GT3 R (2015)",
  
  // GT4 Cars
  "chevrolet_camaro_gt4r": "Chevrolet Camaro GT4 (2017)",
  "mclaren_570s_gt4": "McLaren 570S GT4 (2016)",
  "bmw_m4_gt4": "BMW M4 GT4 (2018)",
  "audi_r8_lms_gt4": "Audi R8 LMS GT4 (2018)",
  "mercedes_amg_gt4": "Mercedes AMG GT4 (2016)",
  "porsche_718_cayman_gt4_cs": "Porsche 718 Cayman GT4 Clubsport (2019)",
  "alpine_a110_gt4": "Alpine A110 GT4 (2018)",
  "aston_martin_vantage_gt4": "Aston Martin Vantage GT4 (2018)",
  "ginetta_g55_gt4": "Ginetta G55 GT4 (2012)",
  "ktm_xbow_gt4": "KTM X-Bow GT4 (2016)",
  "maserati_mc_gt4": "Maserati MC GT4 (2016)",

  // GT2, Cup, ST, CHL, TCX Cars
  "bmw_m2_cs_racing": "BMW M2 CS Racing (2020)",
  "audi_r8_lms_gt2": "Audi R8 LMS GT2 (2022)",
  "ktm_xbow_gt2": "KTM X-BOW GT2 (2021)",
  "maserati_mc20_gt2": "Maserati MC20 GT2 (2023)",
  "mercedes_amg_gt2": "Mercedes-AMG GT2 (2023)",
  "porsche_935": "Porsche 935 GT2 (2019)",
  "porsche_991_gt2_rs_mr": "Porsche 991II GT2 RS CS Evo (2023)",
  "porsche_991ii_gt3_cup": "Porsche 991II GT3 Cup (2017)",
  "porsche_992_gt3_cup": "Porsche 992 GT3 Cup (2021)",
  "lamborghini_huracan_st_evo2": "Lamborghini Huracan ST EVO2 (2021)",
  "ferrari_488_challenge_evo": "Ferrari 488 Challenge Evo (2020)",
};

export const TRACK_KEY_MAP: Record<string, string> = {
  "barcelona": "Barcelona",
  "brands_hatch": "Brands Hatch",
  "cota": "COTA",
  "donington": "Donington Park",
  "hungaroring": "Hungaroring",
  "imola": "Imola",
  "indianapolis": "Indianapolis",
  "kyalami": "Kyalami",
  "laguna_seca": "Laguna Seca",
  "misano": "Misano",
  "monza": "Monza",
  "mount_panorama": "Mount Panorama",
  "nordschleife": "Nordschleife",
  "nuerburgring_24h": "Nordschleife",
  "nurburgring": "Nürburgring",
  "nuerburgring": "Nürburgring",
  "oulton_park": "Oulton Park",
  "paul_ricard": "Paul Ricard",
  "red_bull_ring": "Red Bull Ring",
  "silverstone": "Silverstone",
  "snetterton": "Snetterton",
  "spa": "Spa",
  "suzuka": "Suzuka",
  "valencia": "Valencia",
  "watkins_glen": "Watkins Glen",
  "zandvoort": "Zandvoort",
  "zolder": "Zolder"
};

export function secondsToLapTimeNotes(secs: number | null | undefined): string {
  if (secs === null || secs === undefined) return "N/A";
  const minutes = Math.floor(secs / 60);
  const remaining = (secs - minutes * 60).toFixed(3).padStart(6, '0');
  return `${minutes}:${remaining}`;
}

export function getLapTimesText(carKey: string, trackKey: string): string {
  const mappedCarName = CAR_NAME_MAP[carKey];
  const mappedTrackName = TRACK_KEY_MAP[trackKey];
  if (!mappedCarName || !mappedTrackName) return "";

  let carClass: "GT3" | "GT4" | null = null;
  let foundCarObj: any = null;

  const gt3Cars = laptimesData?.classes?.GT3?.cars || [];
  const gt3Match = gt3Cars.find((c: any) => c.car === mappedCarName);
  if (gt3Match) {
    carClass = "GT3";
    foundCarObj = gt3Match;
  } else {
    const gt4Cars = laptimesData?.classes?.GT4?.cars || [];
    const gt4Match = gt4Cars.find((c: any) => c.car === mappedCarName);
    if (gt4Match) {
      carClass = "GT4";
      foundCarObj = gt4Match;
    }
  }

  if (!foundCarObj) return "";
  const trackInfo = foundCarObj.tracks?.[mappedTrackName];
  if (!trackInfo) return "";

  let notesText = "";
  if (carClass === "GT3") {
    const p100 = secondsToLapTimeNotes(trackInfo.p100);
    const p104 = secondsToLapTimeNotes(trackInfo.p104);
    notesText = `ACC Benchmarks (GT3) ➔ Alien Pace (100%): ${p100} | Aim for (104%): ${p104}`;
  } else {
    const p101 = secondsToLapTimeNotes(trackInfo.p101);
    const p104 = secondsToLapTimeNotes(trackInfo.p104);
    notesText = `ACC Benchmarks (GT4) ➔ Alien Pace (101%): ${p101} | Aim for (104%): ${p104}`;
  }

  const circ = CIRCUIT_NOTES[mappedTrackName];
  if (circ) {
    notesText += `\n\n=== CREW BRIEFING: ${mappedTrackName.toUpperCase()} ===`;
    notesText += `\n• Track Notes: ${circ.circuit_notes}`;
    notesText += `\n• Downforce Profile: ${circ.setup_notes.downforce}`;
    notesText += `\n• Tyres Strategy: ${circ.setup_notes.tyres}`;
    notesText += `\n• Brakes Profile: ${circ.setup_notes.brakes}`;
    if (circ.setup_notes.fuel?.stint_recommendation) {
      notesText += `\n• Stint Recommendation: ${circ.setup_notes.fuel.stint_recommendation}`;
    }
    if (circ.key_corners && circ.key_corners.length > 0) {
      notesText += `\n• Crucial Angles:`;
      circ.key_corners.forEach(corner => {
        notesText += `\n  - ${corner}`;
      });
    }
  }
  return notesText;
}
