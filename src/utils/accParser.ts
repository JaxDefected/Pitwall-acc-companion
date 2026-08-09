// Assetto Corsa Competizione JSON Setup Parser Utility
// Ensure your ../data/cars file exports the array formatted as a dictionary keyed by car_name
import { cars } from "../data/cars";

// Dictionary mapping for cars in ACC (Updated with GT2, TCX, and Evo 2 cars)
export const ACC_CARS: Record<string, string> = {
  amr_v8_vantage_gt3: "Aston Martin Vantage V8 GT3",
  ferrari_296_gt3: "Ferrari 296 GT3",
  porsche_992_gt3_r: "Porsche 911 GT3 R (992)",
  bmw_m4_gt3: "BMW M4 GT3",
  audi_r8_lms_evo_ii: "Audi R8 LMS Evo II",
  mclaren_720s_gt3_evo: "McLaren 720S GT3 Evo",
  mercedes_amg_gt3_evo: "Mercedes-AMG GT3 Evo",
  lamborghini_huracan_gt3_evo2: "Lamborghini Huracan GT3 Evo 2",
  honda_nsx_gt3_evo: "Honda NSX GT3 Evo",
  bentley_continental_gt3_2018: "Bentley Continental GT3",
  lexus_rc_f_gt3: "Lexus RC F GT3",
  nissan_gt_r_gt3_2018: "Nissan GT-R Nismo GT3",
  porsche_991ii_gt3_r: "Porsche 911 GT3 R (991.2)",
  ferrari_488_gt3_evo: "Ferrari 488 GT3 Evo",
  mclaren_720s_gt3: "McLaren 720S GT3",
  audi_r8_lms_evo: "Audi R8 LMS Evo",
  aston_martin_v12_vantage_gt3: "Aston Martin V12 Vantage GT3",
  lamborghini_huracan_gt3_evo: "Lamborghini Huracán GT3 Evo",
  jaguar_g3: "Emil Frey Jaguar G3",
  audi_r8_lms: "Audi R8 LMS",
  bentley_continental_gt3_2016: "Bentley Continental GT3 (2016)",
  ferrari_488_gt3: "Ferrari 488 GT3",
  honda_nsx_gt3: "Honda NSX GT3",
  lamborghini_gallardo_rex: "Reiter Engineering R-EX GT3",
  lamborghini_huracan_gt3: "Lamborghini Huracán GT3",
  mclaren_650s_gt3: "McLaren 650S GT3",
  mercedes_amg_gt3: "Mercedes-AMG GT3",
  nissan_gt_r_gt3_2017: "Nissan GT-R Nismo GT3 (2017)",
  porsche_991_gt3_r: "Porsche 911 GT3 R (991)",
  
  // GT4
  chevrolet_camaro_gt4r: "Chevrolet Camaro GT4.R",
  mclaren_570s_gt4: "McLaren 570S GT4",
  bmw_m4_gt4: "BMW M4 GT4",
  audi_r8_lms_gt4: "Audi R8 LMS GT4",
  mercedes_amg_gt4: "Mercedes-AMG GT4",
  porsche_718_cayman_gt4_mr: "Porsche 718 Cayman GT4 CS",
  alpine_a110_gt4: "Alpine A110 GT4",
  amr_v8_vantage_gt4: "Aston Martin Vantage GT4",
  ginetta_g55_gt4: "Ginetta G55 GT4",
  ktm_xbow_gt4: "KTM X-Bow GT4",
  maserati_mc_gt4: "Maserati GranTurismo MC GT4",

  // GT2, Cup, ST, CHL, TCX Classes
  bmw_m2_cs_racing: "BMW M2 CS Racing (TCX)",
  audi_r8_lms_gt2: "Audi R8 LMS GT2",
  ktm_xbow_gt2: "KTM X-BOW GT2",
  maserati_mc20_gt2: "Maserati MC20 GT2",
  mercedes_amg_gt2: "Mercedes-AMG GT2",
  porsche_935: "Porsche 935 (GT2)",
  porsche_991_gt2_rs_mr: "Porsche 911 GT2 RS CS Evo",
  porsche_991ii_gt3_cup: "Porsche 911 GT3 Cup (991.2)",
  porsche_992_gt3_cup: "Porsche 911 GT3 Cup (992)",
  lamborghini_huracan_st_evo2: "Lamborghini Huracan ST Evo II",
  ferrari_488_challenge_evo: "Ferrari 488 Challenge Evo",
  bmw_m6_gt3: "BMW M6 GT3",
  ford_mustang_gt3: "Ford Mustang GT3 (2024)",
};

// Dictionary mapping for tracks in ACC
export const ACC_TRACKS: Record<string, string> = {
  monza: "Monza",
  spa: "Spa-Francorchamps",
  mount_panorama: "Mount Panorama (Bathurst)",
  silverstone: "Silverstone",
  barcelona: "Barcelona-Catalunya",
  brands_hatch: "Brands Hatch",
  imola: "Imola",
  kyalami: "Kyalami",
  nurburgring: "Nürburgring GP",
  nurburgring_24h: "Nordschleife",
  paul_ricard: "Paul Ricard",
  zandvoort: "Zandvoort",
  zolder: "Zolder",
  hungaroring: "Hungaroring",
  misano: "Misano",
  cota: "Circuit of the Americas",
  watkins_glen: "Watkins Glen",
  indianapolis: "Indianapolis",
  donington: "Donington Park",
  oulton_park: "Oulton Park",
  snetterton: "Snetterton",
  laguna_seca: "Laguna Seca",
  suzuka: "Suzuka",
  red_bull_ring: "Red Bull Ring",
  valencia: "Valencia (Ricardo Tormo)",
  jeddah: "Jeddah Corniche Circuit",
};

export interface NormalizedAccSetup {
  carKey: string;
  carName: string;
  trackKey: string;
  trackName: string;
  isUnsupportedCar?: boolean;
  validationWarnings?: string[];
  
  tyrePressures: number[];
  cambers: number[];
  toes: number[];
  casters: number[];
  
  tc1: number;
  tc2: number;
  abs: number;
  ecuMap: number;
  fuelMap: number;
  telemetryLaps: number;
  fuel: number;
  
  arbFront: number;
  arbRear: number;
  wheelRates: number[];
  bumpstopRates: number[];
  bumpstopRanges: number[];
  preloadDifferential: number;
  brakePower: number;
  brakeBias: number;
  steerRatio: number;
  
  rideHeights: number[];
  rearWing: number;
  splitter: number;
  brakeDucts: number[];
  
  bumpSlow: number[];
  bumpFast: number[];
  reboundSlow: number[];
  reboundFast: number[];
}

/**
 * Parses raw ACC setup JSON object into normalized structured data.
 */
export function parseAccSetup(rawJson: any, defaultFilename: string = "setup.json"): NormalizedAccSetup {
  const normalized: NormalizedAccSetup = {
    carKey: "unknown",
    carName: "Unknown GT3/GT4 Car",
    trackKey: "unknown",
    trackName: "Unknown Circuit",
    tyrePressures: [26.8, 26.8, 26.8, 26.8],
    cambers: [-3.5, -3.5, -3.0, -3.0],
    toes: [-0.1, -0.1, 0.15, 0.15],
    casters: [8.5, 8.5],
    tc1: 3, tc2: 2, abs: 3, ecuMap: 1, fuelMap: 1, telemetryLaps: 0, fuel: 20,
    arbFront: 5, arbRear: 3,
    wheelRates: [150000, 150000, 110000, 110000],
    bumpstopRates: [1000, 1000, 800, 800],
    bumpstopRanges: [10, 10, 15, 15],
    preloadDifferential: 120, brakePower: 100, brakeBias: 58.0, steerRatio: 13,
    rideHeights: [55, 68], rearWing: 4, splitter: 1, brakeDucts: [3, 3],
    bumpSlow: [8, 8, 8, 8], bumpFast: [10, 10, 10, 10],
    reboundSlow: [12, 12, 12, 12], reboundFast: [14, 14, 14, 14]
  };

  if (!rawJson || typeof rawJson !== "object") return normalized;

  // 1. Detect Car and Track name
  const rawCar = rawJson.carName || rawJson.car || "";
  const rawTrack = rawJson.trackName || rawJson.track || "";
  
  if (rawCar) {
    normalized.carKey = String(rawCar);
    normalized.carName = ACC_CARS[normalized.carKey] || cars[normalized.carKey]?.fullName || normalized.carKey;
  }
  if (rawTrack) {
    normalized.trackKey = String(rawTrack);
    normalized.trackName = ACC_TRACKS[normalized.trackKey] || normalized.trackKey;
  }

  // Fallback to filename matching if JSON doesn't provide them
  if (normalized.carKey === "unknown" || normalized.trackKey === "unknown") {
    const fnLower = defaultFilename.toLowerCase();
    for (const key of Object.keys(ACC_TRACKS)) {
      if (fnLower.includes(key)) { normalized.trackKey = key; normalized.trackName = ACC_TRACKS[key]; break; }
    }
    for (const key of Object.keys(ACC_CARS)) {
      if (fnLower.includes(key)) { normalized.carKey = key; normalized.carName = ACC_CARS[key]; break; }
    }
  }

  // Dynamic Car properties lookup based on the exact Webpack Schema
  const car = (cars as any)[normalized.carKey];
  const warnings: string[] = [];
  normalized.validationWarnings = warnings;

  if (!car) {
    normalized.isUnsupportedCar = true;
    warnings.push(`Car bounds not found for "${normalized.carKey}". Applying raw steps.`);
  }

  // Helper to safely get nested keys
  const getNestedVal = (obj: any, keys: string[]): any => {
    if (!obj || typeof obj !== "object") return undefined;
    for (const k of keys) {
      if (obj[k] !== undefined) return obj[k];
      for (const actualKey of Object.keys(obj)) {
        if (actualKey.toLowerCase() === k.toLowerCase()) return obj[actualKey];
      }
    }
    return undefined;
  };

  const basic = rawJson.basicSetup || rawJson;
  const advanced = rawJson.advancedSetup || rawJson;

  // -- TYRES & FUEL --
  const tyresSection = basic.tyres || getNestedVal(basic, ["tyres"]);
  if (tyresSection) {
    const rawPressures = tyresSection.tyrePressure || getNestedVal(tyresSection, ["tyrePressure", "tyrePressures"]);
    if (Array.isArray(rawPressures) && rawPressures.length === 4) {
// Use car-specific base PSI (GT3=20.3, GT4/GT2/Cup/TCX/CHL=17.0)
      const basePsi = car?.tyrePressureRange?.[0] ?? car?.tyrePressure_base ?? 20.3;
      const psiStep = car?.tyrePressureStep ?? car?.tyrePressure_step ?? 0.1;
      normalized.tyrePressures = rawPressures.map(step => {
        if (step > 100) return step; // Already an absolute float
        return Math.round((basePsi + step * psiStep) * 10) / 10;
      });
    }
  }

  normalized.fuel = getNestedVal(basic, ["fuel"]) ?? getNestedVal(tyresSection, ["fuel"]) ?? 20;

  // -- ALIGNMENT --
  const alignmentSection = basic.alignment || getNestedVal(basic, ["alignment"]);
  if (alignmentSection) {
    const rawCamber = getNestedVal(alignmentSection, ["camber", "cambers"]);
    const rawToe = getNestedVal(alignmentSection, ["toe", "toes"]);
    
    if (Array.isArray(rawCamber)) {
      normalized.cambers = rawCamber.map((c, idx) => {
        if (c >= 0) {
          const minVal = idx < 2 ? (car?.camberFront_base ?? -4.0) : (car?.camberRear_base ?? -3.5);
          const step = idx < 2 ? (car?.camberFront_step ?? 0.1) : (car?.camberRear_step ?? 0.1);
          return Math.round((minVal + c * step) * 100) / 100;
        }
        return c;
      });
    }

    if (Array.isArray(rawToe)) {
      normalized.toes = rawToe.map((t, idx) => {
        if (Number.isInteger(t)) {
          const minVal = idx < 2 ? (car?.toeFront_base ?? -0.4) : (car?.toeRear_base ?? -0.4);
          const step = idx < 2 ? (car?.toeFront_step ?? 0.01) : (car?.toeRear_step ?? 0.01);
          return Math.round((minVal + t * step) * 100) / 100;
        }
        return t;
      });
    }

    // Casters mapping with strict discrete array checks
    const rawCaster = getNestedVal(alignmentSection, ["caster", "casters"]);
    const rawLF = getNestedVal(alignmentSection, ["casterLF"]) ?? (Array.isArray(rawCaster) ? rawCaster[0] : undefined);
    const rawRF = getNestedVal(alignmentSection, ["casterRF"]) ?? (Array.isArray(rawCaster) ? rawCaster[1] : undefined);

    if (rawLF !== undefined && rawRF !== undefined) {
      if (car?.caster_values && car.caster_values.length > 0) {
        normalized.casters[0] = rawLF < car.caster_values.length ? car.caster_values[rawLF] : rawLF;
        normalized.casters[1] = rawRF < car.caster_values.length ? car.caster_values[rawRF] : rawRF;
      } else {
        const cBase = car?.caster_base ?? 8.8;
        const cStep = car?.caster_step ?? 0.1;
        normalized.casters[0] = typeof rawLF === 'number' && rawLF < 45 ? Math.round((cBase + rawLF * cStep) * 10) / 10 : rawLF;
        normalized.casters[1] = typeof rawRF === 'number' && rawRF < 45 ? Math.round((cBase + rawRF * cStep) * 10) / 10 : rawRF;
      }
    }
  }

  // -- ELECTRONICS --
  const elecSection = basic.electronics || getNestedVal(basic, ["electronics"]);
  if (elecSection) {
    normalized.tc1 = getNestedVal(elecSection, ["tc1", "tC1"]) ?? normalized.tc1;
    normalized.tc2 = getNestedVal(elecSection, ["tc2", "tC2"]) ?? normalized.tc2;
    normalized.abs = getNestedVal(elecSection, ["abs", "aBS"]) ?? normalized.abs;
    normalized.ecuMap = getNestedVal(elecSection, ["ecuMap", "eCUMap"]) ?? normalized.ecuMap;
    normalized.fuelMap = getNestedVal(elecSection, ["fuelMap"]) ?? normalized.fuelMap;
    normalized.telemetryLaps = getNestedVal(elecSection, ["telemetryLaps"]) ?? normalized.telemetryLaps;
  }

  // -- MECHANICAL GRIP & BALANCE --
  const mechSection = advanced.mechanicalGrip || advanced.mechanicalBalance || getNestedVal(advanced, ["mechanicalGrip", "mechanicalBalance"]);
  
  // Brake Bias mapping
  const rawBB = elecSection ? getNestedVal(elecSection, ["brakeBias"]) : (mechSection ? getNestedVal(mechSection, ["brakeBias"]) : undefined);
  if (rawBB !== undefined) {
    if (rawBB > 30) {
      normalized.brakeBias = rawBB;
    } else {
      const bbBase = car?.brakeBias_base ?? 50.0;
      const bbStep = car?.brakeBias_step ?? 0.2;
      normalized.brakeBias = Math.round((bbBase + rawBB * bbStep) * 10) / 10;
    }
  }

  if (mechSection) {
    normalized.arbFront = getNestedVal(mechSection, ["aRBFront", "antirollBarFront", "arbFront"]) ?? normalized.arbFront;
    normalized.arbRear = getNestedVal(mechSection, ["aRBRear", "antirollBarRear", "arbRear"]) ?? normalized.arbRear;
    
    const srVal = getNestedVal(mechSection, ["steerRatio"]);
    if (srVal !== undefined) {
      const srBase = car?.steerRatio_base ?? 11;
      const srStep = car?.steerRatio_step ?? 1;
      normalized.steerRatio = srVal < 30 ? (srBase + srVal * srStep) : srVal;
    }

    const btVal = getNestedVal(mechSection, ["brakeTorque"]);
    if (btVal !== undefined) normalized.brakePower = 100 - btVal; // Or use brakeTorque_base calculations if strict

    // Preload Differential
    const dtSection = advanced.drivetrain || getNestedVal(advanced, ["drivetrain"]);
    const rawPreload = dtSection ? getNestedVal(dtSection, ["preload", "preloadDifferential"]) : getNestedVal(mechSection, ["preloadDifferential", "preload"]);
    if (rawPreload !== undefined) {
      const plBase = car?.preloadDifferential_base ?? 20;
      const plStep = car?.preloadDifferential_step ?? 10;
      normalized.preloadDifferential = rawPreload < 35 ? (plBase + rawPreload * plStep) : rawPreload;
    }

    // Wheel Rates (Using strict _values arrays from schema)
    const rawWheelRates = getNestedVal(mechSection, ["wheelRate", "wheelRates"]);
    if (Array.isArray(rawWheelRates) && rawWheelRates.length === 4) {
      normalized.wheelRates = rawWheelRates.map((v, i) => {
        if (v < 100) {
          if (i < 2) { // Front
            if (car?.wheelRateFront_values && v < car.wheelRateFront_values.length) return car.wheelRateFront_values[v];
            return (car?.wheelRateFront_base ?? 100000) + v * (car?.wheelRateFront_step ?? 5000);
          } else { // Rear
            if (car?.wheelRateRear_values && v < car.wheelRateRear_values.length) return car.wheelRateRear_values[v];
            return (car?.wheelRateRear_base ?? 80000) + v * (car?.wheelRateRear_step ?? 5000);
          }
        }
        return v;
      });
    }

    // Bumpstops (Rates & Ranges)
    const bsRates = getNestedVal(mechSection, ["bumpStopRate", "bumpStopRates"]);
    if (Array.isArray(bsRates)) {
      normalized.bumpstopRates = bsRates.map(v => v < 100 ? (car?.bumpStopRate_base ?? 300) + v * (car?.bumpStopRate_step ?? 100) : v);
    }

    const bsRanges = getNestedVal(mechSection, ["bumpStopWindow", "bumpStopRange", "bumpStopRanges"]);
    if (Array.isArray(bsRanges)) {
      normalized.bumpstopRanges = bsRanges.map(v => v < 100 ? (car?.bumpStopRange_base ?? 0) + v * (car?.bumpStopRange_step ?? 1) : v);
    }
  }

  // -- AERO --
  const aeroSection = advanced.aero || advanced.aeroBalance || getNestedVal(advanced, ["aeroBalance", "aero", "aerodynamics"]);
  if (aeroSection) {
    const rhVal = getNestedVal(aeroSection, ["rideHeight", "rideHeights"]);
    const rearWingVal = getNestedVal(aeroSection, ["rearWing", "rearWingAngle"]);
    const splitterVal = getNestedVal(aeroSection, ["splitter"]);
    const brakeDuctVal = getNestedVal(aeroSection, ["brakeDuct", "brakeDucts"]);

if (Array.isArray(rhVal)) {
      // Use Nordschleife-specific ride height ranges when applicable
      const isNord = normalized.trackKey === 'nurburgring_24h';
      const fRange = (isNord ? car?.rideHeightFrontRange_n24h : null) ?? car?.rideHeightFrontRange ?? [50, 90];
      const rRange = (isNord ? car?.rideHeightRearRange_n24h : null) ?? car?.rideHeightRearRange ?? [50, 100];
      
      normalized.rideHeights = rhVal.map((v, i) => {
        // Handle 4-length array [LF, RF, LR, RR] or 2-length [F, R]
        if (v < 45) {
          const isFront = (rhVal.length === 4) ? (i < 2) : (i === 0);
          return (isFront ? fBase : rBase) + v * 1.0; 
        }
        return v;
      });
    }

    normalized.rearWing = getNestedVal(aeroSection, ["rearWing"]) ?? normalized.rearWing;
    normalized.splitter = getNestedVal(aeroSection, ["splitter"]) ?? normalized.splitter;
    normalized.brakeDucts = getNestedVal(aeroSection, ["brakeDuct", "brakeDucts"]) ?? normalized.brakeDucts;
  }

  // -- DAMPERS --
  const dampersSection = advanced.dampers || getNestedVal(advanced, ["dampers"]);
  if (dampersSection) {
    const bumpSlowVal = getNestedVal(dampersSection, ["bumpSlow", "bumpSlows"]);
    const bumpFastVal = getNestedVal(dampersSection, ["bumpFast", "bumpFasts"]);
    const reboundSlowVal = getNestedVal(dampersSection, ["reboundSlow", "reboundSlows"]);
    const reboundFastVal = getNestedVal(dampersSection, ["reboundFast", "reboundFasts"]);

    if (Array.isArray(bumpSlowVal) && bumpSlowVal.length === 4) {
      normalized.bumpSlow = bumpSlowVal;
    }
    if (Array.isArray(bumpFastVal) && bumpFastVal.length === 4) {
      normalized.bumpFast = bumpFastVal;
    }
    if (Array.isArray(reboundSlowVal) && reboundSlowVal.length === 4) {
      normalized.reboundSlow = reboundSlowVal;
    }
    if (Array.isArray(reboundFastVal) && reboundFastVal.length === 4) {
      normalized.reboundFast = reboundFastVal;
    }
  }

  return normalized;
}
