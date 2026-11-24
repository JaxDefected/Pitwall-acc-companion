import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AiRaceEngineer from "../components/AiRaceEngineer";
import { useSetups } from "../context/SetupContext";
import SectionErrorBoundary from "../components/SectionErrorBoundary";
import { parseAccSetup } from "../utils/accParser";

export default function EngineerRoute() {
  const [searchParams] = useSearchParams();
  const setupIdParam = searchParams.get("setupId") || searchParams.get("setup");
  const { setupsList, activeSetup, parsedSetupData } = useSetups();

  // Selected setup priority: setup from query param -> active setup from context
  const targetSetup = useMemo(() => {
    if (setupIdParam) {
      const found = setupsList.find((s) => s.id === setupIdParam);
      if (found) return found;
    }
    return activeSetup;
  }, [setupIdParam, setupsList, activeSetup]);

  const targetParsed = useMemo(() => {
    if (!targetSetup) return null;
    return parseAccSetup(targetSetup.rawData, targetSetup.name);
  }, [targetSetup]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 lg:pb-12 font-sans">
      <SectionErrorBoundary
        fallbackTitle="Race Engineer error"
        fallbackMessage="The AI Race Engineer encountered an error. Reset to continue."
      >
        <AiRaceEngineer
          activeSetup={targetSetup}
          parsedSetupData={targetParsed}
        />
      </SectionErrorBoundary>
    </div>
  );
}
