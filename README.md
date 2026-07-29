# PitWall - ACC Setup Lab

**An advanced, AI-powered companion application for Assetto Corsa Competizione (ACC).**
</div>

## Description

PitWall is a comprehensive sim-racing telemetry and setup management tool designed specifically for Assetto Corsa Competizione (ACC). It acts as your virtual pitwall, providing deep insights into your car setups, dynamic fuel and strategy calculators, a centralized team registry, and an AI Race Engineer powered by Google's Gemini AI to help diagnose and resolve handling issues.

## 🚀 Key Features

*   **Setup Telemetry Analyzer:** Inspect ACC `.json` setup files in detail. Visualize tyre pressures, electronics (TC, ABS, Engine Maps), mechanical grip (Springs, ARBs, Dampers), and aerodynamics.
*   **Interactive Race Strategy Planner:** Calculate required fuel loads, pit stop strategies, and thermal transitions for day/night and endurance racing.
*   **AI Race Engineer (Powered by Gemini):** Chat with a specialized AI engineer. Describe your handling issues (e.g., "understeer on corner exit"), and it will analyze your currently loaded setup and prescribe precise adjustments.
*   **Community Sync (GitHub Integration):** Automatically sync and download proven setups directly from leading community and league GitHub repositories.
*   **Team Garage & Workspace:** Upload, manage, and share your setups in a centralized Firebase database. Track versions and custom tuning variations.
*   **Lap Times Database:** Access a comprehensive reference of realistic lap times across all ACC tracks and car classes.

## 🛠️ Tech Stack

*   **Frontend:** React (v19), Vite, Tailwind CSS, Lucide React, Motion (Framer)
*   **Backend / Cloud:** Firebase (Firestore DB, Authentication)
*   **AI Integration:** Google GenAI SDK (`@google/genai`), Express server for secure API routing
*   **Language:** TypeScript

## 📖 Usage Instructions

*   **Uploading Setups:** In the Telemetry view, drag and drop ACC `.json` setup files into the upload zone on the left panel, or use the "Browse Files" button.
*   **Inspecting Telemetry:** Once loaded, click on a setup in the "Team Workspace" list to view its precise parameters across Tyres, Electronics, Fuel, Mechanical, Aero, and Dampers.
*   **Consulting the AI:** Switch to the "AI Race Engineer" tab at the bottom. The AI will analyze the active setup loaded in your HUD. Chat with the engineer to receive setup adjustment advice.
*   **Strategy Planning:** Navigate to the "Fuel" tab within a loaded setup to use the interactive calculators for fuel consumption and pitstop timelines.
*   **Syncing from GitHub:** Use the "GITHUB CLOUD SYNC" tab in the registry panel to pull setups directly from community repos.

## 📜 License

[MIT License](LICENSE)
