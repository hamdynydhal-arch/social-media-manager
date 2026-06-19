# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# Neural Nexus Design System

## Single source of truth
All brand colors, shadows, and radii live in `src/constants/theme.ts`.
- **NEVER hardcode hex values** in screens or components.
- Always import `Colors`, `Shadows`, or `Radii` from `../../src/constants/theme` (adjust relative path as needed).

## Reusable components
Shared UI components live in `src/components/` and are exported via `src/components/index.ts`:
- `GradientHeader` — dark branded header with cyan/purple glow orbs
- `BrandCard` — white card with cyan shadow and rounded corners
- `PrimaryButton` — multi-variant button (cyan / purple / gold / outline)

## Rules
1. No raw hex strings (e.g. `'#06B6D4'`) in screen files — use `Colors.cyan.DEFAULT`.
2. No raw shadow objects in screens — use `Shadows.card`, `Shadows.cyan`, etc.
3. No raw border-radius numbers for standard sizes — use `Radii.card`, `Radii.lg`, etc.
4. Platform brand colors must come from `Colors.platforms.*`, not hardcoded.
5. The app is RTL Arabic — all `textAlign` defaults to `'right'`.
