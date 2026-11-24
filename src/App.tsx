import React, { useState, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { MessageSquare, ExternalLink } from "lucide-react";
import { SetupProvider, useSetups } from "./context/SetupContext";
import { useAuth } from "./hooks/useAuth";
import DesktopNav from "./components/navigation/DesktopNav";
import MobileNav from "./components/navigation/MobileNav";
import MoreSheet from "./components/navigation/MoreSheet";
import ToastContainer from "./components/common/ToastContainer";
import OnboardingModal from "./components/OnboardingModal";
import MasterGuideModal from "./components/common/MasterGuideModal";

// Route-level code splitting via React.lazy
const HomePage = lazy(() => import("./pages/HomePage"));
const SeriesPage = lazy(() => import("./pages/SeriesPage"));
const RoundDetailPage = lazy(() => import("./pages/RoundDetailPage"));
const StatsPage = lazy(() => import("./pages/StatsPage"));
const DriverProfilePage = lazy(() => import("./pages/DriverProfilePage"));
const MyProfilePage = lazy(() => import("./pages/MyProfilePage"));
const JaxtunePage = lazy(() => import("./pages/JaxtunePage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const LapTimesRoute = lazy(() => import("./pages/LapTimesRoute"));
const EngineerRoute = lazy(() => import("./pages/EngineerRoute"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

function PageLoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Loading telemetry...
        </span>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, needsOnboarding, logout, saveProfileData } = useAuth();
  const { showToast } = useSetups();

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 flex flex-col antialiased selection:bg-red-500 selection:text-white">
      {/* Desktop Sticky Header Navigation */}
      <DesktopNav />

      {/* Main Page Route Area */}
      <main className="flex-1 w-full max-w-full">
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/series" element={<SeriesPage />} />
            <Route path="/series/round/:roundId" element={<RoundDetailPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/drivers/:driverId" element={<DriverProfilePage />} />
            <Route path="/me" element={<MyProfilePage />} />
            <Route path="/setups" element={<Navigate to="/setups/jaxtune" replace />} />
            <Route path="/setups/jaxtune" element={<JaxtunePage />} />
            <Route path="/setups/jaxtune/:setupId" element={<JaxtunePage />} />
            <Route path="/setups/community" element={<CommunityPage />} />
            <Route path="/setups/community/:setupId" element={<CommunityPage />} />
            <Route path="/lap-times" element={<LapTimesRoute />} />
            <Route path="/engineer" element={<EngineerRoute />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Global Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-6 px-4 sm:px-6 mb-16 lg:mb-0 text-center font-mono text-[10px] text-zinc-500 space-y-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span>PITWALL COMPANION APP V2.0 · POWERED BY JAXTUNE</span>
            <span>·</span>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-zinc-400 hover:text-white cursor-pointer underline"
            >
              ACC Tuning Manual
            </button>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://discord.gg/SX2hjFAZj"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#7983F5] hover:text-[#5865F2] transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Late Night Racing Discord</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
            <span>CRAFTED FOR ACC & LATE NIGHT RACING</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (5 slots: Home, Series, Stats, Setups, More) */}
      <MobileNav onOpenMore={() => setIsMoreOpen(true)} />

      {/* Mobile More Sheet */}
      <MoreSheet
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Master ACC Tuning Guide Modal */}
      <MasterGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Full Screen Onboarding Modal */}
      <OnboardingModal
        isOpen={!!(needsOnboarding && user)}
        user={user}
        onDisconnect={logout}
        onSaveProfile={saveProfileData}
        onSuccess={(cleanUsername) => showToast(`Welcome, @${cleanUsername}`, "success")}
        onError={(msg) => showToast(`Connection failed: ${msg}`, "error")}
      />

      {/* Global Floating Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SetupProvider>
        <AppContent />
      </SetupProvider>
    </BrowserRouter>
  );
}
