import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "5mb" }));

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

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
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

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
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

  // Serve static files to public
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ACC Server] Server running on http://localhost:${PORT}`);
  });
}

startServer();
