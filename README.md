# PetRoamID — Web (Local-Only)

International pet travel compliance app. No account, no backend, no internet required after first load.

## Architecture

```
Local-only. All data stored in browser localStorage.
Cross-device sync via .petroamid JSON file export/import.

src/
  data/travelRequirements.ts    ← SHARED with RN app (pure TS)
  utils/timelineCalculator.ts   ← SHARED with RN app (pure TS)
  store/
    profileStore.ts             ← Local profiles (no auth)
    appStore.ts                 ← Pet/trip data (localStorage per profile)
    AppContext.tsx               ← React context bridge
  lib/syncService.ts            ← JSON export/import
  pages/
    ProfilePage.tsx             ← Create/select profile (replaces login)
    DashboardPage.tsx
    PetsPage.tsx
    AddPetPage.tsx
    TripSetupPage.tsx
    ChecklistPage.tsx
    SettingsPage.tsx            ← Backup, restore, profile management
  components/Layout.tsx
```

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/petroamid-web.git
git branch -M main
git push -u origin main
```

Then: GitHub repo → Settings → Pages → Source: GitHub Actions

## Cross-device sync

Export `.petroamid` file on Device A → transfer → Import on Device B.

Works between web ↔ Android ↔ iOS (once RN app has export/import).

## Local dev

```bash
npm install
npm run dev
```
