// Assetto Corsa Competizione JSON Setup Parser Utility
import { cars } from "../data/cars";

// Dictionary mapping for cars in ACC
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
  lamborghini_gallardo_rex: "Reiter Engineering R-EX GT3 (Gallardo)",
  lamborghini_huracan_gt3: "Lamborghini Huracán GT3",
  mclaren_650s_gt3: "McLaren 650S GT3",
  mercedes_amg_gt3: "Mercedes-AMG GT3",
  nissan_gt_r_gt3_2017: "Nissan GT-R Nismo GT3 (2017)",
  porsche_991_gt3_r: "Porsche 911 GT3 R (991)",
  chevrolet_camaro_gt4r: "Chevrolet Camaro GT4.R",
  mclaren_570s_gt4: "McLaren 570S GT4",
  bmw_m4_gt4: "BMW M4 GT4",
  audi_r8_lms_gt4: "Audi R8 LMS GT4",
  mercedes_amg_gt4: "Mercedes-AMG GT4",
  porsche_718_cayman_gt4_cs: "Porsche 718 Cayman GT4",
  alpine_a110_gt4: "Alpine A110 GT4",
  aston_martin_vantage_gt4: "Aston Martin Vantage GT4",
  ginetta_g55_gt4: "Ginetta G55 GT4",
  ktm_xbow_gt4: "KTM X-Bow GT4",
  maserati_mc_gt4: "Maserati GranTurismo MC GT4",

  // GT2, Cup, ST, CHL, TCX Classes (including M2 TCX)
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
  ford_mustang_gt3: "Ford Mustang GT3",
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
  
  // Tyres HUD (LF, RF, LR, RR)
  tyrePressures: number[]; // e.g. [26.5, 26.8, 26.2, 26.5]
  cambers: number[];       // Camber values
  toes: number[];          // Toe values
  casters: number[];       // Front casters (only 2 usually)
  
  // Electronics
  tc1: number;
  tc2: number;
  abs: number;
  ecuMap: number;
  fuelMap: number;
  telemetryLaps: number;
  fuel: number;         // Fuel in litres (typically in basicSetup.fuel)
  
  // Mechanical Grid
  arbFront: number;
  arbRear: number;
  wheelRates: number[];     // LF, RF, LR, RR
  bumpstopRates: number[];  // LF, RF, LR, RR
  bumpstopRanges: number[]; // LF, RF, LR, RR
  preloadDifferential: number;
  brakePower: number;       // Brake torque / power %
  brakeBias: number;        // Brake bias %
  steerRatio: number;       // Steer ratio value
  
  // Aero
  rideHeights: number[];    // Front, Rear
  rearWing: number;
  splitter: number;
  brakeDucts: number[];     // Front, Rear
  
  // Dampers
  bumpSlow: number[];       // LF, RF, LR, RR
  bumpFast: number[];
  reboundSlow: number[];
  reboundFast: number[];
}

/**
 * Formula to convert ACC Tyre raw step values to estimated PSI values.
 * In ACC, most cars raw tyre pressures start around 0 to 80 steps.
 * 0 steps corresponds to ~20.0 PSI, and each step increases pressure by 0.1 PSI.
 */
function stepsToPsi(step: number): number {
  if (step > 100) return step; // Already parsed as absolute float
  return Math.round((20.3 + step * 0.1) * 10) / 10;
}

/**
 * Parses raw ACC setup JSON object into normalized structured data.
 * Supports highly forgiving recovery if the JSON is custom, altered, or partially complete.
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
    tc1: 3,
    tc2: 2,
    abs: 3,
    ecuMap: 1,
    fuelMap: 1,
    telemetryLaps: 0,
    fuel: 20,
    arbFront: 5,
    arbRear: 3,
    wheelRates: [150000, 150000, 110000, 110000],
    bumpstopRates: [1000, 1000, 800, 800],
    bumpstopRanges: [10, 10, 15, 15],
    preloadDifferential: 120,
    brakePower: 100,
    brakeBias: 58.0,
    steerRatio: 13,
    rideHeights: [55, 68],
    rearWing: 4,
    splitter: 1,
    brakeDucts: [3, 3],
    bumpSlow: [8, 8, 8, 8],
    bumpFast: [10, 10, 10, 10],
    reboundSlow: [12, 12, 12, 12],
    reboundFast: [14, 14, 14, 14]
  };

  if (!rawJson || typeof rawJson !== "object") {
    return normalized;
  }

  // Detect Car and Track name
  const rawCar = rawJson.carName || rawJson.car || "";
  const rawTrack = rawJson.trackName || rawJson.track || "";
  
  if (rawCar) {
    normalized.carKey = String(rawCar);
    normalized.carName = ACC_CARS[normalized.carKey] || normalized.carKey;
  }
  if (rawTrack) {
    normalized.trackKey = String(rawTrack);
    normalized.trackName = ACC_TRACKS[normalized.trackKey] || normalized.trackKey;
  }

  // Attempt to parse out track/car keys directly from filename if raw data is missing
  if (normalized.carKey === "unknown" || normalized.trackKey === "unknown") {
    const fnLower = defaultFilename.toLowerCase();
    
    // Scan tracks in filename
    for (const key of Object.keys(ACC_TRACKS)) {
      if (fnLower.includes(key)) {
        normalized.trackKey = key;
        normalized.trackName = ACC_TRACKS[key];
        break;
      }
    }
    // Scan cars in filename
    for (const key of Object.keys(ACC_CARS)) {
      if (fnLower.includes(key)) {
        normalized.carKey = key;
        normalized.carName = ACC_CARS[key];
        break;
      }
    }
  }

  // Dynamic Car properties lookup
  const car = cars[normalized.carKey];

  // Grab sections
  const basic = rawJson.basicSetup || rawJson;
  const advanced = rawJson.advancedSetup || rawJson;

  // Helper to safely get nested or flat keys under case-insensitive/variant check
  const getNestedVal = (obj: any, keys: string[]): any => {
    if (!obj || typeof obj !== "object") return undefined;
    for (const k of keys) {
      if (obj[k] !== undefined) return obj[k];
      // Check lowercase matches
      for (const actualKey of Object.keys(obj)) {
        if (actualKey.toLowerCase() === k.toLowerCase()) {
          return obj[actualKey];
        }
      }
    }
    return undefined;
  };

  // 1. TYRES (basicSetup.tyres or basicSetup.tyres.tyrePressure etc.)
  const tyresSection = basic.tyres || getNestedVal(basic, ["tyres"]);
  if (tyresSection) {
    const rawPressures = tyresSection.tyrePressure || getNestedVal(tyresSection, ["tyrePressure", "tyrePressures"]);
    if (Array.isArray(rawPressures) && rawPressures.length === 4) {
      normalized.tyrePressures = rawPressures.map(stepsToPsi);
    }
  }
  
  // ALIGNMENT (basicSetup.alignment)
  const alignmentSection = basic.alignment || getNestedVal(basic, ["alignment"]);
  if (alignmentSection) {
    const camber = alignmentSection.camber || getNestedVal(alignmentSection, ["camber", "cambers"]);
    const toe = alignmentSection.toe || getNestedVal(alignmentSection, ["toe", "toes"]);
    const caster = alignmentSection.caster || getNestedVal(alignmentSection, ["caster", "casters"]);
    
    if (camber && Array.isArray(camber)) {
      normalized.cambers = camber;
    }

    if (toe && Array.isArray(toe)) {
      normalized.toes = toe;
    }

    if (caster && Array.isArray(caster)) {
      normalized.casters = caster;
    }
  }

  // 2. ELECTRONICS (basicSetup.electronics)
  const elecSection = basic.electronics || getNestedVal(basic, ["electronics"]);
  if (elecSection) {
    const tc1Val = getNestedVal(elecSection, ["tc1", "tC1"]);
    const tc2Val = getNestedVal(elecSection, ["tc2", "tC2"]);
    const absVal = getNestedVal(elecSection, ["abs", "aBS"]);
    const ecuMapVal = getNestedVal(elecSection, ["ecuMap", "eCUMap"]);
    const fuelMapVal = getNestedVal(elecSection, ["fuelMap", "fuelMap"]);
    const telemetryLapsVal = getNestedVal(elecSection, ["telemetryLaps", "telemetryLaps"]);

    if (tc1Val !== undefined) normalized.tc1 = tc1Val;
    if (tc2Val !== undefined) normalized.tc2 = tc2Val;
    if (absVal !== undefined) normalized.abs = absVal;
    if (ecuMapVal !== undefined) normalized.ecuMap = ecuMapVal;
    if (fuelMapVal !== undefined) normalized.fuelMap = fuelMapVal;
    if (telemetryLapsVal !== undefined) normalized.telemetryLaps = telemetryLapsVal;
  }

  // Parse fuel (basicSetup.fuel or tyresSection.fuel)
  const fuelVal = getNestedVal(basic, ["fuel"]) !== undefined 
    ? getNestedVal(basic, ["fuel"]) 
    : (tyresSection && getNestedVal(tyresSection, ["fuel"]) !== undefined ? getNestedVal(tyresSection, ["fuel"]) : 20);
  normalized.fuel = fuelVal;

  // Parse Brake Bias (basicSetup.electronics.brakeBias or advancedSetup.mechanicalGrip.brakeBias)
  const brakeBiasVal = elecSection ? getNestedVal(elecSection, ["brakeBias", "brakeBias"]) : undefined;
  const mechBrakeBias = advanced.mechanicalGrip ? getNestedVal(advanced.mechanicalGrip, ["brakeBias", "brakeBias"]) : undefined;
  const targetBB = brakeBiasVal !== undefined ? brakeBiasVal : mechBrakeBias;
  if (targetBB !== undefined) {
    normalized.brakeBias = targetBB > 30 ? targetBB : Math.round((50 + targetBB * 0.2) * 10) / 10;
  }

  // 3. MECHANICAL GRIP (advancedSetup.mechanicalGrip)
  const mechanicalGripSection = advanced.mechanicalGrip || getNestedVal(advanced, ["mechanicalGrip"]);
  if (mechanicalGripSection) {
    const arbFrontVal = getNestedVal(mechanicalGripSection, ["antirollBarFront", "antirollbarFront", "arbFront"]);
    const arbRearVal = getNestedVal(mechanicalGripSection, ["antirollBarRear", "antirollbarRear", "arbRear"]);
    const steerRatioVal = getNestedVal(mechanicalGripSection, ["steerRatio", "steerRatio"]);
    const brakeTorqueVal = getNestedVal(mechanicalGripSection, ["brakeTorque", "brakeTorque"]);
    
    if (arbFrontVal !== undefined) normalized.arbFront = Math.max(0, arbFrontVal - 1);
    if (arbRearVal !== undefined) normalized.arbRear = Math.max(0, arbRearVal - 1);
    if (steerRatioVal !== undefined) {
      if (steerRatioVal < 10) {
        const srRange = car?.steerRatioRange || [10, 18];
        const step = car?.steerRatioStep || 1;
        normalized.steerRatio = srRange[0] + steerRatioVal * step;
      } else {
        normalized.steerRatio = steerRatioVal;
      }
    }
    
    // Brake power (usually 100 - brakeTorque, where brakeTorque is step offset like 0 = 100%, 1=99%, etc)
    if (brakeTorqueVal !== undefined) {
      normalized.brakePower = 100 - brakeTorqueVal;
    }
    
    const wheelRateVal = getNestedVal(mechanicalGripSection, ["wheelRate", "wheelRates"]);
    if (Array.isArray(wheelRateVal) && wheelRateVal.length === 4) {
      normalized.wheelRates = wheelRateVal.map((v, i) => {
        if (v < 100) {
          if (i < 2) {
            if (car && car.wheelRatesFront && v < car.wheelRatesFront.length) {
              return car.wheelRatesFront[v];
            }
            return 100000 + v * 5000;
          } else {
            if (car && car.wheelRatesRear && v < car.wheelRatesRear.length) {
              return car.wheelRatesRear[v];
            }
            return 80000 + v * 5000;
          }
        }
        return v;
      });
    }

    const bumpStopRateVal = getNestedVal(mechanicalGripSection, ["bumpStopRate", "bumpstopRate", "bumpStopRates", "bumpstopRates"]);
    if (Array.isArray(bumpStopRateVal) && bumpStopRateVal.length === 4) {
      normalized.bumpstopRates = bumpStopRateVal.map((v, i) => {
        if (v < 100) {
          const bsFRateRange = car?.bumpStopFrontRateRange || car?.bumpStopRateRange || [300, 2500];
          const bsRRateRange = car?.bumpStopRearRateRange || car?.bumpStopRateRange || [300, 2500];
          const step = i < 2 
            ? (car?.bumpStopRateFrontStep || car?.bumpStopRateStep || 100) 
            : (car?.bumpStopRateRearStep || car?.bumpStopRateStep || 100);
          const minVal = i < 2 ? bsFRateRange[0] : bsRRateRange[0];
          return minVal + v * step;
        }
        return v;
      });
    }

    const bumpStopRangeVal = getNestedVal(mechanicalGripSection, ["bumpStopRange", "bumpstopRange", "bumpStopRanges", "bumpstopRanges"]);
    if (Array.isArray(bumpStopRangeVal) && bumpStopRangeVal.length === 4) {
      normalized.bumpstopRanges = bumpStopRangeVal.map((v, i) => {
        if (v < 100) {
          const bsFRange = car?.bumpStopWindowFrontRange || [0, 50];
          const bsRRange = car?.bumpStopWindowRearRange || [0, 50];
          const step = car?.bumpStopWindowStep || 1;
          const minVal = i < 2 ? bsFRange[0] : bsRRange[0];
          return minVal + v * step;
        }
        return v;
      });
    }
  }

  // Differential Preload (advancedSetup.drivetrain or mechanicalGripSection.preload)
  const drivetrainSection = advanced.drivetrain || getNestedVal(advanced, ["drivetrain"]);
  const preloadVal = drivetrainSection ? getNestedVal(drivetrainSection, ["preload", "preloadDifferential"]) : undefined;
  const mechPreload = mechanicalGripSection ? getNestedVal(mechanicalGripSection, ["preload"]) : undefined;
  const targetPreload = preloadVal !== undefined ? preloadVal : mechPreload;
  if (targetPreload !== undefined) {
    if (targetPreload < 35) {
      const plRange = car?.preloadRange || [50, 305];
      const step = car?.preloadStep || 10;
      normalized.preloadDifferential = plRange[0] + targetPreload * step;
    } else {
      normalized.preloadDifferential = targetPreload;
    }
  }

  // 4. AERO (advancedSetup.aero)
  const aeroSection = advanced.aero || getNestedVal(advanced, ["aero", "aeroSetup", "aeroBalance", "aerodynamics"]);
  if (aeroSection) {
    const rideHeightVal = getNestedVal(aeroSection, ["rideHeight", "rideHeights"]);
    const rearWingVal = getNestedVal(aeroSection, ["rearWing", "rearWingAngle"]);
    const splitterVal = getNestedVal(aeroSection, ["splitter"]);
    const brakeDuctVal = getNestedVal(aeroSection, ["brakeDuct", "brakeDucts"]);

    if (Array.isArray(rideHeightVal)) {
      if (rideHeightVal.length === 4) {
        const avgFront = (rideHeightVal[0] + rideHeightVal[1]) / 2;
        const avgRear = (rideHeightVal[2] + rideHeightVal[3]) / 2;
        
        const fRange = car?.rideHeightFrontRange || [50, 90];
        const rRange = car?.rideHeightRearRange || [50, 100];
        const step = car?.rideHeightStep || 1;
        
        normalized.rideHeights = [
          avgFront < 45 ? fRange[0] + avgFront * step : avgFront,
          avgRear < 45 ? rRange[0] + avgRear * step : avgRear
        ];
      } else if (rideHeightVal.length === 2) {
        normalized.rideHeights = rideHeightVal.map((v, i) => {
          if (v < 45) {
            const range = i === 0 ? (car?.rideHeightFrontRange || [50, 90]) : (car?.rideHeightRearRange || [50, 100]);
            const step = car?.rideHeightStep || 1;
            return range[0] + v * step;
          }
          return v;
        });
      }
    }
    if (rearWingVal !== undefined) normalized.rearWing = rearWingVal;
    if (splitterVal !== undefined) normalized.splitter = splitterVal;
    if (Array.isArray(brakeDuctVal) && brakeDuctVal.length === 2) {
      normalized.brakeDucts = brakeDuctVal;
    }
  }

  // 5. DAMPERS (advancedSetup.dampers)
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

  // Alignment click-to-degree scaling conversions (ACC JSON exports are click indices)
  const defCamberF = car?.camberFrontRange || [-4.0, -1.5];
  const defCamberR = car?.camberRearRange || [-3.5, -1.0];
  const defCamberStep = car?.camberStep || 0.1;
  
  const defToeF = car?.toeFrontRange || [-0.4, 0.4];
  const defToeR = car?.toeRearRange || [-0.4, 0.4];
  const defToeStep = car?.toeStep || 0.01;

  const defCasterRange = car?.casterRange || [4.0, 15.0];
  const defCasterStep = car?.casterStep || 0.1;
  const casterArr = car?.casterArr || [];

  // Convert cambers (index raw is non-negative, physical degrees are negative)
  normalized.cambers = normalized.cambers.map((c, idx) => {
    if (c >= 0) { // It is a raw click index
      const maxVal = idx < 2 ? defCamberF[1] : defCamberR[1];
      const step = defCamberStep;
      return Math.round((maxVal - c * step) * 100) / 100;
    }
    return c; // Already in physical degrees
  });

  // Convert toes (click indices are whole numbers usually between 0 and 80)
  normalized.toes = normalized.toes.map((t, idx) => {
    // If it's a whole number, it is a click index
    if (Number.isInteger(t)) {
      const minVal = idx < 2 ? defToeF[0] : defToeR[0];
      const step = defToeStep;
      return Math.round((minVal + t * step) * 100) / 100;
    }
    return t; // Already in physical degrees
  });

  // Convert casters
  normalized.casters = normalized.casters.map((c) => {
    if (Number.isInteger(c)) {
      if (casterArr && casterArr.length > 0) {
        // Caster has exactly 11 clicks (0 to 10) in game which maps to the last 11 entries of physics array
        const physicsIndex = Math.min(casterArr.length - 1, Math.max(0, casterArr.length - 11 + c));
        return casterArr[physicsIndex];
      } else {
        const minVal = defCasterRange[0];
        const step = defCasterStep;
        return Math.round((minVal + c * step) * 100) / 100;
      }
    }
    return c; // Already in physical degrees
  });
  const warnings: string[] = [];
  normalized.validationWarnings = warnings;

  function clamp(val: number, min: number, max: number, name: string): number {
    const clamped = Math.min(Math.max(val, min), max);
    if (Math.abs(clamped - val) > 0.0001) {
      warnings.push(`${name} clamped to range [${min}, ${max}] (originally ${val})`);
    }
    return clamped;
  }

  function snap(val: number, arr: number[], name: string): number {
    if (!arr || arr.length === 0) return val;
    let closest = arr[0];
    let minDiff = Math.abs(val - closest);
    for (let i = 1; i < arr.length; i++) {
      const diff = Math.abs(val - arr[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closest = arr[i];
      }
    }
    if (Math.abs(closest - val) > 0.0001) {
      warnings.push(`${name} snapped to nearest valid discrete rate: ${closest} (originally ${val})`);
    }
    return closest;
  }

  if (!car) {
    normalized.isUnsupportedCar = true;
    warnings.push(`Car bounds not found for "${normalized.carKey}". Default slider limits applied.`);
  } else {
    // 1. Tyre pressures
    const pressRange = car.tyrePressureRange || [20.3, 35.0];
    normalized.tyrePressures = normalized.tyrePressures.map((p, idx) => {
      const names = ["LF pressure", "RF pressure", "LR pressure", "RR pressure"];
      return clamp(p, pressRange[0], pressRange[1], names[idx]);
    });

    // 2. Toes
    const toeFRange = car.toeFrontRange || [-0.4, 0.4];
    normalized.toes[0] = clamp(normalized.toes[0], toeFRange[0], toeFRange[1], "Toe LF");
    normalized.toes[1] = clamp(normalized.toes[1], toeFRange[0], toeFRange[1], "Toe RF");
    
    const toeRRange = car.toeRearRange || [-0.4, 0.4];
    normalized.toes[2] = clamp(normalized.toes[2], toeRRange[0], toeRRange[1], "Toe LR");
    normalized.toes[3] = clamp(normalized.toes[3], toeRRange[0], toeRRange[1], "Toe RR");

    // 3. Cambers
    const cambFRange = car.camberFrontRange || [-4.0, -1.5];
    normalized.cambers[0] = clamp(normalized.cambers[0], cambFRange[0], cambFRange[1], "Camber LF");
    normalized.cambers[1] = clamp(normalized.cambers[1], cambFRange[0], cambFRange[1], "Camber RF");

    const cambRRange = car.camberRearRange || [-3.5, -1.0];
    normalized.cambers[2] = clamp(normalized.cambers[2], cambRRange[0], cambRRange[1], "Camber LR");
    normalized.cambers[3] = clamp(normalized.cambers[3], cambRRange[0], cambRRange[1], "Camber RR");

    // 4. Casters
    if (car.casterArr && car.casterArr.length > 0) {
      normalized.casters[0] = snap(normalized.casters[0], car.casterArr, "Caster LF");
      normalized.casters[1] = snap(normalized.casters[1], car.casterArr, "Caster RF");
    } else {
      const castRange = car.casterRange || [4.0, 15.0];
      normalized.casters[0] = clamp(normalized.casters[0], castRange[0], castRange[1], "Caster LF");
      normalized.casters[1] = clamp(normalized.casters[1], castRange[0], castRange[1], "Caster RF");
    }

    // 5. ECU Map and Brake Bias
    const ecuRange = car.eCUMapRange || [1, 12];
    normalized.ecuMap = clamp(normalized.ecuMap, ecuRange[0], ecuRange[1], "ECU Engine Map");

    const bbRange = car.brakeBiasRange || [40.0, 75.0];
    normalized.brakeBias = clamp(normalized.brakeBias, bbRange[0], bbRange[1], "Brake Bias");

    const btRange = car.brakeTorqueRange || [80, 100];
    normalized.brakePower = clamp(normalized.brakePower, btRange[0], btRange[1], "Brake Power");

    // 6. Mechanical Grip
    const srRange = car.steerRatioRange || [10, 18];
    normalized.steerRatio = clamp(normalized.steerRatio, srRange[0], srRange[1], "Steer Ratio");

    if (car.wheelRatesFront && car.wheelRatesFront.length > 0) {
      normalized.wheelRates[0] = snap(normalized.wheelRates[0], car.wheelRatesFront, "Wheel Rate LF");
      normalized.wheelRates[1] = snap(normalized.wheelRates[1], car.wheelRatesFront, "Wheel Rate RF");
    }
    if (car.wheelRatesRear && car.wheelRatesRear.length > 0) {
      normalized.wheelRates[2] = snap(normalized.wheelRates[2], car.wheelRatesRear, "Wheel Rate LR");
      normalized.wheelRates[3] = snap(normalized.wheelRates[3], car.wheelRatesRear, "Wheel Rate RR");
    }

    const plRange = car.preloadRange || [20, 300];
    normalized.preloadDifferential = clamp(normalized.preloadDifferential, plRange[0], plRange[1], "Diff Preload");

    // Anti-roll bars (Translated to 0-based for user displays & manual alignments)
    const arbFRange = car.antirollBarFrontRange 
      ? [car.antirollBarFrontRange[0] - 1, car.antirollBarFrontRange[1] - 1] 
      : [0, 9];
    normalized.arbFront = clamp(normalized.arbFront, arbFRange[0], arbFRange[1], "Front ARB");

    const arbRRange = car.antirollBarRearRange
      ? [car.antirollBarRearRange[0] - 1, car.antirollBarRearRange[1] - 1]
      : [0, 9];
    normalized.arbRear = clamp(normalized.arbRear, arbRRange[0], arbRRange[1], "Rear ARB");

    // Bumpstops
    const bsFRateRange = car.bumpStopFrontRateRange || car.bumpStopRateRange || [300, 2500];
    normalized.bumpstopRates[0] = clamp(normalized.bumpstopRates[0], bsFRateRange[0], bsFRateRange[1], "Bumpstop Rate LF");
    normalized.bumpstopRates[1] = clamp(normalized.bumpstopRates[1], bsFRateRange[0], bsFRateRange[1], "Bumpstop Rate RF");

    const bsRRateRange = car.bumpStopRearRateRange || car.bumpStopRateRange || [300, 2500];
    normalized.bumpstopRates[2] = clamp(normalized.bumpstopRates[2], bsRRateRange[0], bsRRateRange[1], "Bumpstop Rate LR");
    normalized.bumpstopRates[3] = clamp(normalized.bumpstopRates[3], bsRRateRange[0], bsRRateRange[1], "Bumpstop Rate RR");

    const bsFWinRange = car.bumpStopWindowFrontRange || [0, 50];
    normalized.bumpstopRanges[0] = clamp(normalized.bumpstopRanges[0], bsFWinRange[0], bsFWinRange[1], "Bumpstop Range LF");
    normalized.bumpstopRanges[1] = clamp(normalized.bumpstopRanges[1], bsFWinRange[0], bsFWinRange[1], "Bumpstop Range RF");

    const bsRWinRange = car.bumpStopWindowRearRange || [0, 80];
    normalized.bumpstopRanges[2] = clamp(normalized.bumpstopRanges[2], bsRWinRange[0], bsRWinRange[1], "Bumpstop Range LR");
    normalized.bumpstopRanges[3] = clamp(normalized.bumpstopRanges[3], bsRWinRange[0], bsRWinRange[1], "Bumpstop Range RR");

    // 7. Aero
    const rhFRange = car.rideHeightFrontRange || [50, 90];
    normalized.rideHeights[0] = clamp(normalized.rideHeights[0], rhFRange[0], rhFRange[1], "Ride Height Front");

    const rhRRange = car.rideHeightRearRange || [50, 100];
    normalized.rideHeights[1] = clamp(normalized.rideHeights[1], rhRRange[0], rhRRange[1], "Ride Height Rear");

    const rwRange = car.rearWingRange || [0, 15];
    normalized.rearWing = clamp(normalized.rearWing, rwRange[0], rwRange[1], "Rear Wing");

    const splRange = car.splitterRange || [0, 3];
    normalized.splitter = clamp(normalized.splitter, splRange[0], splRange[1], "Splitter");

    const bdRange = car.brakeDuctRange || [0, 6];
    normalized.brakeDucts[0] = clamp(normalized.brakeDucts[0], bdRange[0], bdRange[1], "Brake Duct Front");
    normalized.brakeDucts[1] = clamp(normalized.brakeDucts[1], bdRange[0], bdRange[1], "Brake Duct Rear");

    // 8. Dampers
    const dsRange = car.bumpSlowRange || [0, 40];
    normalized.bumpSlow = normalized.bumpSlow.map((v, i) => clamp(v, dsRange[0], dsRange[1], `Bump Slow ${["LF", "RF", "LR", "RR"][i]}`));

    const rsRange = car.reboundSlowRange || [0, 40];
    normalized.reboundSlow = normalized.reboundSlow.map((v, i) => clamp(v, rsRange[0], rsRange[1], `Rebound Slow ${["LF", "RF", "LR", "RR"][i]}`));

    const bfRange = car.bumpFastRange || [0, 49];
    normalized.bumpFast = normalized.bumpFast.map((v, i) => clamp(v, bfRange[0], bfRange[1], `Bump Fast ${["LF", "RF", "LR", "RR"][i]}`));

    const rfRange = car.reboundFastRange || [0, 49];
    normalized.reboundFast = normalized.reboundFast.map((v, i) => clamp(v, rfRange[0], rfRange[1], `Rebound Fast ${["LF", "RF", "LR", "RR"][i]}`));
  }

  return normalized;
}
