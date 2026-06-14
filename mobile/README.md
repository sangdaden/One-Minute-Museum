# OMM mobile (Expo) — Foundation

Native iOS/Android client for One-Minute Museum. Expo Router + NativeWind +
Supabase auth. Reuses the web's pure-TS domain files via the `@omm/*` alias.

## First run (needs a Mac + Xcode)

1. **Env:** `cp .env.example .env` and fill `EXPO_PUBLIC_SUPABASE_URL` +
   `EXPO_PUBLIC_SUPABASE_ANON_KEY` (same Supabase project as the web app).
2. **Supabase Auth providers:** enable **Google** and **Apple**; add the redirect
   URL `omm://auth`. (Apple needs an Apple Developer account + a Services ID/key;
   Google needs an OAuth client id.)
3. **Dev build** — auth & native modules do NOT run in Expo Go:
   ```bash
   npx expo run:ios     # builds + opens on a simulator/device
   # or: npx eas build --profile development --platform ios
   ```
   (Android: `npx expo run:android`.)

## Verify (on device)

- App launches into the 5-tab Heritage-Warm shell (Trang chủ · Thư viện · ＋ ·
  Bộ sưu tập · Cá nhân) with the top bar.
- Tabs navigate; placeholder screens render with brand fonts (Lora + Be Vietnam Pro).
- Avatar / Cá nhân → **Đăng nhập** → **Google** and **Apple** sign-in complete.
- Restart the app → the session persists. **Đăng xuất** clears it.

## What's here (Sub-project 0)

Shell only — theme, navigation, auth, API client skeleton, placeholder screens.
Feed, create flow, collections, share, etc. arrive in later sub-projects.

## Notes

- Build-time verification used here: `npx tsc --noEmit` + `npx expo export`
  (full Metro bundle). Runtime/auth behavior is verified on a device.
- Shared code: `@omm/*` → the repo-root `../lib/*` (pure-TS: types, categories,
  format) via Metro `watchFolders` + a babel/tsconfig alias.
