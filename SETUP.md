# Pitwall & LNR League Sync Setup Guide

This guide details how to configure and operate the automated **Google Sheets → Firestore** synchronization pipeline for the **Late Night Racing (LNR) ACC Series Companion**.

---

## 1. Architecture Overview

```
Google Sheets (LNR ACC Data)
   │
   ├── Option A: Public CSV / GViz Export (zero credentials, resilient fallback)
   └── Option B: Google Service Account (REST API v4, authorized access)
          │
          ▼
   API Worker (/api/sync-league)
          │
          ├── Parse & Canonicalize (Tracks, Cars, Round Status, UTC ISO Times)
          ├── Compute SHA-256 Content Hash (Idempotent updates)
          │
          ▼
   Firebase Firestore
          ├── series/lnr-acc-s18
          ├── series/lnr-acc-s18/rounds/r{01..10}
          └── home/lnr-acc-s18 (Precomputed 1-read snapshot for Home screen)
```

---

## 2. Google Sheets Configuration

Target Workbook ID: `1s9m3yWd-zBLKf4An5rAJ7sxHy9ouU4y8OZjnN9pXoEs`

### Required Tabs & Schemas

#### A. Calendar Tab (`Calendar` or `Schedule`)
| Column Header | Accepted Aliases | Description / Format |
|---|---|---|
| `Series ID` | `series`, `season` | e.g. `lnr-acc-s18` |
| `Round` | `rd`, `round_number`, `r#` | Integer (e.g. `1`, `5`) |
| `Track` | `circuit`, `venue`, `track_key` | Full name or key (e.g. `Kyalami`, `mount_panorama`) |
| `Car` | `vehicle`, `class`, `car_key` | Car name or class (e.g. `Ginetta G55 GT4`, `all_gt3`) |
| `Date` / `Race Time` | `race_at`, `start_time` | ISO 8601 or readable date string |
| `Practice` | `practice_at` | Optional practice start time |
| `Qualifying` | `qualifying_at` | Optional qualifying start time |
| `Race 2` | `race2_at` | Optional secondary race session |
| `Status` | `state` | `upcoming`, `live`, or `completed` |
| `Notes` | `briefing`, `rules` | Pit stop rules, weather forecast, tire mandates |

---

## 3. Google Service Account Setup (Option B)

If using Google Service Account for private workbook access:

1. **Create Service Account in Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Navigate to **IAM & Admin** > **Service Accounts**.
   - Click **Create Service Account**, name it `pitwall-sync-runner`.
   - Grant role: `Viewer` or leave minimal.
   - Click into the created account, go to **Keys** tab, click **Add Key** > **Create new key** (JSON).
   - Download the key JSON file.

2. **Share the Google Sheet:**
   - Open your Google Sheet (`1s9m3yWd-zBLKf4An5rAJ7sxHy9ouU4y8OZjnN9pXoEs`).
   - Click **Share** (top right).
   - Add the service account email (e.g. `pitwall-sync-runner@project.iam.gserviceaccount.com`) as **Viewer**.

3. **Configure Environment Variables:**
   Add to your `.env` (or Vercel Environment Variables):
   ```bash
   # Paste minified JSON string of the service account
   GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'

   # Or specify Firebase Admin credentials
   FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON='{...}'
   ```

*Note: If credentials are not present, the sync engine automatically falls back to public Google Sheets GViz CSV export, ensuring uninterrupted development and testing.*

---

## 4. Automated Sync Schedules

### A. Vercel Cron (Configured in `vercel.json`)
The project includes a cron schedule in `vercel.json` configured to sync hourly:
```json
{
  "crons": [
    {
      "path": "/api/sync-league",
      "schedule": "0 * * * *"
    }
  ]
}
```

To secure this endpoint against external crawling, set `CRON_SECRET` in Vercel:
```bash
CRON_SECRET=your_high_entropy_secret_here
```
Vercel automatically sends `Authorization: Bearer $CRON_SECRET` on cron invocations.

### B. Manual Admin Trigger
1. Sign in with the administrator Google Account (`lowther.jack@gmail.com`).
2. Navigate to `/admin`.
3. Click **Sync Sheets Now** to trigger an on-demand sync with immediate UI feedback and content hash verification.

### C. Local Execution / Testing
You can trigger the sync locally against your development server:
```bash
# In PowerShell:
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/sync-league" -ContentType "application/json" -Body '{"seriesId":"lnr-acc-s18"}'

# In Bash / cURL:
curl -X POST http://localhost:3000/api/sync-league \
  -H "Content-Type: application/json" \
  -d '{"seriesId":"lnr-acc-s18"}'
```

---

## 5. Troubleshooting

| Symptom | Root Cause | Resolution |
|---|---|---|
| `Sync status: error (Failed to parse Sheet CSV)` | Google Sheet is private or tab name is wrong | Ensure the sheet is shared with Viewer permissions or service account email. Verify tab is named `Calendar` or `Schedule`. |
| `Unauthorized sync request` (401) | `CRON_SECRET` is set in production but missing in request | Pass `Authorization: Bearer <CRON_SECRET>` or header `x-cron-secret`. |
| Track name resolves to `unknown_track` | Non-standard track spelling in sheet | Add alias to `TRACK_ALIASES` in `src/services/sync/mapping.ts`. |
| Timezone discrepancies | Sheet date lacks timezone offset | Input dates as UTC ISO (`2026-11-26T09:00:00Z`) or standard Sydney time (`YYYY-MM-DD HH:mm +11:00`). |
