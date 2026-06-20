# Project Rules — منصة المحتوى (Social Media Manager)

## IMMUTABLE ARCHITECTURE RULES

These rules protect the stable foundations of the app. Do not modify these systems without explicit approval.

---

### 1. PWA Architecture

The `PWAContext` (`app/src/contexts/PWAContext.tsx`) is fully stable and correctly triggers native Android one-click installation via `beforeinstallprompt`.

**DO NOT:**
- Modify the `useEffect` lifecycle or event listeners inside `PWAContext`
- Change the Service Worker (`sw.js`) generation in `deploy-web.yml`
- Alter the inline capture script injected into `index.html`:
  ```js
  window.deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function(e) { ... });
  ```
- Change the manifest `start_url`, `scope`, or `display` fields
- Remove the step that copies `assets/icon.png` → `dist/assets/icon.png` (this is what makes Chrome fire `beforeinstallprompt`)
- Add subpaths to any manifest or Expo web config

**The flow is:** inline script captures event → `PWAProvider` picks it up in `useEffect` → `isInstallable` becomes `true` → buttons render → user taps → `deferredPrompt.prompt()` triggers native OS dialog.

---

### 2. Neural Nexus Design System

The design system is locked in `app/src/constants/theme.ts`.

**DO NOT:**
- Hardcode hex color values (e.g. `'#06B6D4'`) in any screen or component file
- Define shadow objects inline in screens — use `Shadows.card`, `Shadows.cyan`, etc.
- Use raw border-radius numbers for standard sizes — use `Radii.card`, `Radii.lg`, etc.
- Import colors from anywhere other than `src/constants/theme.ts`

**DO:**
- Use `Colors.cyan.DEFAULT`, `Colors.purple.DEFAULT`, `Colors.dark.header`, etc.
- Use `Colors.platforms.*` for platform brand colors
- Keep `textAlign: 'right'` as the default (RTL Arabic app)

---

### 3. Routing & Domain Configuration

The app is deployed to the custom domain `smm.prtnh.com` via GitHub Pages (`gh-pages` branch).

**DO NOT:**
- Add subpaths to `start_url` or `scope` in the manifest
- Add a `basePath` or `publicPath` to the Expo web config
- Change the CNAME from `smm.prtnh.com`
- Introduce `output: 'server'` — the app must remain `output: 'single'` (SPA)

---

### 4. Native Mobile Builds

The app targets iOS and Android via Expo. All web-specific code (`PWAContext`, `PWALoginButton`, `PWADashboardModal`) is guarded by `Platform.OS !== 'web'` checks and must never execute in native builds.

---

### 5. Authentication Flow

The Supabase OAuth flow depends on `hasOAuthFragment()` in `app/_layout.tsx`. Do not modify the `onAuthStateChange` handler without understanding the OAuth redirect sequence (`INITIAL_SESSION` → wait if hash present → `SIGNED_IN`).

---

## Stable Version

Tag `v1.0.0-stable` marks the exact commit where:
- PWA native Android install works on first visit ✓
- Neural Nexus design system is fully applied ✓
- RTL Arabic tab bar with correct ordering ✓
- OAuth redirect blank-screen bug is fixed ✓
- Service Worker + manifest icons verified ✓
