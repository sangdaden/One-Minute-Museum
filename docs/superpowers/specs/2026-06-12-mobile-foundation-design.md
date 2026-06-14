# Mobile app — Sub-project 0: Foundation

**Date:** 2026-06-12
**Status:** Approved (brainstorm) → ready for implementation plan
**Program:** Native mobile app (Expo/React Native) for the App Store, reusing the
existing Supabase + Next.js API backend. This spec covers **only Sub-project 0
(Foundation)**; later sub-projects (Feed, Create, Library/Collections,
Share/extras, App Store prep) get their own spec → plan cycles.

## Goal

A runnable Expo app shell in `mobile/`: Heritage-Warm themed, with the 5-tab
navigation from the mockup, Supabase auth (Google + Sign in with Apple) wired and
session-persistent, a backend API client skeleton, and placeholder screens per
tab. No real features yet — this is the foundation the feature sub-projects build
on.

## Program decomposition (context)

0. **Foundation** (this spec)
1. Feed + post detail (read)
2. Create flow (AI generate → publish)
3. Library · Profile · Collections
4. Share/export (native), TTS, Quiz, Ask
5. App Store prep (EAS build, icons, privacy, UGC moderation + account deletion, submit)

## Decisions (locked in brainstorm)

- **Approach:** native Expo/React Native client reusing the backend (not Capacitor/PWA).
- **Location:** a `mobile/` folder in THIS repo; share pure-TS domain files with the web.
- **Styling:** NativeWind v4 (Tailwind for RN) with the Heritage Warm tokens.
- **Navigation:** Expo Router (file-based) with a tab layout.
- **Auth:** Supabase — Google OAuth (mirrors web) **and** Sign in with Apple
  (required by App Store Guideline 4.8 when a social login is offered). Guest
  browsing allowed; auth triggered on write actions (mirrors web), not a hard gate.

## Architecture

```
mobile/
  app/                        # Expo Router routes
    _layout.tsx               # root: providers (Auth, fonts), theme
    (tabs)/
      _layout.tsx             # bottom tab bar (5 tabs, center + button)
      index.tsx               # Trang chủ (placeholder)
      thu-vien.tsx            # Thư viện (placeholder)
      tao.tsx                 # ＋ Create (placeholder)
      bo-suu-tap.tsx          # Bộ sưu tập (placeholder)
      ca-nhan.tsx             # Cá nhân (placeholder; shows auth state)
    sign-in.tsx               # auth screen (Google + Apple)
  lib/
    supabase.ts               # RN Supabase client (AsyncStorage session)
    auth.tsx                  # AuthProvider/useAuth context
    api.ts                    # backend API client skeleton (Bearer token)
    theme.ts                  # palette constants (mirror tailwind config)
  components/                 # shared RN components (TopBar, Brand, etc.)
  tailwind.config.js          # NativeWind theme (Heritage Warm tokens + fonts)
  metro.config.js            # watchFolders → repo root for shared lib/*
  babel.config.js, app.config.ts, tsconfig.json, package.json
```

- **Shared domain code:** import the web's pure-TS files (`lib/types.ts`,
  `lib/categories.ts`, `lib/format.ts` — they use only relative imports, no Next
  APIs) from the mobile app via Metro `watchFolders: [<repoRoot>]` + a tsconfig
  path alias (e.g. `@omm/*` → `../lib/*`). The mobile app does NOT import any
  Next/server file. (If a shared file later pulls in a browser/Next dependency,
  it must be split; not expected for these three.)

## Project setup

- Expo SDK (latest stable), TypeScript, `expo-router`, `nativewind` (+ `tailwindcss`),
  `react-native-safe-area-context`, `react-native-screens`.
- Auth/session: `@supabase/supabase-js`, `@react-native-async-storage/async-storage`,
  `expo-web-browser`, `expo-auth-session`, `expo-apple-authentication`,
  `expo-crypto` (nonce for Apple), `expo-secure-store` (optional, for token).
- Fonts: `@expo-google-fonts/lora` (serif headings) + `@expo-google-fonts/be-vietnam-pro`
  (body) — both have full Vietnamese diacritic coverage — loaded via `expo-font`/
  `useFonts`, with a splash hold until ready.
- `expo-dev-client` (custom dev build) — REQUIRED because Apple/Google auth are
  native modules (the app will NOT run in Expo Go).

## Theme (Heritage Warm) — `tailwind.config.js`

Port the light-mode palette from `app/globals.css`:

| token | hex |
|---|---|
| paper | #f7f1e3 |
| paper-card | #fff9ef |
| paper-sunk | #efe6d4 |
| ink | #2f2621 |
| ink-soft | #7a6a5f |
| ink-faint | #9f8e7e |
| accent | #a8322a |
| accent-deep | #7e241d |
| gold | #c89b3c |
| teal | #2f7c74 |
| teal-deep | #245f58 |
| border | #e3d2b8 |
| border-strong | #d6c19d |

- Font families: `serif` → Lora, `sans`/default → Be Vietnam Pro.
- Dark mode is out of scope for Foundation (light only); revisit later.

## Navigation (matches the mockup)

- `(tabs)/_layout.tsx` — a bottom tab bar with 5 items: **Trang chủ** (home),
  **Thư viện** (library), **＋ Tạo** (center, a prominent red circular button),
  **Bộ sưu tập** (collections), **Cá nhân** (profile). lucide-style icons via
  `lucide-react-native`. Active = accent; inactive = ink-faint.
- A reusable **TopBar** component: OMM brand wordmark (left), notifications bell +
  account avatar (right) — static for now (avatar opens `sign-in` or shows the
  signed-in user from `useAuth`).
- Each tab screen is a themed placeholder (title + "Sắp có" note) so the shell is
  navigable and visually on-brand.

## Supabase + Auth

- `mobile/lib/supabase.ts`: `createClient(EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY, { auth: { storage: AsyncStorage,
  autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } })`.
  Start/stop auto-refresh on `AppState` foreground/background (the documented RN
  pattern).
- `mobile/lib/auth.tsx`: an `AuthProvider` exposing `{ session, user, loading,
  signInWithGoogle, signInWithApple, signOut }` via `supabase.auth.onAuthStateChange`.
- **Google:** `supabase.auth.signInWithOAuth({ provider: 'google', options: {
  redirectTo: <app deep link>, skipBrowserRedirect: true } })` → open the returned
  URL with `expo-web-browser` `openAuthSessionAsync`, capture the redirect, and
  `supabase.auth.exchangeCodeForSession` (PKCE) / `setSession`. Deep-link scheme
  `omm://` registered in `app.config.ts`.
- **Apple:** `expo-apple-authentication` `signInAsync` with a hashed nonce →
  `supabase.auth.signInWithIdToken({ provider: 'apple', token: identityToken,
  nonce })`. Apple button shown only on iOS.
- `sign-in.tsx`: the two buttons + brand. Reached from the Cá nhân tab / avatar;
  not a hard gate (guest browsing allowed).

## API client skeleton — `mobile/lib/api.ts`

- A `apiFetch(path, init)` wrapper over `fetch(EXPO_PUBLIC_API_BASE + path, ...)`
  that attaches `Authorization: Bearer <supabase access token>` when a session
  exists, sets JSON headers, and maps non-2xx to a typed error. Foundation ships
  ONLY this wrapper (type-checked, not called at runtime); the actual endpoint
  calls (generate/illustrate/quiz/ask/listen/curate) are wired in their feature
  sub-projects.
- Note: the AI endpoints currently authenticate via SSR cookies; accepting a
  Bearer token is a backend change tracked in Sub-project 2 (not Foundation).

## Environment / config

- `mobile/.env` (gitignored) + `app.config.ts` exposing: `EXPO_PUBLIC_SUPABASE_URL`,
  `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_BASE` (the deployed web origin;
  may be a placeholder/local until Sub-project 2). Add a `mobile/.env.example`.
- `app.config.ts`: name "One-Minute Museum", slug, scheme `omm`, iOS
  `usesAppleSignIn: true`, bundle identifier, icon/splash placeholders (real assets
  in Sub-project 5).

## Out of scope (later sub-projects)

- Real feed/post/create/collections data + screens; share card; TTS/Quiz/Ask.
- Backend Bearer-token auth for the AI routes (Sub-project 2).
- App icons/splash, EAS production build, store listing, moderation/account-deletion
  compliance (Sub-project 5).
- Dark mode; Android-specific polish (code is cross-platform but iOS is the target).

## Constraints & prerequisites

- **Cannot run a simulator from this environment.** Deliverable = code + config
  that type-checks and is `expo`-valid; the user runs `expo` / a dev build on a
  Mac to verify on device.
- **Apple/Google auth need a development build** (`expo-dev-client` via `expo
  run:ios` or EAS) — NOT Expo Go.
- Apple Sign In on a real build needs the Apple Developer account + the "Sign in
  with Apple" capability + Supabase's Apple provider configured (client id, key).
  Google needs the OAuth client + Supabase Google provider + the deep-link redirect
  registered. Provider config is the user's Supabase/Apple/Google console setup;
  the app code assumes they're configured.
- Backend deploy is NOT needed for Foundation (auth + later feed use Supabase
  directly); it becomes a prerequisite at Sub-project 2.

## Verification gates

- `cd mobile && npx tsc --noEmit` clean (with the shared-lib path alias resolving).
- `npx expo-doctor` (or `expo config`) passes — valid app config + dependency
  versions aligned to the Expo SDK.
- Shared imports resolve: a mobile file importing `@omm/types` / `@omm/categories`
  type-checks.
- Manual (user, on a Mac dev build): app launches → 5 tabs navigate → tapping the
  account avatar opens sign-in → Google and Apple sign-in complete and the session
  persists across an app restart → sign-out works.

## File touch-list (anticipated, all under `mobile/`)

- `package.json`, `app.config.ts`, `babel.config.js`, `metro.config.js`,
  `tailwind.config.js`, `tsconfig.json`, `.env.example`, `nativewind-env.d.ts`.
- `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, the 5 tab screens, `app/sign-in.tsx`.
- `lib/supabase.ts`, `lib/auth.tsx`, `lib/api.ts`, `lib/theme.ts`.
- `components/TopBar.tsx`, `components/Brand.tsx`, `components/Screen.tsx`
  (themed placeholder scaffold).
- Repo root: a `mobile`-aware `.gitignore` addition (node_modules, .expo, ios,
  android, .env).
