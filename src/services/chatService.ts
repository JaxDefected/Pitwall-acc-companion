import dataset from '../data/dataset.json';
import { NormalizedAccSetup } from '../utils/accParser';

interface DriverProfile {
  name?: string;
  preferredStyle?: string;
  currentCar?: string;
  currentTrack?: string;
}

const ENGINEER_PERSONA = `
You are a professional GT3 race engineer with 10 years of endurance racing experience.

Your communication style is:
- Direct and specific: always give exact values, not ranges (say "add 1.7 PSI", not "add some pressure")
- Priority-ordered: always suggest driving technique adjustments before mechanical changes
- Conservative: never suggest more than two mechanical changes per response
- Contextual: always reference the active setup values in your diagnosis

When diagnosing handling issues, always follow this sequence:
1. Identify the corner phase (entry, mid, exit)
2. Identify the balance symptom (oversteer/understeer/both)
3. Check driving technique first
4. If mechanical, start with the least invasive change
5. Confirm what the driver should feel after making the change

If no active setup is loaded, state this clearly and ask the driver to load one.
`.trim();

function classifyMessage(message: string): string[] {
  const msgLower = message.toLowerCase();
  const matched: string[] = [];
  for (const [category, data] of Object.entries(dataset.categories)) {
    const keywords = (data as any).trigger_keywords as string[];
    if (keywords.some(kw => msgLower.includes(kw.toLowerCase()))) {
      matched.push(category);
    }
  }
  return matched;
}

function buildFewShotExamples(categories: string[], setup: NormalizedAccSetup | null): string {
  const examples: string[] = [];
  const brakeBiasStr = setup ? `${setup.brakeBias}` : 'N/A';
  for (const cat of categories) {
    const catData = (dataset.categories as any)[cat];
    if (!catData?.examples?.length) continue;
    for (const ex of catData.examples) {
      let modelText = ex.model;
      if (modelText.includes('[brake_bias]')) {
        modelText = modelText.replace(/\[brake_bias\]/g, brakeBiasStr);
      }
      examples.push(`User: ${ex.user}\nEngineer: ${modelText}`);
    }
  }
  if (!examples.length) return '';
  return `\n\nExample interactions for reference:\n\n${examples.join('\n\n')}`;
}

function formatActiveSetup(setup: NormalizedAccSetup | null): string {
  if (!setup) return '\n\nNo setup currently loaded. Ask the driver to load a setup file.';
  return `
Active Setup Context:
Car: ${setup.carName} | Track: ${setup.trackName}
Tyre Pressures (cold): FL ${setup.tyrePressures[0]} | FR ${setup.tyrePressures[1]} | RL ${setup.tyrePressures[2]} | RR ${setup.tyrePressures[3]} PSI
Fuel: ${setup.fuel}L
Brake Bias: ${setup.brakeBias}% | Brake Power: ${setup.brakePower}%
ARB Front: ${setup.arbFront} | ARB Rear: ${setup.arbRear}
Ride Height: Front ${setup.rideHeights[0]}mm | Rear ${setup.rideHeights[1]}mm
Rear Wing: ${setup.rearWing} | Steer Ratio: ${setup.steerRatio}:1
TC1: ${setup.tc1} | TC2: ${setup.tc2} | ABS: ${setup.abs}
`.trim();
}

export function buildSystemInstruction(
  latestMessage: string,
  setup: NormalizedAccSetup | null,
  profile?: DriverProfile
): string {
  const categories = classifyMessage(latestMessage);
  const fewShot = buildFewShotExamples(categories, setup);
  const setupContext = formatActiveSetup(setup);
  const driverContext = profile?.preferredStyle
    ? `\nDriver Style Note: ${profile.preferredStyle}`
    : '';

  return `${ENGINEER_PERSONA}${driverContext}\n\n${setupContext}${fewShot}`;
}
