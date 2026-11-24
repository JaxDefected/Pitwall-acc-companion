import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { BookOpen, X, RefreshCw } from "lucide-react";
import { dbFetchGuide } from "../../firebase";

interface MasterGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_GUIDE = `
# ASSETTO CORSA COMPETIZIONE (ACC) MASTER TROUBLESHOOTING GUIDE

## SECTION 1: TYRES & TEMPERATURES
- **Optimal dry slick hot tyre pressures**: **26.0 PSI - 27.0 PSI** (Aim for 26.8 PSI Hot). NEVER target a cold starting pressure of ~26.8 PSI! Cold starting pressures are dialed in typical ranges of 23.0 PSI - 24.5 PSI depending on air/track temps.
- **Optimal wet hot tyre pressures**: **29.5 PSI - 30.5 PSI** (Aim for 30.0 PSI Hot).
- **Tyre temperatures**: Optimal range is 70°C to 90°C. Lower temperatures cause under-grip; higher temperatures cause rapid wear and sliding.
- **Camber**: Higher negative camber increases lateral cornering grip but increases inner tyre wear and temperature. Max out for qualifying; back off slightly for endurance stints.
- **Toe**: Front Toe-Out (negative) sharpens turn-in; Rear Toe-In (positive) stabilizes corner exit under power.

## SECTION 2: HANDLING & BALANCE SOLUTIONS

### Corner Entry Understeer (Car won't turn in under braking)
1. Move Brake Bias backward (e.g. 54% -> 52%).
2. Soften Front Anti-Roll Bar (ARB) or stiffen Rear ARB.
3. Lower Front Ride Height or raise Rear Ride Height (increases aero rake).
4. Decrease Differential Preload (allows wheels to rotate independently off-throttle).

### Corner Entry Oversteer (Rear snaps under braking)
1. Move Brake Bias forward (e.g. 54% -> 56%).
2. Stiffen Front ARB or soften Rear ARB.
3. Increase Rear Wing or lower Rear Ride Height.
4. Increase Differential Preload (locks axles on off-throttle deceleration).

### Mid-Corner Understeer (Car pushes wide at apex)
1. Soften Front ARB or stiffen Rear ARB.
2. Soften Front Springs / Wheel Rates.
3. Increase Aero Rake (lower front / raise rear).

### Corner Exit Oversteer (Rear slides or spins on throttle)
1. Soften Rear ARB or Rear Wheel Rates (lets outer tyre dig in for traction).
2. Reduce Differential Preload (smoother power delivery).
3. Increase Rear Wing angle.
4. Increase Traction Control (TC1).
5. Soften Rear Rebound Dampers.
`;

export default function MasterGuideModal({ isOpen, onClose }: MasterGuideModalProps) {
  const [guideText, setGuideText] = useState(DEFAULT_GUIDE);

  useEffect(() => {
    if (isOpen) {
      dbFetchGuide()
        .then((text) => {
          if (text) setGuideText(text);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl z-10 max-h-[85vh] overflow-y-auto space-y-4 animate-fade-in text-left font-sans">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
                Master ACC Engineering & Troubleshooting Guide
              </h3>
              <p className="text-[10px] text-zinc-400">
                Official sim racing chassis dynamics manual
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-md bg-zinc-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="prose prose-invert prose-xs max-w-none font-sans text-zinc-300 leading-relaxed space-y-4">
          <ReactMarkdown>{guideText}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
