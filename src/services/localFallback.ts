import { NormalizedAccSetup } from '../utils/accParser';

export type ScenarioKey =
  | 'tyre_pressure'
  | 'oversteer_braking_high' | 'oversteer_braking_low'
  | 'oversteer_release_high' | 'oversteer_release_low'
  | 'oversteer_coast_high'   | 'oversteer_coast_low'
  | 'oversteer_exit_high'    | 'oversteer_exit_low'
  | 'understeer_braking_high' | 'understeer_braking_low'
  | 'understeer_release_high' | 'understeer_release_low'
  | 'understeer_coast_high'   | 'understeer_coast_low'
  | 'understeer_exit_high'    | 'understeer_exit_low'
  | 'brake_front_lock'
  | 'brake_rear_lock'
  | 'tyre_overheat'
  | 'tyre_cold'
  | 'bouncing_kerbs'
  | 'lift_off_oversteer'
  | 'low_top_speed';

export const ISSUE_TYPES = [
  { value: 'oversteer',      label: 'Oversteer' },
  { value: 'understeer',     label: 'Understeer' },
  { value: 'tyre',           label: 'Tyre / Pressure' },
  { value: 'brakes',         label: 'Braking Issue' },
  { value: 'other',          label: 'Other' },
] as const;

export const CORNER_PHASES = [
  { value: 'braking',  label: 'Under Braking' },
  { value: 'release',  label: 'Brake Release / Turn-in' },
  { value: 'coast',    label: 'Mid-Corner (Coasting)' },
  { value: 'exit',     label: 'Corner Exit (Throttle)' },
] as const;

export const SPEED_TYPES = [
  { value: 'high', label: 'High Speed' },
  { value: 'low',  label: 'Low Speed' },
] as const;

export const TYRE_ISSUES = [
  { value: 'tyre_pressure',    label: 'Pressure Compensation (Temp Change)' },
  { value: 'tyre_overheat',    label: 'Tyres Overheating' },
  { value: 'tyre_cold',        label: 'Tyres Not Warming Up' },
] as const;

export const BRAKE_ISSUES = [
  { value: 'brake_front_lock', label: 'Front Wheels Locking' },
  { value: 'brake_rear_lock',  label: 'Rear Wheels Locking' },
] as const;

export const OTHER_ISSUES = [
  { value: 'bouncing_kerbs',     label: 'Bouncing / Unstable Over Kerbs' },
  { value: 'lift_off_oversteer', label: 'Lift-Off Oversteer' },
  { value: 'low_top_speed',      label: 'Low Top Speed on Straights' },
] as const;

export function resolveScenario(
  issueType: string,
  phase?: string,
  speed?: string
): ScenarioKey {
  if (issueType === 'tyre' || issueType === 'brakes' || issueType === 'other') {
    return phase as ScenarioKey;
  }
  return `${issueType}_${phase}_${speed}` as ScenarioKey;
}

interface FallbackResponse {
  title: string;
  technique: string;
  mechanical: string[];
  note?: string;
  setupFields?: (keyof NormalizedAccSetup)[];
}

const RESPONSES: Record<ScenarioKey, FallbackResponse> = {
  tyre_pressure: {
    title: "Tyre Pressure Compensation",
    technique: "For every 1°C difference between your setup's baseline ambient temperature and the current conditions, adjust cold starting pressures by ±0.1 PSI. Decrease pressures if current ambient is warmer, increase if cooler. Run 1 careful out-lap and 2 consistent laps, then check hot pressures at the finish line of lap 3.",
    mechanical: ["Normal tracks: target 26.5–26.7 PSI hot", "High-speed tracks (Monza, Spa, Paul Ricard): target 26.7–26.9 PSI hot", "High-kerb tracks (Imola, Oulton Park): target 26.9–27.0 PSI hot", "If any tyre is outside the target window, adjust that corner's cold starting pressure by the exact delta required"],
    note: "Set correct tyre pressures before addressing any handling issue. Everything else changes with incorrect pressures.",
    setupFields: ['tyrePressures']
  },
  oversteer_braking_high: {
    title: "High Speed Oversteer — Under Braking",
    technique: "Apply the brake more progressively. At high speed while cornering and braking simultaneously, avoid sudden pedal inputs. Complete most of your braking in a straight line before initiating the turn — only then can you apply threshold braking. Abrupt brake inputs at high speed with steering angle will snap the rear.",
    mechanical: ["Increase brake balance by 0.2–0.4% toward front (one click)", "Increase rear wing by 1 click"],
    setupFields: ['brakeBias', 'rearWing']
  },
  oversteer_braking_low: {
    title: "Low Speed Oversteer — Under Braking",
    technique: "Apply the brake more gently in slow corners. Progressive pedal inputs are essential — threshold braking while turning at low speed overloads the rear under deceleration and causes it to step out.",
    mechanical: ["Increase ABS by 1 click", "Increase brake balance by 0.2–0.4% toward front (one click)"],
    setupFields: ['abs', 'brakeBias']
  },
  oversteer_release_high: {
    title: "High Speed Oversteer — Brake Release",
    technique: "Release the brake gradually through the corner. This applies to every braking situation, but consequences are most severe at high speed with steering angle applied. An abrupt brake release while turning transfers weight to the front instantly and snaps the rear outward.",
    mechanical: ["Increase brake balance by 0.2–0.4% toward front (one click)", "Increase rear wing by 1 click"],
    setupFields: ['brakeBias', 'rearWing']
  },
  oversteer_release_low: {
    title: "Low Speed Oversteer — Brake Release",
    technique: "Release the brake gradually in slow corners. Snapping off the brake while turning at low speed removes the weight over the front tyres and allows the rear to pivot out. Progressive release is the primary fix.",
    mechanical: ["Increase ABS by 1 click", "Increase brake balance by 0.2–0.4% toward front (one click)"],
    setupFields: ['abs', 'brakeBias']
  },
  oversteer_coast_high: {
    title: "High Speed Oversteer — Mid-Corner Coasting",
    technique: "If tyre pressures and temperatures are confirmed correct, mid-corner high-speed oversteer while coasting is uncommon with a balanced setup. Verify hot pressures are in the target window before making any mechanical changes.",
    mechanical: ["Increase rear wing by 1 click", "Decrease rear ride height by 1–2mm"],
    setupFields: ['rearWing', 'rideHeights']
  },
  oversteer_coast_low: {
    title: "Low Speed Oversteer — Mid-Corner Coasting",
    technique: "Verify tyre pressures are correct first. If pressures are confirmed, low speed mid-corner oversteer while coasting is typically a front/rear ARB balance issue — the rear is too stiff relative to the front.",
    mechanical: ["Decrease rear ARB by 1 click", "Increase front ARB by 1 click"],
    setupFields: ['arbFront', 'arbRear']
  },
  oversteer_exit_high: {
    title: "High Speed Oversteer — Corner Exit",
    technique: "Apply throttle more progressively out of high-speed corners. The car handles reasonable throttle inputs, but aggressive application while the car is still turning will overwhelm rear grip regardless of setup.",
    mechanical: ["Increase rear wing by 1 click", "Increase TC1 by 1"],
    setupFields: ['rearWing', 'tc1']
  },
  oversteer_exit_low: {
    title: "Low Speed Oversteer — Corner Exit",
    technique: "Apply throttle only once the car is pointing toward the exit. Feeding throttle while the car is still rotating mid-corner causes the rear to step out at low speed. Progressive throttle from the apex, not before it.",
    mechanical: ["Increase TC1 by 1", "Decrease rear ARB by 1 click"],
    setupFields: ['tc1', 'arbRear']
  },
  understeer_braking_high: {
    title: "High Speed Understeer — Under Braking",
    technique: "Release the brake gradually as you apply steering input. The front tyres have a limited grip budget shared between braking and cornering — you cannot demand both simultaneously at high speed. Trail-braking technique is the solution: a progressive release of brake pressure as steering angle increases.",
    mechanical: ["Decrease brake balance by 0.2–0.4% toward rear (one click)", "Increase rear ride height by 1–2mm"],
    setupFields: ['brakeBias', 'rideHeights']
  },
  understeer_braking_low: {
    title: "Low Speed Understeer — Under Braking",
    technique: "You are demanding too much from the front tyres simultaneously. Reduce brake pressure earlier in the braking zone before initiating the turn. Trail-braking into slow corners is effective — maintain a small amount of brake through the initial turn-in.",
    mechanical: ["Decrease brake balance by 0.2–0.4% toward rear (one click)", "Decrease front bumpstop rate by 1–2 clicks and increase front bumpstop range by 1–2 clicks"],
    setupFields: ['brakeBias', 'bumpstopRates', 'bumpstopRanges']
  },
  understeer_release_high: {
    title: "High Speed Understeer — Brake Release",
    technique: "Trail brake into the corner. The front tyres need brake load to generate rotation. Releasing the brake entirely before turn-in removes this load and the front loses its ability to rotate the car. Maintain light brake pressure through the initial turn-in phase.",
    mechanical: ["Decrease brake balance by 0.2–0.4% toward rear", "Increase rear ride height by 1–2mm"],
    setupFields: ['brakeBias', 'rideHeights']
  },
  understeer_release_low: {
    title: "Low Speed Understeer — Brake Release",
    technique: "Trail brake. In slow corners, the same principle applies — carry a small amount of brake pressure through turn-in to maintain front grip and rotation. Releasing completely before the apex causes the front to run wide.",
    mechanical: ["Decrease brake balance by 0.2–0.4% toward rear", "Increase rear ride height by 1–2mm"],
    setupFields: ['brakeBias', 'rideHeights']
  },
  understeer_coast_high: {
    title: "High Speed Understeer — Mid-Corner Coasting",
    technique: "Carry slightly less entry speed. High-speed mid-corner understeer while coasting means the front is at its lateral grip limit — reduce entry speed to allow the front to generate rotation.",
    mechanical: ["Increase rear ride height by 1–2mm", "Decrease rear wing by 1 click"],
    setupFields: ['rideHeights', 'rearWing']
  },
  understeer_coast_low: {
    title: "Low Speed Understeer — Mid-Corner Coasting",
    technique: "Carry slightly less entry speed into the corner. If speed is already conservative, the balance needs adjustment — front ARB is likely too stiff relative to the rear, resisting rotation in the mid-corner phase.",
    mechanical: ["Decrease front ARB by 1 click", "Increase rear ARB by 1 click"],
    setupFields: ['arbFront', 'arbRear']
  },
  understeer_exit_high: {
    title: "High Speed Understeer — Corner Exit",
    technique: "Apply throttle slightly later. Feeding throttle while the front is still working to rotate the car forces it to prioritise traction over cornering — the front washes wide. Wait until the car is pointing toward the exit before committing to throttle.",
    mechanical: ["Decrease TC1 by 1", "Increase rear ride height by 1–2mm"],
    setupFields: ['tc1', 'rideHeights']
  },
  understeer_exit_low: {
    title: "Low Speed Understeer — Corner Exit",
    technique: "Apply throttle later. In slow corners, pushing with the front under throttle is often intentional — cars are set up to protect rear tyres on exit. If the push is excessive, the technique adjustment of a later throttle point is the first fix.",
    mechanical: ["Decrease TC1 by 1", "Increase rear ARB by 1 click"],
    setupFields: ['tc1', 'arbRear']
  },
  brake_front_lock: {
    title: "Front Wheels Locking Under Braking",
    technique: "Check your braking technique first — are you hitting the brakes too aggressively? Progressive pedal input prevents the fronts from exceeding their grip limit. If technique is clean, the brake bias is too far forward for current conditions.",
    mechanical: ["Move brake bias rearward by 0.2% (one click)", "If ambient temperature is cooler than your setup baseline, front tyre grip will be lower — compensate with a further 0.2% rearward click"],
    note: "Front tyres should lock just before the rears for optimal braking performance.",
    setupFields: ['brakeBias', 'brakePower']
  },
  brake_rear_lock: {
    title: "Rear Wheels Locking Under Braking",
    technique: "The brake bias is too far rearward, or rear tyre temperatures are lower than expected. Check hot rear tyre pressures before adjusting bias — cold rears lock earlier than warm ones.",
    mechanical: ["Move brake bias forward by 0.2% (one click)"],
    setupFields: ['brakeBias']
  },
  tyre_overheat: {
    title: "Tyres Overheating",
    technique: "Identify which part of the tyre is hot. Inner edge overheating means too much negative camber. Outer edge overheating means insufficient negative camber. Overheating across the full tyre means pressures are too low — the full contact patch is generating too much heat.",
    mechanical: ["Inner edge overheating: reduce negative camber by 0.1°", "Outer edge overheating: increase negative camber by 0.1°", "All over / middle overheating: increase tyre pressures by 0.2–0.3 PSI"],
    setupFields: ['tyrePressures', 'cambers']
  },
  tyre_cold: {
    title: "Tyres Not Warming Up",
    technique: "More aggressive out-lap driving style will generate heat faster. Weaving on the out-lap, heavy braking and acceleration, and loading the tyres through medium-speed corners all contribute to faster warm-up.",
    mechanical: ["Decrease cold tyre pressure by 0.2–0.3 PSI to increase contact patch size", "Increase toe value slightly (by 0.01°) to generate heat through scrub"],
    setupFields: ['tyrePressures', 'toes']
  },
  bouncing_kerbs: {
    title: "Bouncing / Unstable Over Kerbs",
    technique: "Adjust your line to use the kerb less aggressively. Some kerbs in ACC will launch the car if taken at the wrong angle or too fast — a slightly tighter line avoiding the peak of the kerb is often faster.",
    mechanical: ["Decrease fast bump damper by 1 click", "Decrease fast rebound damper by 1 click"],
    note: "Bump setting should always be lower than the corresponding rebound setting. Try the lowest setting that avoids oscillation.",
    setupFields: ['bumpFast', 'reboundFast']
  },
  lift_off_oversteer: {
    title: "Lift-Off Oversteer",
    technique: "Release the throttle progressively — do not snap off the gas mid-corner. Sudden throttle lift while cornering transfers weight to the front rapidly, unloading the rear and causing rotation. Gradual release gives the suspension time to manage the weight transfer.",
    mechanical: ["Increase differential coast locking by 1 click", "Increase differential preload by 1 step"],
    setupFields: ['preloadDifferential']
  },
  low_top_speed: {
    title: "Low Top Speed on Straights",
    technique: "Check whether you are maximising exit speed from the final corner before the straight — speed at the corner exit compounds significantly over the length of a long straight. A 5 km/h improvement at exit is worth more than any aero change.",
    mechanical: ["Reduce rear wing by 1 click", "Consider lengthening the final gear ratio for the circuit"],
    note: "Ride height generates downforce through rake — keep ride height as low as possible without grounding the car or stalling the aero.",
    setupFields: ['rearWing', 'rideHeights']
  }
};

export function getLocalResponse(
  scenario: ScenarioKey,
  setup: NormalizedAccSetup | null
): { title: string; technique: string; mechanical: string[]; note?: string; setupSummary: string } {
  const response = RESPONSES[scenario];

  let setupSummary = "";
  if (setup && response.setupFields?.length) {
    const parts: string[] = [];
    if (response.setupFields.includes('tyrePressures')) {
      parts.push(`Cold pressures: FL ${setup.tyrePressures[0]} | FR ${setup.tyrePressures[1]} | RL ${setup.tyrePressures[2]} | RR ${setup.tyrePressures[3]} PSI`);
    }
    if (response.setupFields.includes('brakeBias') || response.setupFields.includes('brakePower')) {
      parts.push(`Brake bias: ${setup.brakeBias}% | Brake power: ${setup.brakePower}%`);
    }
    if (response.setupFields.includes('arbFront') || response.setupFields.includes('arbRear')) {
      parts.push(`ARB Front: ${setup.arbFront} | ARB Rear: ${setup.arbRear}`);
    }
    if (response.setupFields.includes('rideHeights')) {
      parts.push(`Ride height: F ${setup.rideHeights[0]}mm | R ${setup.rideHeights[1]}mm`);
    }
    if (response.setupFields.includes('rearWing')) {
      parts.push(`Rear wing: ${setup.rearWing}`);
    }
    if (response.setupFields.includes('tc1')) {
      parts.push(`TC1: ${setup.tc1} | TC2: ${setup.tc2}`);
    }
    if (response.setupFields.includes('abs')) {
      parts.push(`ABS: ${setup.abs}`);
    }
    if (response.setupFields.includes('cambers')) {
      parts.push(`Camber: FL ${setup.cambers[0]}° | FR ${setup.cambers[1]}° | RL ${setup.cambers[2]}° | RR ${setup.cambers[3]}°`);
    }
    if (response.setupFields.includes('bumpFast') || response.setupFields.includes('reboundFast')) {
      parts.push(`Fast bump: FL ${setup.bumpFast[0]} | FR ${setup.bumpFast[1]} | Fast rebound: RL ${setup.reboundFast[2]} | RR ${setup.reboundFast[3]}`);
    }
    if (response.setupFields.includes('preloadDifferential')) {
      parts.push(`Diff preload: ${setup.preloadDifferential} Nm`);
    }
    if (response.setupFields.includes('toes')) {
      parts.push(`Toe: FL ${setup.toes[0]}° | FR ${setup.toes[1]}° | RL ${setup.toes[2]}° | RR ${setup.toes[3]}°`);
    }
    if (response.setupFields.includes('bumpstopRates') || response.setupFields.includes('bumpstopRanges')) {
      parts.push(`Bumpstop rates: [${setup.bumpstopRates.join(', ')}] | Bumpstop ranges: [${setup.bumpstopRanges.join(', ')}]`);
    }
    setupSummary = parts.join(' · ');
  }

  return {
    title: response.title,
    technique: response.technique,
    mechanical: response.mechanical,
    note: response.note,
    setupSummary,
  };
}
