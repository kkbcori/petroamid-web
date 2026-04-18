# PetRoamID — Web

> International pet travel compliance app. Generates checklists of veterinary and documentation requirements for dogs and cats travelling internationally.

## 🌐 Live Demo
Deploy your own: see instructions below.

## Features
- ✅ Full checklist engine (US/Canada/EU — same data as Android app)
- ✅ Local profiles — no backend, no account required
- ✅ Multi-profile support (family, multiple pets)
- ✅ Cross-device sync via `.petroamid` JSON export/import
- ✅ Readiness score + timeline tracking
- ✅ Works offline (localStorage)
- ✅ Mobile responsive

---

## 🚀 Deploy to GitHub Pages

### 1. Create the repo
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create petroamid-web --public --push --source .
```

### 2. Enable GitHub Pages
- Go to your repo → **Settings → Pages**
- Source: **GitHub Actions**
- Save

### 3. Push triggers auto-deploy
Any push to `main` builds and deploys automatically via `.github/workflows/deploy.yml`.

Your app will be live at: `https://<your-username>.github.io/petroamid-web/`

---

## 🌍 Custom Domain
1. In `public/CNAME`, replace the comment with your domain (one line):
   ```
   petroamid.yourdomain.com
   ```
2. Add a DNS CNAME record:
   ```
   petroamid.yourdomain.com → <your-username>.github.io
   ```
3. In GitHub repo Settings → Pages, enter the custom domain and enable HTTPS.

---

## 🔄 Cross-Platform Sync (Web ↔ Android ↔ iOS)

Since there is no backend, sync works via file export:

| From | To | Steps |
|------|----|-------|
| Android | Web | In mobile app: export `.petroamid` file → email to yourself → on web: Settings → Import Backup |
| Web | Android | Settings → Export Backup → transfer file → open in PetRoamID mobile app |
| Web | iOS | Same as Web → Android |

The `.petroamid` file is plain JSON — open it in any text editor if needed.

---

## 🛠 Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

### Build for production
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
  data/
    travelRequirements.ts   ← SHARED with RN app (pure TS, no deps)
  utils/
    timelineCalculator.ts   ← SHARED with RN app (pure TS)
    syncService.ts          ← Web: JSON export/import
    theme.ts                ← Web CSS version of RN theme tokens
  store/
    authStore.ts            ← Profile management (localStorage)
    appStore.ts             ← Pet/trip state (localStorage, same logic as RN)
    AppContext.tsx           ← React context bridge
  pages/
    AuthPage.tsx            ← Login / create profile
    DashboardPage.tsx       ← Home screen
    PetsPage.tsx            ← Pet list and management
    AddPetPage.tsx          ← Multi-step add/edit pet form
    TripSetupPage.tsx       ← Create trip / select destination
    ChecklistPage.tsx       ← Trip checklist + readiness score
    SettingsPage.tsx        ← Profile, sync, data management
  components/
    Layout.tsx              ← Top nav + mobile bottom nav
  App.tsx                   ← Routing
  main.tsx                  ← Entry point
```

## 🔄 Keeping RN and Web in Sync

The following files are **identical** between the React Native app and this web version:
- `src/data/travelRequirements.ts`
- `src/utils/timelineCalculator.ts`

When you update travel requirements in the RN app, copy those files across verbatim. They have zero platform-specific imports.

Everything else has a clean platform-abstraction boundary:
- State logic: same (Zustand), only the storage adapter differs (`AsyncStorage` vs `localStorage`)
- UI: separate (RN components vs React DOM)

---

## 🗝 Tech Stack
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **React Router v6** (routing)
- **Zustand v5** (state management — same as RN)
- **date-fns** (date utils — same as RN)
- **localStorage** (persistence — replaces AsyncStorage)
- **GitHub Actions** (CI/CD)
