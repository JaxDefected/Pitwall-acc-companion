/**
 * ACC Thermal Behavior Engine v1.9
 * 
 * Accurately models diurnal (time-of-day) track & ambient temperature evolutions
 * and calculates precise tyre pressure compensations for Assetto Corsa Competizione (v1.9+ Pirelli DHF tyre model).
 *
 * Physics Principles:
 * 1. Diurnal Solar Curve: Solar irradiance drives rapid track heating from dawn to midday,
 *    followed by steep radiative cooling at sunset/dusk (~18:00-20:30), transitioning to
 *    an asymptotic equilibrium plateau at night.
 * 2. Time-Slice Integration: Race duration is integrated in discrete time steps (dt = 0.25h / 15m)
 *    to realistically handle races traversing multiple diurnal phases (e.g. afternoon to dusk to night).
 * 3. Thermodynamic Pressure Delta: Tyre air follows ideal gas principles modified by carcass compliance.
 *    In ACC v1.9, hot running pressure changes at ~0.10 PSI per 1.0°C of effective bulk temperature change:
 *    ΔT_eff = 0.65 * ΔT_track + 0.35 * ΔT_ambient.
 * 4. ACC v1.9 Dry Slick Operating Window: Optimal hot pressure is 26.0 - 27.0 PSI (target ~26.6 - 26.8 PSI).
 */

export interface ThermalTransitionInput {
  startTime: string; // "HH:MM", e.g. "17:00"
  durationMinutes: number; // e.g. 45
  startTrackTemp: number; // °C, e.g. 32
  startAmbientTemp: number; // °C, e.g. 24
}

export interface ThermalTransitionResult {
  trackCoolingRate: number; // Effective average °C/h across race
  ambientCoolingRate: number; // Effective average °C/h across race
  coolingType: string;
  trackDrop: number; // Total °C track temperature drop (positive = cooled, negative = warmed)
  ambientDrop: number; // Total °C ambient temperature drop
  finishTrackTemp: number; // Estimated track temperature at chequered flag (°C)
  finishAmbientTemp: number; // Estimated ambient temperature at chequered flag (°C)
  effectiveTempDrop: number; // Weighted bulk temperature change (°C)
  compensationPSI: number; // Recommended starting pressure offset in PSI (positive = increase cold PSI)
  compensationClicks: number; // Integer garage clicks (+ or -)
  trend: "cooling" | "warming" | "stable";
  thermalEffectDescription: string;
}

/**
 * Hourly cooling/warming rates in ACC under clear/typical conditions (°C per hour).
 * Positive value = cooling (temperatures dropping).
 * Negative value = warming (temperatures rising).
 */
function getHourlyRates(hour: number): { trackRate: number; ambientRate: number } {
  const normHour = ((hour % 24) + 24) % 24;

  if (normHour >= 0 && normHour < 5) {
    // Deep night: slow radiative cooling towards nocturnal minimum
    return { trackRate: 0.4, ambientRate: 0.3 };
  } else if (normHour >= 5 && normHour < 7) {
    // Dawn / Sunrise: first sunlight, warming begins
    return { trackRate: -1.0, ambientRate: -0.5 };
  } else if (normHour >= 7 && normHour < 11) {
    // Morning: rapid solar heating of asphalt
    return { trackRate: -2.8, ambientRate: -1.4 };
  } else if (normHour >= 11 && normHour < 14) {
    // Midday peak heat: temperatures near equilibrium maximum
    return { trackRate: -0.5, ambientRate: -0.2 };
  } else if (normHour >= 14 && normHour < 16) {
    // Early afternoon: stable peak, gentle drift downwards
    return { trackRate: 0.5, ambientRate: 0.2 };
  } else if (normHour >= 16 && normHour < 18) {
    // Late afternoon / Golden hour: solar angle drops, surface cooling begins
    return { trackRate: 2.8, ambientRate: 1.0 };
  } else if (normHour >= 18 && normHour < 21) {
    // Sunset & Dusk: direct solar radiation ends, severe surface radiative heat loss
    return { trackRate: 4.6, ambientRate: 1.8 };
  } else {
    // 21:00 - 24:00 (Early night): approaching ambient equilibrium
    return { trackRate: 0.9, ambientRate: 0.5 };
  }
}

/**
 * Calculates transition thermal model using time-step integration.
 */
export function calculateTransitionCoolingModel(input: ThermalTransitionInput): ThermalTransitionResult {
  const { startTime, durationMinutes, startTrackTemp, startAmbientTemp } = input;

  const [hoursStr, minsStr] = (startTime || "17:00").split(":");
  const startHour = (parseInt(hoursStr, 10) || 17) + (parseInt(minsStr, 10) || 0) / 60;
  const durationHrs = Math.max(0.01, (durationMinutes || 45) / 60);

  // Discrete time integration in 15-minute steps (0.25h) for accuracy across diurnal phase boundaries
  const stepHrs = 0.25;
  const steps = Math.max(1, Math.round(durationHrs / stepHrs));
  const dt = durationHrs / steps;

  let totalTrackDrop = 0;
  let totalAmbientDrop = 0;

  for (let i = 0; i < steps; i++) {
    const currentHour = (startHour + i * dt) % 24;
    const { trackRate, ambientRate } = getHourlyRates(currentHour);
    totalTrackDrop += trackRate * dt;
    totalAmbientDrop += ambientRate * dt;
  }

  // Physical bounds: track doesn't drop below ambient - 2°C or rise above ambient + 18°C
  const projectedFinishAmbient = startAmbientTemp - totalAmbientDrop;
  let projectedFinishTrack = startTrackTemp - totalTrackDrop;

  const minTrackFloor = projectedFinishAmbient - 2.0;
  const maxTrackCeiling = projectedFinishAmbient + 18.0;

  if (projectedFinishTrack < minTrackFloor) {
    projectedFinishTrack = minTrackFloor;
    totalTrackDrop = startTrackTemp - projectedFinishTrack;
  } else if (projectedFinishTrack > maxTrackCeiling) {
    projectedFinishTrack = maxTrackCeiling;
    totalTrackDrop = startTrackTemp - projectedFinishTrack;
  }

  const effectiveAvgTrackRate = Math.round((totalTrackDrop / durationHrs) * 10) / 10;
  const effectiveAvgAmbientRate = Math.round((totalAmbientDrop / durationHrs) * 10) / 10;

  // Effective thermal change weighted between track conduction (65%) and ambient convection (35%)
  const effectiveTempDrop = (totalTrackDrop * 0.65) + (totalAmbientDrop * 0.35);

  // ACC v1.9 sensitivity: 0.10 PSI per 1.0°C of bulk temperature change
  const rawCompensation = effectiveTempDrop * 0.10;
  const compensationPSI = Math.round(rawCompensation * 10) / 10;
  const compensationClicks = Math.round(compensationPSI * 10);

  // Determine session thermal classification
  const roundedStartHour = Math.floor(startHour) % 24;
  let coolingType = "Stable Ambient";

  if (totalTrackDrop > 2.5) {
    if (roundedStartHour >= 17 && roundedStartHour < 21) {
      coolingType = "Sunset Dusk Transition (Severe Cooling)";
    } else if (roundedStartHour >= 15 && roundedStartHour < 18) {
      coolingType = "Late Afternoon Golden Hour (High Cooling)";
    } else {
      coolingType = "Rapid Thermal Drop";
    }
  } else if (totalTrackDrop < -2.0) {
    coolingType = "Morning Transition (Warming Up)";
  } else if (roundedStartHour >= 11 && roundedStartHour < 15) {
    coolingType = "Stable Peak Heat";
  } else if (roundedStartHour >= 21 || roundedStartHour < 5) {
    coolingType = "Night Session (Stable / Slow Cooling)";
  } else if (totalTrackDrop > 0.5) {
    coolingType = "Moderate Track Cooling";
  } else if (totalTrackDrop < -0.5) {
    coolingType = "Mild Track Warming";
  }

  const trend: "cooling" | "warming" | "stable" =
    compensationPSI > 0 ? "cooling" : compensationPSI < 0 ? "warming" : "stable";

  const thermalEffectDescription =
    trend === "cooling"
      ? "cold air contraction and tarmac heat loss reduce dynamic tyre inflation"
      : trend === "warming"
      ? "thermal expansion and solar track absorption increase active tyre pressures"
      : "ambient and track conditions remain in dynamic thermal equilibrium";

  return {
    trackCoolingRate: effectiveAvgTrackRate,
    ambientCoolingRate: effectiveAvgAmbientRate,
    coolingType,
    trackDrop: Math.round(totalTrackDrop * 10) / 10,
    ambientDrop: Math.round(totalAmbientDrop * 10) / 10,
    finishTrackTemp: Math.round(projectedFinishTrack * 10) / 10,
    finishAmbientTemp: Math.round(projectedFinishAmbient * 10) / 10,
    effectiveTempDrop: Math.round(effectiveTempDrop * 10) / 10,
    compensationPSI,
    compensationClicks,
    trend,
    thermalEffectDescription,
  };
}

/**
 * Returns accessible styling for tyre pressures in ACC v1.9 (Pirelli DHF dry tyres & wet tyres).
 */
export function getPressureColor(psi: number, isWetCompound: boolean = false): string {
  if (isWetCompound) {
    // Wet tyres in ACC target 29.5 - 30.5 PSI
    if (psi >= 29.5 && psi <= 30.5) return "text-cyan-700 font-extrabold";
    if (psi < 29.5) return "text-blue-700 font-bold";
    return "text-red-700 font-bold";
  }

  // ACC v1.9 Dry Slick Tyres: Optimal hot pressure is 26.0 - 27.0 PSI
  if (psi >= 26.0 && psi <= 27.0) {
    return "text-emerald-700 font-extrabold";
  }
  // Marginal / warning boundary (25.7 - 25.9 or 27.1 - 27.3)
  if ((psi >= 25.7 && psi < 26.0) || (psi > 27.0 && psi <= 27.3)) {
    return "text-amber-700 font-bold";
  }
  // Underinflated / cold tyres
  if (psi < 25.7) {
    return "text-blue-700 font-bold";
  }
  // Overinflated / overheated tyres
  return "text-red-700 font-bold";
}
