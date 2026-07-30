import { NormalizedAccSetup } from '../utils/accParser';

export const DIAGNOSTIC_CATEGORIES: Record<string, {
  label: string;
  icon: string;
  subcategories: Record<string, {
    label: string;
    hasSpeedVariant: boolean;
  }>;
}> = {
  oversteer: {
    label: "Oversteer",
    icon: "🔄",
    subcategories: {
      braking: { label: "Braking", hasSpeedVariant: true },
      brake_release: { label: "Brake Release", hasSpeedVariant: true },
      coast: { label: "Coast", hasSpeedVariant: true },
      exit: { label: "Exit", hasSpeedVariant: true }
    }
  },
  understeer: {
    label: "Understeer",
    icon: "🎯",
    subcategories: {
      braking: { label: "Braking", hasSpeedVariant: true },
      brake_release: { label: "Brake Release", hasSpeedVariant: true },
      coast: { label: "Coast", hasSpeedVariant: true },
      exit: { label: "Exit", hasSpeedVariant: true }
    }
  },
  tyres: {
    label: "Tyres & Pressures",
    icon: "🏎️",
    subcategories: {
      pressure: { label: "Pressure", hasSpeedVariant: false },
      overheat: { label: "Overheating", hasSpeedVariant: false },
      cold: { label: "Cold", hasSpeedVariant: false }
    }
  },
  braking: {
    label: "Braking & Bias",
    icon: "🛑",
    subcategories: {
      front_lock: { label: "Front Lock", hasSpeedVariant: false },
      rear_lock: { label: "Rear Lock", hasSpeedVariant: false }
    }
  },
  aero_speed: {
    label: "Aero & Top Speed",
    icon: "💨",
    subcategories: {
      low_top_speed: { label: "Low Top Speed", hasSpeedVariant: false }
    }
  },
  stability: {
    label: "Stability & Dampers",
    icon: "⚙️",
    subcategories: {
      bouncing: { label: "Bouncing", hasSpeedVariant: false },
      lift_off_oversteer: { label: "Lift-off Oversteer", hasSpeedVariant: false }
    }
  }
};

interface ResponseData {
  technique: string;
  mechanical: string[];
  note?: string;
}

const RESPONSE_KNOWLEDGE_BASE: Record<string, ResponseData> = {
  "oversteer.braking.high": {
    technique: "Be more gentle with the brake. At high speed cornering with simultaneous braking, do not press the pedal suddenly. Do most of the braking in a straight line — only then hit 100% brake pressure. Releasing brakes too abruptly while turning transfers weight violently to the front and snaps the rear.",
    mechanical: ["Increase brake balance by 0.2–0.4% toward front", "Increase rear wing by 1 click"]
  },
  "oversteer.braking.low": {
    technique: "Be more gentle with the brake. In slow corners, progressive pedal input is essential. Threshold braking while cornering at low speed overloads the rear under deceleration.",
    mechanical: ["Increase ABS by 1", "Increase brake balance by 0.2–0.4% toward front"]
  },
  "oversteer.brake_release.high": {
    technique: "You must release the brake gradually. This applies to any braking situation but consequences are most severe when releasing at high speed while turning. Progressive release is the fix in the majority of cases.",
    mechanical: ["Increase brake balance by 0.2–0.4% toward front", "Increase rear wing by 1 click"]
  },
  "oversteer.brake_release.low": {
    technique: "Release the brake gradually. In slow corners, abrupt release causes weight to shift back to the rear instantly while the car is still turning — snapping the rear outward.",
    mechanical: ["Increase ABS by 1", "Increase brake balance by 0.2–0.4% toward front"]
  },
  "oversteer.coast.high": {
    technique: "If tyre pressures and temperatures are correct, mid-corner high speed oversteer while coasting is rare. Verify your hot pressures are in target window before making setup changes.",
    mechanical: ["Increase rear wing by 1 click", "Decrease rear ride height by 1–2mm"]
  },
  "oversteer.coast.low": {
    technique: "If pressures are correct, this is typically a balance issue. Verify hot tyre pressures before touching setup.",
    mechanical: ["Decrease rear ARB by 1 click", "Increase front ARB by 1 click"]
  },
  "oversteer.exit.high": {
    technique: "Be more gentle with the throttle on high speed exits. The car is set up to handle reasonable inputs — aggressive throttle while the car is still turning will overwhelm rear grip.",
    mechanical: ["Increase rear wing by 1 click", "Increase TC1 by 1"]
  },
  "oversteer.exit.low": {
    technique: "Be more gentle with the throttle on corner exit. Apply throttle only once the car is pointing toward the exit. Progressive throttle application is the primary fix for low speed exit oversteer.",
    mechanical: ["Increase TC1 by 1", "Decrease rear ARB by 1 click"]
  },
  "understeer.braking.high": {
    technique: "You are asking too much from the front tyres. They have a limited grip budget shared between slowing down and turning. Release the brake gradually as you apply steering input — trail braking is the technique here. Do not apply full brake and full steering simultaneously.",
    mechanical: ["Decrease brake balance by 0.2–0.4% toward rear", "Increase rear ride height by 1–2mm"]
  },
  "understeer.braking.low": {
    technique: "You are asking too much from the front tyres. They have a limited grip budget shared between slowing down and turning. Release the brake gradually as you apply steering input — trail braking is the technique here. Do not apply full brake and full steering simultaneously.",
    mechanical: ["Decrease brake balance by 0.2–0.4% toward rear", "Increase rear ride height by 1–2mm"]
  },
  "understeer.brake_release.high": {
    technique: "Trail brake into the corner. The front tyres need load to generate grip for rotation. Releasing the brake entirely before turn-in removes that load. Keep a small amount of brake pressure through the initial turn-in phase.",
    mechanical: ["Decrease brake balance by 0.2–0.4% toward rear", "Increase rear ride height by 1–2mm"]
  },
  "understeer.brake_release.low": {
    technique: "Trail brake into the corner. The front tyres need load to generate grip for rotation. Releasing the brake entirely before turn-in removes that load. Keep a small amount of brake pressure through the initial turn-in phase.",
    mechanical: ["Decrease brake balance by 0.2–0.4% toward rear", "Increase rear ride height by 1–2mm"]
  },
  "understeer.coast.high": {
    technique: "Take the corner a little slower on entry. High speed mid-corner understeer while coasting means the front is at its grip limit — carry less speed in and allow the front to grip up.",
    mechanical: ["Increase rear ride height by 1–2mm", "Decrease rear wing by 1 click"]
  },
  "understeer.coast.low": {
    technique: "Take the corner a little slower. In slow corners, rotation is determined by balance — if you are coasting and pushing, the front ARB is likely too stiff relative to the rear.",
    mechanical: ["Decrease front ARB by 1 click", "Increase rear ARB by 1 click"]
  },
  "understeer.exit.high": {
    technique: "Accelerate a little later off the apex. Applying throttle while the front is still working to rotate the car forces the front to lose grip. Be patient with throttle application.",
    mechanical: ["Decrease TC1 by 1", "Increase rear ride height by 1–2mm"]
  },
  "understeer.exit.low": {
    technique: "Accelerate a little later. In slow corners, aggressive throttle causes the car to push toward the outside of the track — this is often an intended characteristic to protect tyre life on exit.",
    mechanical: ["Decrease TC1 by 1", "Increase rear ARB by 1 click"]
  },
  "tyres.pressure": {
    technique: "Check what ambient temperature your setup was built for. For every 1°C difference between setup temperature and current ambient, adjust cold pressures by ±0.1 PSI (decrease if warmer, increase if colder). Run 1 careful out lap and 2 consistent laps, then check hot pressures at the finish line. Target: 26.5–26.7 PSI normal tracks, 26.7–26.9 PSI fast tracks, 26.9–27.0 PSI high-kerb circuits (Imola, Oulton Park).",
    mechanical: ["If hot pressures are below target: increase cold starting pressure by the delta.", "Check brake duct settings — insufficient cooling affects tyre temperature build-up, especially fronts."],
    note: "Do not change more than one thing at a time. Set pressures first before addressing any handling issue."
  },
  "tyres.overheat": {
    technique: "All over: increase cold starting pressures — overinflated tyres run cooler as less tyre contact patch is working. Check camber: inner edge overheating = reduce negative camber, outer edge overheating = increase negative camber, middle overheating = reduce pressures.",
    mechanical: ["Inner edge hot: reduce negative camber by 0.1°", "Outer edge hot: increase negative camber by 0.1°", "All over: increase tyre pressures by 0.2–0.3 PSI"]
  },
  "tyres.cold": {
    technique: "Reduce cold starting pressures to allow more tyre contact patch. Increase toe value slightly to generate more heat through scrub.",
    mechanical: ["Decrease cold tyre pressure by 0.2–0.3 PSI", "Increase toe value by 0.01°"]
  },
  "braking.front_lock": {
    technique: "Check your braking technique first — are you hitting the brakes too aggressively? If the issue persists with smooth inputs, the brake bias is too far forward for current conditions.",
    mechanical: ["Move brake bias rearward by 0.2% (one click)", "If ambient is cooler than setup baseline, expect front grip to be lower — compensate with further rearward bias adjustment"]
  },
  "braking.rear_lock": {
    technique: "The brake bias is too far rearward, or the rear tyres are colder than expected. Check hot rear tyre pressures before adjusting bias.",
    mechanical: ["Move brake bias forward by 0.2% (one click)"]
  },
  "aero_speed.low_top_speed": {
    technique: "Check whether you are carrying maximum possible speed through the final corner before the straight — corner exit speed compounds significantly on long straights.",
    mechanical: ["Reduce rear wing by 1 click", "Check gear ratios — consider lengthening the top gear for the circuit"]
  },
  "stability.bouncing": {
    technique: "Reduce your speed over the kerb entry. Some kerbs require a different line to avoid the worst of the impact.",
    mechanical: ["Decrease fast bump damper setting by 1", "Decrease fast rebound damper setting by 1"],
    note: "Bump setting should always be lower than the corresponding rebound setting."
  },
  "stability.lift_off_oversteer": {
    technique: "Lift-off oversteer is caused by sudden weight transfer to the front when releasing the throttle while cornering. The fix is to release the throttle more gradually — avoid snapping off the gas mid-corner.",
    mechanical: ["Increase differential coast locking by 1", "Increase preload value by 1"]
  }
};

export function getLocalFallbackResponse(
  categoryKey: string,
  subcategoryKey: string,
  speedVariant: "high" | "low",
  setup: NormalizedAccSetup | null
): string {
  const isSpeedVariant = DIAGNOSTIC_CATEGORIES[categoryKey]?.subcategories[subcategoryKey]?.hasSpeedVariant;
  const lookupKey = isSpeedVariant ? `${categoryKey}.${subcategoryKey}.${speedVariant}` : `${categoryKey}.${subcategoryKey}`;
  
  const responseData = RESPONSE_KNOWLEDGE_BASE[lookupKey];
  
  if (!responseData) {
    return `That is outside my area as your race engineer. I can help with setup adjustments, tyre pressure management, handling diagnosis, or race strategy. What would you like to look at?\n\n*— Local diagnostics mode.*`;
  }
  
  let response = `**Technique first:** ${responseData.technique}\n\n**If technique is already clean — mechanical adjustments:**\n`;
  
  responseData.mechanical.forEach((step, index) => {
    response += `${index + 1}. ${step}\n`;
  });
  
  if (setup) {
    let setupDetails = "";
    if (categoryKey === "tyres") {
      setupDetails = `Tyre Pressures (Cold): FL ${setup.tyrePressures[0]} / FR ${setup.tyrePressures[1]} / RL ${setup.tyrePressures[2]} / RR ${setup.tyrePressures[3]} PSI`;
    } else if (categoryKey === "braking") {
      setupDetails = `Brake Bias: ${setup.brakeBias}%, Brake Power: ${setup.brakePower}%`;
    } else if (categoryKey === "oversteer" || categoryKey === "understeer") {
      setupDetails = `ARB Front: ${setup.arbFront}, ARB Rear: ${setup.arbRear}, Ride Height Front: ${setup.rideHeights[0]}mm, Ride Height Rear: ${setup.rideHeights[1]}mm, Rear Wing: ${setup.rearWing}, TC1: ${setup.tc1}`;
    } else if (categoryKey === "aero_speed") {
      setupDetails = `Rear Wing: ${setup.rearWing}, Ride Height Front: ${setup.rideHeights[0]}mm, Ride Height Rear: ${setup.rideHeights[1]}mm`;
    } else if (categoryKey === "stability") {
      setupDetails = `Fast Bump: [${setup.bumpFast.join(', ')}], Fast Rebound: [${setup.reboundFast.join(', ')}], Preload: ${setup.preloadDifferential}Nm`;
    }
    
    if (setupDetails) {
      response += `\n**Your current setup:** ${setupDetails}\n`;
    }
  }
  
  if (responseData.note) {
    response += `\n> ⚠️ ${responseData.note}\n`;
  }
  
  response += `\n*— Local diagnostics mode. Rule-based from the onboard engineering database.*`;
  
  return response;
}

export function classifyFreeText(message: string): { category: string; subcategory: string; speed: "high" | "low" } | null {
  const lowerMsg = message.toLowerCase();
  
  // 1. Check for bouncing/lift-off/top-speed/tyre-specific first
  const bouncing = ["bouncing", "kerb", "bumpy", "unsettled", "oscillating"];
  if (bouncing.some(kw => lowerMsg.includes(kw))) return { category: "stability", subcategory: "bouncing", speed: "low" };
  
  const lift_off = ["lift off", "lift-off", "lifting"];
  if (lift_off.some(kw => lowerMsg.includes(kw))) return { category: "stability", subcategory: "lift_off_oversteer", speed: "low" };
  
  const top_speed = ["top speed", "straight", "drag", "slow on straight"];
  if (top_speed.some(kw => lowerMsg.includes(kw))) return { category: "aero_speed", subcategory: "low_top_speed", speed: "low" };
  
  const tyre_hot = ["overheating", "too hot", "blister", "melting"];
  if (tyre_hot.some(kw => lowerMsg.includes(kw))) return { category: "tyres", subcategory: "overheat", speed: "low" };
  
  const tyre_cold = ["cold tyre", "not warming", "graining", "no grip cold"];
  if (tyre_cold.some(kw => lowerMsg.includes(kw))) return { category: "tyres", subcategory: "cold", speed: "low" };
  
  const tyre_pressure = ["pressure", "psi", "tyre temp", "graining", "blistering", "cold", "hot"];
  if (tyre_pressure.some(kw => lowerMsg.includes(kw))) return { category: "tyres", subcategory: "pressure", speed: "low" };
  
  const braking_kw = ["locking", "lock", "abs", "brake bias"];
  if (braking_kw.some(kw => lowerMsg.includes(kw))) {
    if (lowerMsg.includes("rear")) return { category: "braking", subcategory: "rear_lock", speed: "low" };
    return { category: "braking", subcategory: "front_lock", speed: "low" };
  }

  // 2. Check for oversteer vs understeer
  const oversteer_kw = ["oversteer", "snapping", "rear end", "loose", "rear stepping"];
  const understeer_kw = ["understeer", "push", "washing", "plowing", "front pushing", "won't rotate"];
  
  let category = "";
  if (oversteer_kw.some(kw => lowerMsg.includes(kw))) category = "oversteer";
  else if (understeer_kw.some(kw => lowerMsg.includes(kw))) category = "understeer";
  else return null;
  
  // 3. Determine phase
  const exit_kw = ["exit", "throttle", "accelerating", "power"];
  const coast_kw = ["coast", "coasting", "mid corner", "mid-corner", "middle"];
  const brake_release_kw = ["releasing", "release", "lift off", "trail"];
  const braking_phase_kw = ["braking", "brake", "turn in"];
  
  let subcategory = "braking"; // default
  if (exit_kw.some(kw => lowerMsg.includes(kw))) subcategory = "exit";
  else if (coast_kw.some(kw => lowerMsg.includes(kw))) subcategory = "coast";
  else if (brake_release_kw.some(kw => lowerMsg.includes(kw))) subcategory = "brake_release";
  else if (braking_phase_kw.some(kw => lowerMsg.includes(kw))) subcategory = "braking";
  
  // 4. Determine speed
  const high_speed_kw = ["high speed", "fast", "fast corner", "high-speed"];
  // low speed is default
  let speed: "high" | "low" = "low";
  if (high_speed_kw.some(kw => lowerMsg.includes(kw))) speed = "high";
  
  return { category, subcategory, speed };
}
