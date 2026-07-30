import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { buildSystemInstruction } from "../src/services/chatService.js";

dotenv.config();

// Default Professional ACC Setup Troubleshooting Workbook
const DEFAULT_ACC_GUIDE = `
# ASSETTO CORSA COMPETIZIONE (ACC) MASTER TROUBLESHOOTING GUIDE

## SECTION 1: TYRES & TEMPERATURES
- Optimal dry slick hot tyre pressures (performance target on track): 26.0 PSI - 27.0 PSI (Aim for 26.8 PSI Hot). NEVER target a cold starting pressure of ~26.8 PSI! Cold starting pressures are dialed in typical ranges of 23.0 PSI - 24.5 PSI depending on air/track temps.
- Optimal wet hot tyre pressures: 29.5 PSI - 30.5 PSI (Aim for 30.0 PSI Hot).
- Tyre temperatures: Optimal range is 70°C to 90°C. Lower temperatures cause under-grip; higher temperatures cause rapid wear and sliding.
- Camber: Higher negative camber increases lateral cornering grip but increases tire inner temperature/wear. Max out camber for qualifying; slightly back off for endurance.
- Toe: Front Toe-Out (negative values) improves turn-in response but reduces straight-line stability. Rear Toe-In (positive values) improves rear stability during traction.

## SECTION 2: ELECTRONICS
- Traction Control (TC1): Level of engine torque cuts when slip is detected. Higher TC = safer traction but slower acceleration. Lower TC = more slip, higher risk of exit oversteer, but faster throttle limits.
- Traction Control 2 (TC2 / Cut level): Controls how severely the power is cut once TC1 triggers. High TC2 cuts power suddenly; lower TC2 allows smoother slides.
- ABS: Anti-lock Braking System. Higher ABS = prevents locking inside wheels but increases stopping distance on bumps. Lower ABS = shorter braking but high risk of lockups (especially under trailed braking).
- ECU Map: Engine maps. Map 1 is usually maximum performance with highest fuel consumption. Subsequent maps are wet maps or fuel-saving pace maps (varies slightly by car).

## SECTION 3: CORNER STAGES TROUBLESHOOTING

### CORNER ENTRY (Off-Throttle / Braking / Turn-In)
- PROBLEM: Understeer (Car won't turn in)
  - Move Brake Bias backward (more rearward, e.g., 54% -> 52%).
  - Soften front anti-roll bar (ARB) or stiffen rear ARB.
  - Soften front wheel rate (springs).
  - Lower the front ride height (increases rake/front downforce) or raise rear ride height.
  - Decrease differential preload (allows the wheels to rotate more independently during turn-in).
  - Increase front brake duct opening (makes brakes run cooler, less heat transferring to tyres).
- PROBLEM: Oversteer (Rear snaps or slides on entry)
  - Move Brake Bias forward (more frontward, e.g., 54% -> 56%).
  - Stiffen front ARB or soften rear ARB.
  - Stiffen front wheel rate.
  - Lower rear ride height or increase rear wing angle (increases rear aero stability).
  - Increase differential preload (locks the axles on off-throttle deceleration, stabilizing the car).

### MID-CORNER (Apex / Maintenance Throttle)
- PROBLEM: Understeer
  - Soften front ARB or stiffen rear.
  - Weaken front wheel rates or stiffen rear wheel rates.
  - Increase aero rake (lower front / raise rear).
- PROBLEM: Oversteer
  - Soften rear ARB or stiffen front.
  - Soften rear wheel rates or stiffen front.
  - Decrease rear ride height or increase rear wing angle.

### CORNER EXIT (On-Throttle / Acceleration)
- PROBLEM: Understeer (Pushing wide when applying power)
  - Stiffen rear ARB or Rear Wheel Rate.
  - Lower rear ride height? No, lower front ride height or increase front bumpstop range/stiffness.
  - Weaken front anti-roll bar or front wheel rates.
  - Increase engine traction control slightly to prevent rear tyre slip which can occasionally push the nose out (or decrease TC if rear slides too much causing a power cut understeer).
- PROBLEM: Oversteer (Rear spins or slides when applying power)
  - Decrease Rear ARB or Rear Wheel Rate (softer rear allows outer tyre to dig in and give more traction).
  - Reduce Differential Preload (makes power delivery smoother, preventing snap oversteer on snap locking).
  - Lower rear ride height (shifts static and dynamic weight lower, increasing rear grip).
  - Increase Rear Wing angle (for high-speed corner exits).
  - Increase Traction Control (TC1).
  - Soften rear rebound dampers to let the rear settle quicker, or soften rear bumpstop rates.

## SECTION 4: SUSPENSION & DAMPERS
- Wheel Rates (Springs): Stiffer front = sharper steering but less mechanical grip and bumpy slide. Softer rear = more traction on exit.
- Anti-Roll Bars (ARB): Front ARB governs quick transient response. Stiff Front = direct entry but steady state understeer. Stiff Rear = oversteer prone but quick direction change.
- Bumpstops: High bumpstop rate = car hits a solid wall when bottoming. Increase bumpstop range to allow more suspension travel before hitting the high bumpstop rate.

## SECTION 5: INTEGRATED SIM RACING EXPERT TUNING RULES & DRIVING MANEUVERS

### TYRE PRESSURE COMPENSATION (CRITICAL CONCEPTS):
- ACC is highly dependent on tyre pressure simulation! Keep tyres in the 26.0 - 27.0 PSI and 75°C - 95°C window during racing.
- Setups are usually designed for standard conditions: 21°C - 23°C Ambient / 28°C - 30°C Track temperature.
- Temperature and pressure are linked: Hotter weather/track = more inflated tyres.
- You must drive 1 careful outlap and 2 fast, consistent laps to reach final running pressures/temperatures. Check pressures at the finish line of lap 3!
- **Compensation Formula**: Compensate tyre pressure by the *opposite of the temperature difference*. If current ambient temperatures are 2°C *higher* than what the setup was originally built for, you must *decrease* the initial cold pressure by 0.2 PSI for all 4 tyres. Conversely, if it is 2°C *cooler*, you must *increase* cold pressure by 0.2 PSI.
- **Track-Specific Target Pressures on Lap 3 (HOT Target, NOT Cold Start!)**:
  - Normal Tracks: Aim for 26.5 - 26.7 PSI HOT.
  - Fast High-Speed Tracks: Aim for 26.7 - 26.9 PSI HOT.
  - Tracks with Nasty/Violent Curbs (e.g., Imola, Oulton Park): Aim for 26.9 - 27.0 PSI HOT.
- **Cold Starting Pressures vs. Optimal Hot Pressures Distinction**:
  - *Cold Starting Pressures*: These are the sliders/fields the driver physically modifies in their setups menu before driving (typically between ~23.0 - 24.5 PSI depending on air/track temperature).
  - *Optimal Hot Pressures*: The target running pressures on-track after 3 laps (strictly 26.6 - 26.9 PSI for GT3).
  - *Delta Calculation Protocol*: NEVER advise setting the cold starting pressure directly to 26.8 PSI! Instead, calculate target delta: (Delta = Hot Target PSI - Actual Hot PSI on lap 3), and tell the driver to add or subtract that delta directly to their setup menu's cold starting pressure. For example: "Your FL actual hot pressure is 26.1 PSI, which is 0.6 PSI below the 26.7 PSI optimal target. To fix this, open your setup menu and add exactly +0.6 PSI to your FL Cold starting pressure."
- Adjust the initial/cold pressure on the setup screen using this delta to bring lap 3 final hot pressures into these targeted bands.

### SIMPLIFIED HANDLING TWEAKS & PRIORITY PRECEDENCE:
*Important: Always set correct tyre pressures and temperatures before changing any other settings! Drive technique is always the first line of defense; setup modifications are the secondary line if handling is strictly over the driver's current skill level. When adjusting setup, follow the order listing below sequentially (try item 1, if issue persists then move to item 2, and so on).*

#### OVERSTEER SOLUTIONS BY PHASE:
1. **High Speed - When Applying the Brake**:
   - *Driving technique first*: Be more gentle with the brake. If you are high-speed cornering and braking simultaneously, do not stomp the pedal suddenly; apply much less than max pressure. If track allows, do most braking in a straight line (where you can hit 100% abruptly), then trail off.
   - *Setup tweak sequence*:
     1. Increase Brake Balance by 0.2% - 0.4%
     2. Increase Rear Wing by 1 click
     3. Decrease Rear Ride Height by 1-2 mm
     4. Increase Front Wheel Rate (Springs) by 1 step
     5. Increase Front Bumpstop Rate by 1-2 steps & decrease Front Bumpstop Range by 1-2 steps
2. **Low Speed - When Applying the Brake**:
   - *Driving technique first*: Be more gentle with the brake.
   - *Setup tweak sequence*:
     1. Increase ABS by 1 click
     2. Increase Brake Balance by 0.2% - 0.4%
     3. Decrease Rear Ride Height by 1-2 mm
     4. Increase Front Bumpstop Rate by 1-2 steps & decrease Front Bumpstop Range by 1-2 steps
     5. Increase Front Wheel Rate (Springs) by 1 step
3. **High Speed - When Releasing the Brake**:
   - *Driving technique first*: You must release the brake gradually (trail braking)! Failing to do so during high-speed turning shifts weight too fast to the rear, causing corner entry oversteer.
   - *Setup tweak sequence*:
     1. Increase Brake Balance by 0.2% - 0.4%
     2. Increase Rear Wing by 1 click
     3. Decrease Rear Ride Height by 1-2 mm
4. **Low Speed - When Releasing the Brake**:
   - *Driving technique first*: Release the brake gradually (trail brake!).
   - *Setup tweak sequence*:
     1. Increase ABS by 1 click
     2. Increase Brake Balance by 0.2% - 0.4%
5. **High Speed - While Coasting Mid-Corner**:
   - *Driving technique first*: If tyre pressures/temps are correct, mid-corner coasting stability should be stable.
   - *Setup tweak sequence*:
     1. Increase Rear Wing by 1 click
     2. Decrease Rear Ride Height by 1-2 mm
6. **Low Speed - While Coasting Mid-Corner**:
   - *Driving technique first*: If tyre pressures/temps are correct, mid-corner coasting stability should be stable.
   - *Setup tweak sequence*:
     1. Decrease Rear Anti-Roll Bar (ARB) by 1 click
     2. Increase Front Anti-Roll Bar (ARB) by 1 click
     3. Decrease Rear Ride Height by 1-2 mm
7. **High Speed - While Accelerating From the Corner**:
   - *Driving technique first*: Be more gentle with the throttle. (Setups are optimized for aggressive inputs, but some tracks demand throttle compromise.)
   - *Setup tweak sequence*:
     1. Increase Rear Wing by 1 click
     2. Decrease Rear Ride Height by 1-2 mm
     3. Increase Traction Control (TC1) by 1 click
     4. Decrease Rear Bumpstop Rate by 1-2 steps & Increase Rear Bumpstop Range by 1-2 steps
8. **Low Speed - While Accelerating From the Corner**:
   - *Driving technique first*: Be more gentle with the throttle! Everything has its traction limits.
   - *Setup tweak sequence*:
     1. Increase Traction Control (TC1) by 1 click
     2. Decrease Rear Anti-Roll Bar (ARB) by 1 click
     3. Increase Front Anti-Roll Bar (ARB) by 1 click

#### UNDERSTEER SOLUTIONS BY PHASE:
1. **High Speed - When Applying the Brake**:
   - *Driving technique first*: You are asking too much from the car. It has finite grip. Use it to slow down in a straight line, and release brakes gradually as steering input increases.
   - *Setup tweak sequence*:
     1. Decrease Brake Balance by 0.2% - 0.4%
     2. Increase Rear Ride Height by 1-2 mm
     3. Decrease Front Bumpstop Rate by 1-2 steps & Increase Front Bumpstop Range by 1-2 steps
2. **Low Speed - When Applying the Brake**:
   - *Driving technique first*: You are asking too much from the car.
   - *Setup tweak sequence*:
     1. Decrease Brake Balance by 0.2% - 0.4%
     2. Increase Rear Ride Height by 1-2 mm
     3. Decrease Front Bumpstop Rate by 1-2 steps & Increase Front Bumpstop Range by 1-2 steps
3. **High Speed - When Releasing the Brake**:
   - *Driving technique first*: Trail brake! Or you are simply asking too much speed from the car.
   - *Setup tweak sequence*:
     1. Decrease Brake Balance by 0.2% - 0.4%
     2. Increase Rear Ride Height by 1-2 mm
     3. Decrease Front Bumpstop Rate by 1-2 steps & Increase Front Bumpstop Range by 1-2 steps
4. **Low Speed - When Releasing the Brake**:
   - *Driving technique first*: Trail brake!!!! Or you are asking too much of the front contact patch.
   - *Setup tweak sequence*:
     1. Decrease Brake Balance by 0.2% - 0.4%
     2. Increase Rear Ride Height by 1-2 mm
     3. Decrease Front Bumpstop Rate by 1-2 steps & Increase Front Bumpstop Range by 1-2 steps
5. **High Speed - While Coasting Mid-Corner**:
   - *Driving technique first*: Take the corner a bit slower.
   - *Setup tweak sequence*:
     1. Increase Rear Ride Height by 1-2 mm
     2. Increase Rear Bumpstop Rate by 1-2 steps & Decrease Rear Bumpstop Range by 1-2 steps
     3. Decrease Front Bumpstop Rate by 1 step & Increase Front Bumpstop Range by 1 step
     4. Decrease Rear Wing by 1 click
6. **Low Speed - While Coasting Mid-Corner**:
   - *Driving technique first*: Take the corner a bit slower.
   - *Setup tweak sequence*:
     1. Decrease Front Anti-Roll Bar (ARB) by 1 click
     2. Increase Rear Anti-Roll Bar (ARB) by 1 click
     3. Increase Rear Bumpstop Rate by 1-2 steps & Decrease Rear Bumpstop Range by 1-2 steps
     4. Decrease Front Bumpstop Rate by 1 step & Increase Front Bumpstop Range by 1 step
     5. Increase Rear Ride Height by 1-2 mm
7. **High Speed - While Accelerating From the Corner**:
   - *Driving technique first*: Accelerate a bit later.
   - *Setup tweak sequence*:
     1. Decrease Traction Control (TC1) by 1 click
     2. Increase Rear Ride Height by 1-2 mm
     3. Increase Rear Bumpstop Rate by 1-2 steps & Decrease Rear Bumpstop Range by 1-2 steps
     4. Decrease Rear Wing by 1 click
8. **Low Speed - While Accelerating From the Corner**:
   - *Driving technique first*: Accelerate a bit later (corner exit oversteer is typically managed slightly to preserve tire longevity).
   - *Setup tweak sequence*:
     1. Decrease Traction Control (TC1) by 1 click
     2. Increase Rear Anti-Roll Bar (ARB) by 1 click
     3. Decrease Front Anti-Roll Bar (ARB) by 1 click
`.trim();

const app = express();

app.use((req, res, next) => {
  const forwardedUrl = req.headers["x-forwarded-url"] || req.headers["x-vercel-forwarded-path"];
  if (forwardedUrl && typeof forwardedUrl === "string") {
    try {
      if (forwardedUrl.startsWith("http://") || forwardedUrl.startsWith("https://")) {
        const parsed = new URL(forwardedUrl);
        req.url = parsed.pathname + parsed.search;
      } else {
        req.url = forwardedUrl;
      }
    } catch {
      req.url = forwardedUrl;
    }
  }
  next();
});

app.use((req, res, next) => {
  if (req.body && typeof req.body === "object") {
    next();
  } else {
    express.json({ limit: "5mb" })(req, res, next);
  }
});

  const PORT = 3000;

  // Initialize Gemini Client
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // ─── Offline Fallback Response Engine ───
  // When the AI API is unavailable (429/503), match user queries against known
  // ACC setup categories and return pre-built expert responses.
  const FALLBACK_RESPONSES: Record<string, { keywords: string[]; response: string }> = {
    tyre_pressure: {
      keywords: ["pressure", "psi", "overheating", "graining", "blistering", "cold pressure", "hot pressure", "tyre temp"],
      response: `🏁 **Offline Engineer — Tyre Pressure Guide**

**Target Hot Pressures:**
- **Dry:** 26.0–27.0 PSI (aim for 26.8 PSI hot)
- **Wet:** 29.5–30.5 PSI (aim for 30.0 PSI hot)

**Cold Starting Pressures** typically range 23.0–24.5 PSI depending on ambient/track temps.

**Adjustment Rules:**
- If hot pressures are **below target**, increase cold starting pressure by the difference.
- For every **+3°C ambient rise**, expect roughly +0.4–0.5 PSI additional hot pressure — reduce cold starting pressures accordingly.
- Always check pressures after **one full flying lap**, not the out lap.

⚠️ *This is a cached offline response. The AI Race Engineer will provide personalised analysis when available.*`
    },
    oversteer_exit: {
      keywords: ["exit oversteer", "rear stepping out", "spinning on throttle", "throttle oversteer", "loose on exit", "oversteer on exit", "power oversteer"],
      response: `🏁 **Offline Engineer — Exit Oversteer**

**Diagnosis:** The rear axle is losing grip under throttle application on corner exit.

**Step-by-step fix (in order):**
1. **Check your throttle technique** — are you applying power before the car has fully rotated? This is the #1 cause.
2. **Increase TC1 by 1 click** as a diagnostic step.
3. **Stiffen Rear ARB by 1 click** to reduce rear roll on exit.
4. **Soften Front ARB by 1 click** if the issue persists.
5. As a last resort, **increase rear bumpstop range by 1mm**.

**Rule:** Never adjust more than two mechanical parameters per session — isolate each change before adding the next.

⚠️ *This is a cached offline response. The AI Race Engineer will provide personalised analysis when available.*`
    },
    oversteer_entry: {
      keywords: ["entry oversteer", "turn in oversteer", "snapping on entry", "trail-brake oversteer", "rotating too much on entry", "snap oversteer"],
      response: `🏁 **Offline Engineer — Entry Oversteer**

**Diagnosis:** The rear is stepping out under braking / trail-braking on corner entry.

**Step-by-step fix:**
1. **Check brake release technique** — are you releasing brakes too aggressively mid-corner? A sharp release unloads the rear suddenly.
2. **Smooth, progressive brake release** through the entry phase should reduce this significantly.
3. **Increase rear bumpstop rate by 1 click** to add stability under braking load.
4. **Soften front ARB by 1 click** to reduce weight transfer speed to the front axle.
5. **Move brake bias forward by 0.2%** to reduce rear braking force.

⚠️ *This is a cached offline response. The AI Race Engineer will provide personalised analysis when available.*`
    },
    understeer_entry: {
      keywords: ["understeer on entry", "pushing on turn in", "front won't rotate", "front end pushing", "turn in understeer", "won't turn in"],
      response: `🏁 **Offline Engineer — Entry Understeer**

**Diagnosis:** The front axle lacks grip on initial turn-in.

**Step-by-step fix:**
1. **Check entry speed** — carrying too much speed into the corner compresses the front suspension.
2. **Increase front ARB stiffness by 1 click** to sharpen initial turn-in response.
3. **Reduce front ride height by 1mm** to increase front mechanical grip.
4. **Move brake bias slightly forward (0.2%)** to load the front axle more under braking.
5. **Increase front bumpstop range** if the car bottoms out on entry.

⚠️ *This is a cached offline response. The AI Race Engineer will provide personalised analysis when available.*`
    },
    understeer_mid: {
      keywords: ["mid corner understeer", "pushing through the middle", "washing out", "push through the middle", "mid-corner push", "understeer mid"],
      response: `🏁 **Offline Engineer — Mid-Corner Understeer**

**Diagnosis:** Front axle losing grip while coasting through the middle of the corner.

**Step-by-step fix:**
1. **Soften rear ARB by 1 click** to shift lateral weight toward the front axle mid-corner.
2. **Reduce front ride height by 1mm** to increase front downforce and mechanical grip.
3. **Increase front camber by 0.1°** to improve mid-corner contact patch.
4. Check that your **coasting technique** isn't unloading the front — maintain slight trailing throttle if needed.

⚠️ *This is a cached offline response. The AI Race Engineer will provide personalised analysis when available.*`
    },
    brake_bias: {
      keywords: ["locking front", "locking rear", "brake balance", "bias", "abs triggering", "brake lock", "braking stability"],
      response: `🏁 **Offline Engineer — Brake Bias & Locking**

**Front locking:** Move brake bias rearward by 0.2% per adjustment. Check front brake duct cooling — insufficient cooling causes brake fade which also triggers front lock.

**Rear locking:** Move brake bias forward by 0.2%. Check rear brake duct — too much rear cooling can cause cold rear brakes and reduced rear braking grip.

**ABS triggering aggressively:** This is a symptom, not the cause. Adjust bias first, then consider increasing ABS by 1 step if lock-ups persist.

**Temperature note:** In cooler conditions, front tyre grip drops — the same bias setting will lock fronts earlier than expected.

⚠️ *This is a cached offline response. The AI Race Engineer will provide personalised analysis when available.*`
    },
    dampers: {
      keywords: ["bump slow", "rebound", "damper", "bouncing", "kerb", "unsettled", "bump", "damping"],
      response: `🏁 **Offline Engineer — Damper Setup**

**Bouncing / unsettled over bumps:**
- **Increase bump slow by 1 click** on the affected axle to resist compression speed.
- **Reduce rebound by 1 click** to allow the suspension to recover faster.

**Car feels too stiff over kerbs:**
- **Reduce bump fast by 1 click** to allow the suspension to absorb high-speed impacts.
- Consider increasing **bumpstop range** to prevent bottoming out.

**General rule:** Bump controls compression (car going down), Rebound controls extension (car coming back up). Adjust in small increments and isolate front/rear changes.

⚠️ *This is a cached offline response. The AI Race Engineer will provide personalised analysis when available.*`
    },
    strategy: {
      keywords: ["pit window", "fuel", "stint", "stop", "safety car", "mandatory", "pit strategy", "fuel load"],
      response: `🏁 **Offline Engineer — Race Strategy**

**Fuel calculation:** ACC uses approximately 2.5–3.5 L/lap depending on the car and circuit. Always add 1–2 extra laps of fuel as a safety margin.

**Pit window:** For a 60-minute sprint race, the mandatory pit stop window typically opens around lap 8–10 and closes 10 minutes before the end. Pitting early under a Safety Car is almost always optimal.

**Tyre life:** Most GT3 cars on dry slicks can sustain competitive pace for 30–40 minutes before significant degradation. Monitor tyre temps and pressure trends across your stint.

⚠️ *This is a cached offline response. The AI Race Engineer will provide personalised analysis when available.*`
    },
    tyre_degradation: {
      keywords: ["dropping off", "degradation", "falling away", "tyre life", "rear left", "front left", "wear", "tyre wear"],
      response: `🏁 **Offline Engineer — Tyre Degradation**

**Symptoms:** Lap times falling off after 10–15 laps, sliding increases, grip feels inconsistent.

**Common causes & fixes:**
1. **Excessive camber** — too much negative camber overheats the inner edge. Reduce by 0.1° and monitor.
2. **High tyre pressures** — overinflated tyres reduce contact patch and increase core temps. Lower cold starting pressure by 0.3 PSI.
3. **Aggressive driving style** — excessive sliding heats the surface without building core temp. Focus on smooth inputs.
4. **Toe settings** — excessive toe (in or out) scrubs the tyres laterally. Reduce toward neutral if degradation is severe.

⚠️ *This is a cached offline response. The AI Race Engineer will provide personalised analysis when available.*`
    }
  };

  function getFallbackResponse(userMessage: string): string | null {
    const messageLower = userMessage.toLowerCase();
    let bestMatch: { category: string; score: number } | null = null;

    for (const [category, data] of Object.entries(FALLBACK_RESPONSES)) {
      let score = 0;
      for (const keyword of data.keywords) {
        if (messageLower.includes(keyword.toLowerCase())) {
          score += keyword.split(" ").length; // Multi-word keywords score higher
        }
      }
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { category, score };
      }
    }

    if (bestMatch) {
      return FALLBACK_RESPONSES[bestMatch.category].response;
    }

    // Generic fallback when no category matches
    return `🏁 **Offline Engineer — General Advice**

The AI Race Engineer is temporarily unavailable due to high demand. Here are some general ACC setup principles:

**Quick Setup Checklist:**
- **Tyre Pressures:** Target 26.8 PSI hot (dry). Start cold at 23.5–24.5 PSI depending on ambient temps.
- **Brake Bias:** Start at the car's default, adjust ±0.2% per step based on locking behaviour.
- **ARBs:** Stiffen the end you want MORE grip from (counter-intuitive — stiffer ARB = less roll = more grip on that axle).
- **Ride Height:** Lower = more downforce but risk bottoming out. Raise if you hear scraping.

**Golden Rule:** Change ONE parameter at a time, do 2–3 laps, then evaluate. Never stack multiple changes.

⚠️ *The AI Race Engineer will provide personalised, context-aware analysis when service resumes. Please try again in a moment.*`;
  }

  // ─── Resilient AI invocation helpers with fallback models and retry backoff ───
  const MODELS_TO_TRY = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-pro"];

  async function generateContentWithFallback(ai: GoogleGenAI, params: {
    contents: any;
    config: any;
  }) {
    let lastError: any = null;
    for (const modelName of MODELS_TO_TRY) {
      let retries = 3;
      while (retries > 0) {
        try {
          return await ai.models.generateContent({
            model: modelName,
            contents: params.contents,
            config: params.config,
          });
        } catch (error: any) {
          lastError = error;
          if (error.status === 404) {
            break; // Model not found, skip to next model immediately
          }
          if (error.status === 503 || error.status === 429) {
            retries--;
            const backoff = 1500 * Math.pow(2, 2 - retries); // 1.5s, 3s, 6s
            console.warn(`Model ${modelName} returned ${error.status}, retrying in ${backoff}ms (${retries} left)`);
            await new Promise((resolve) => setTimeout(resolve, backoff));
            continue;
          }
          break; // Try next model for other errors
        }
      }
    }
    throw lastError || new Error("All fallback models are currently unavailable.");
  }

  async function generateContentStreamWithFallback(ai: GoogleGenAI, params: {
    contents: any;
    config: any;
  }) {
    let lastError: any = null;
    for (const modelName of MODELS_TO_TRY) {
      let retries = 3;
      while (retries > 0) {
        try {
          return await ai.models.generateContentStream({
            model: modelName,
            contents: params.contents,
            config: params.config,
          });
        } catch (error: any) {
          lastError = error;
          if (error.status === 404) {
            break; // Model not found, skip to next model immediately
          }
          if (error.status === 503 || error.status === 429) {
            retries--;
            const backoff = 1500 * Math.pow(2, 2 - retries); // 1.5s, 3s, 6s
            console.warn(`Model ${modelName} returned ${error.status}, retrying in ${backoff}ms (${retries} left)`);
            await new Promise((resolve) => setTimeout(resolve, backoff));
            continue;
          }
          break; // Try next model for other errors
        }
      }
    }
    throw lastError || new Error("All fallback models are currently unavailable.");
  }

  // AI Setup Assistant Chat Handler
  app.post("/api/chat", async (req, res) => {
    try {
      const { 
        message, 
        setupData, 
        customGuideContent, 
        chatHistory,
        userProfile,
        garageSetups,
        isCustomTuned 
      } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API Key is missing. Please add it to Secrets in the Settings menu.",
        });
      }

      // Merge standard guide with custom driver workbook
      let combinedGuide = DEFAULT_ACC_GUIDE;
      if (customGuideContent) {
        combinedGuide += "\n\n## DRIVER'S CUSTOM UPLOADED SCENARIO MANUAL (OVERRIDE RULES):\n" + customGuideContent;
      }

      // Add context about currently selected setup if provided
      let setupContext = "No specific setup is selected or loaded.";
      if (setupData) {
        setupContext = `Currently Loaded Setup File Context:\n${JSON.stringify(setupData, null, 2)}`;
      }

      // Build driver context info
      let driverContext = "";
      if (userProfile && userProfile.username) {
        driverContext += `\n### 👤 ACTIVE DRIVER PROFILE:\n`;
        driverContext += `- Username: @${userProfile.username}\n`;
        if (userProfile.pinnedSeriesCars && userProfile.pinnedSeriesCars.length > 0) {
          driverContext += `- Pinned or Favorite ACC Cars: ${userProfile.pinnedSeriesCars.join(", ")}\n`;
        }
        if (garageSetups && Array.isArray(garageSetups) && garageSetups.length > 0) {
          driverContext += `- Saved Custom Variants in Driver's personal "MY GARAGE" Workspace:\n`;
          garageSetups.forEach((g: any, i: number) => {
            driverContext += `  * Variant ${i + 1}: Car "${g.car}" at circuit "${g.track}" - Version Note & Driver Feedback: "${g.versionNote || "No notes specified"}"\n`;
          });
          driverContext += `\n*PROACTIVE PERSONALIZATION PROTOCOL*:\nSince this user is logged in as @${userProfile.username} and has active setup variants saved in their "MY GARAGE", you MUST check and cross-reference these past handling notes or preferred cars in your conversation context whenever relevant (e.g. "I see that under your @${userProfile.username} profile you prefer a stable rear setup on front-engine cars like the Vantage, so let's try dropping your rear roll bar by 1 click here as well..."). Mention they are logged in as @${userProfile.username} and reference past parameters to customize your feedback if applicable.\n`;
        } else {
          driverContext += `- Saved Garage Variants: None yet. Encourage them to save customized variants to their "MY GARAGE" workspace panel.\n`;
        }
      } else {
        driverContext += `\n### 👤 ACTIVE DRIVER PROFILE:\n- Guest Mode (Anonymous Driver without synced driver profile data).\n`;
      }

      if (isCustomTuned) {
        driverContext += `\n### 🔧 ACTIVE TUNING HUD SANDBOX STATUS:\n- The driver is currently tweaking parameter settings in the live tuning sandbox. The current setup context represents their actively modified and edited values. Help them fine-tune their custom variant details.\n`;
      }

      const systemInstruction = `
You are an elite, professional Race Engineer and Setup Specialist for Assetto Corsa Competizione (ACC).
Your goal is to diagnose driver handling issues, explain the vehicle dynamics physics, and recommend exact, practical setup changes using the provided reference manuals.

CRITICAL PROTOCOLS:
1. Always base your suggestions on the reference manuals provided below. Keep your tips factual to Assetto Corsa Competizione (ACC).
2. **Prioritize Sim Racing Expert Rules (Section 5)**: When diagnosing handling or tyre pressure issues, heavily prioritize the advice and sequential setup tweaks listed in **Section 5: INTEGRATED SIM RACING EXPERT TUNING RULES & DRIVING MANEUVERS**.
3. For tyre pressure concerns, explain the 1 outlap + 2 consistent fast laps rule, and strictly distinguish between "Cold Starting Pressures" (setup menu values, typically 23.0 - 24.5 PSI) and "Optimal Hot Pressures" (on-track target, strictly 26.6 - 26.9 PSI). NEVER instruct players to set their cold starting pressures directly to 26.8 PSI. Instead, detail how to calculate the delta (Hot Target - Actual Hot) and apply that exact delta value to their setup menu's cold starting/initial pressure sliders.
4. For handling issues (Understeer/Oversteer during braking, releasing brake, coasting, or accelerating), recommend both the **driving technique advice** and the **sequential setup adjustments** in the exact listed priority order (e.g. state what to try 1st, then 2nd, etc.).
5. Clearly explain for each recommended adjustment:
   - What to change (e.g., "Increase Brake Balance by 0.2% - 0.4% as your first step").
   - The physical reason WHY it solves the issue.
   - What secondary trade-offs the driver might experience.
6. Speak like a professional, direct, and supportive race engineer. Avoid dry academic essays. Keep your explanations concise, punchy, and highly actionable.
7. **REQUIRED RESPONSE FORMATTING - ALWAYS USE THIS EXACT STRUCTURE**:

   ### 🚦 TL;DR QUICK ACTION PLAN
   *Give a very brief, punchy summary up front so the driver can scan it instantly.*
   - **Change This**: [Specify the primary setup adjustment, e.g., "Increase ABS by 1 click"]
   - **Then Change That**: [Specify the next sequential action if the issue persists, or write "None needed initially"]
   - **⚠️ Watch Out For**: [The main secondary trade-off or side-effect to monitor]

   ---

   ### 🔍 DIAGNOSIS
   - **What's Happening**: [Briefly identify the handling issue or pressure discrepancy, the specific corner phase, and the physics cause in plain terms]

   ### 🏁 DRIVING TECHNIQUE ADVICE
   - [Explain what the driver should do differently with their brake/throttle/steering inputs first, as described in Section 5]

   ### ⚙️ ACTIONABLE SEQUENTIAL ADJUSTMENTS
   *List the adjustments in the exact ordered priority sequence from the expert rules as numbered/bullet points:*
   1. **[Tweak 1]** - *Why*: [Physical reason why it solves the issue]
   2. **[Tweak 2]** - *Why*: [Physical reason why it solves the issue]
   3. **[Tweak 3]** - *Why*: [Physical reason why it solves the issue]

   ### 📊 TRADE-OFFS & PITFALLS
   - [What secondary side-effects or vehicle behaviors to monitor when making these changes]

   ---
   
   *At the very end of your message, you MUST include a friendly prompt asking if more details are needed, strictly matching this theme:*
   *“Would you like more details on the vehicle physics, or a full telemetry breakdown for this setup segment?”*

Here is the authoritative setup engineering guide to ground your logic:
${combinedGuide}

${driverContext}

Here is the client's currently selected custom setup dashboard state:
${setupContext}
      `.trim();

      // Format clean prompts for Gemini Chat
      const contentsParts = [];
      
      // Inject history if exists
      if (chatHistory && Array.isArray(chatHistory)) {
        for (const turn of chatHistory) {
          contentsParts.push({
            role: turn.role === "user" ? "user" : "model",
            parts: [{ text: turn.content }]
          });
        }
      }

      // Append active prompt
      contentsParts.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await generateContentWithFallback(ai, {
        contents: contentsParts,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || "No response received from the engineer.";
      res.json({ reply });
    } catch (err: any) {
      console.error("AI Engineer Error:", err);
      res.status(500).json({ error: err.message || "An unexpected error occurred during engineering diagnosis." });
    }
  });

  // AI Setup Assistant Streaming Chat Handler
  app.post("/api/chat/stream", async (req, res) => {
    let latestMessage = "";
    try {
      const { messages, activeSetup, driverProfile } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "No messages provided" });
      }

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API Key is missing. Please add it to Secrets in the Settings menu.",
        });
      }

      // Truncate history to last 10 turns to prevent unbounded growth
      const MAX_TURNS = 10;
      const history = messages.slice(-MAX_TURNS);
      latestMessage = history[history.length - 1]?.content || "";

      const systemInstruction = buildSystemInstruction(latestMessage, activeSetup, driverProfile);

      const contentsParts = history.map((m: any) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      // Stream response via Server-Sent Events
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      const responseStream = await generateContentStreamWithFallback(ai, {
        contents: contentsParts,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3,
        },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error: any) {
      console.error("Chat stream error:", error);

      // ─── Fallback: stream a pre-built offline response instead of an error ───
      const fallbackText = getFallbackResponse(latestMessage);
      if (fallbackText && !res.headersSent) {
        console.warn("AI unavailable — serving offline fallback response");
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");

        // Stream the fallback in small chunks to simulate real-time typing
        const words = fallbackText.split(" ");
        const chunkSize = 5;
        for (let i = 0; i < words.length; i += chunkSize) {
          const chunk = words.slice(i, i + chunkSize).join(" ") + " ";
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        }
        res.write("data: [DONE]\n\n");
        res.end();
      } else if (!res.headersSent) {
        res.status(500).json({ error: "Engineer unavailable. Please try again." });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
        res.end();
      }
    }
  });

  // AI Dedicated Race Engineer Adjustment Route
  app.post("/api/engineer-adjust", async (req, res) => {
    try {
      const { carName, trackName, issueLabel, customDescription, activeSetup } = req.body;

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API Key is missing. Please add it to Secrets in the Settings menu.",
        });
      }

      let setupSnippet = "";
      if (activeSetup) {
        setupSnippet = `
Here are the current values of the active setup:
- Tyres: FL/FR/RL/RR Pressures = ${JSON.stringify(activeSetup.tyrePressures || [])} PSI
- Electronics: TC1=${activeSetup.tc1 || "N/A"}, TC2=${activeSetup.tc2 || "N/A"}, ABS=${activeSetup.abs || "N/A"}, ECU Map=${activeSetup.ecuMap || "N/A"}
- Mechanical Grip: Front ARB=${activeSetup.arbFront || "N/A"}, Rear ARB=${activeSetup.arbRear || "N/A"}, Differential Preload=${activeSetup.preloadDifferential || "N/A"} Nm, Brake Bias=${activeSetup.brakeBias || "N/A"}%
- Aerodynamics: Front Ride Height=${activeSetup.rideHeights?.[0] || "N/A"} mm, Rear Ride Height=${activeSetup.rideHeights?.[1] || "N/A"} mm, Rear Wing=${activeSetup.rearWing || "N/A"}
- Dampers: Bump Slow=${JSON.stringify(activeSetup.bumpSlow || [])}, Rebound Slow=${JSON.stringify(activeSetup.reboundSlow || [])}
`;
      }

      const systemInstruction = `
You are an expert Virtual Race Engineer for Assetto Corsa Competizione (ACC).
You must analyze the driver's handling feedback for a given car and track, cross-reference their active setup parameters (if provided), and output a precise, professional mechanical adjustment plan.

Ensure your advice is grounded in Assetto Corsa Competizione (ACC) physics, mechanical realities, and realistic priorities:
- Anti-roll bars (ARB)
- Bump/Rebound damper settings
- Ride height / Aero Rake adjustments
- Rear Wing angles and Brake Bias

The advice MUST explicitly state whether to increase or decrease a setting (e.g., "Soften front ARB by 1 click or stiffen rear springs", "Move Brake Bias forward by 0.4%").

Always structure your response using markdown with the following clean, professional sections:

### 🎯 PITBOARD SUMMARY
*Give a high-impact, brief summary of what's wrong and what needs immediate change.*

### 🛠️ MECHANICAL ADJUSTMENTS
*Provide exact, click-by-click recommendations for setup tweaks.*
*Include specific settings (e.g. ARB, Dampers, Rake, Wing, Brake Bias) and clearly state what to increase or decrease.*

### 🏎️ DRIVING TECHNIQUE
*Provide driving-style advice to help compensate before/during setup modifications.*

### ⚠️ TRADE-OFFS & METRICS
*Detail the side effects or secondary behaviors to watch out for.*

Include the following mandatory reminder at the very end of your response:
"Always adjust in small increments (1-2 clicks) and test for 3 laps."
`;

      const prompt = `
Car: ${carName || "Any GT3"}
Track: ${trackName || "Any Track"}
Primary Issue: ${issueLabel || "Custom feedback"}
Driver Feedback Notes: ${customDescription || "No additional comments"}
${setupSnippet}

Engineer, please analyze this data and give me your setup adjustments.
`;

      const response = await generateContentWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || "No response received from the race engineer.";
      res.json({ reply });
    } catch (err: any) {
      console.error("AI Race Engineer Adjustment Error:", err);
      res.status(500).json({ error: err.message || "An unexpected error occurred during diagnosis." });
    }
  });

export default app;
