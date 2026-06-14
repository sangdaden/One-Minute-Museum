import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

/**
 * Apple Sign In is temporarily disabled: its entitlement requires a paid Apple
 * Developer account and otherwise blocks unsigned simulator builds. Re-enable
 * (here + `usesAppleSignIn` + the `expo-apple-authentication` plugin) in
 * Sub-project 5 when the paid account is set up.
 */
export const APPLE_SIGN_IN_ENABLED = false;

/** Google via Supabase OAuth + an in-app browser, returning to the omm:// scheme. */
export async function signInWithGoogle(): Promise<void> {
  const redirectTo = makeRedirectUri({ scheme: "omm", path: "auth" });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error("No OAuth URL");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success" || !result.url) {
    throw new Error("Đăng nhập bị huỷ");
  }

  // Supabase PKCE returns ?code=...; exchange it for a session.
  const code = new URL(result.url).searchParams.get("code");
  if (!code) throw new Error("Thiếu mã xác thực");
  const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
  if (exErr) throw exErr;
}

/**
 * Apple Sign In is disabled for now — its entitlement needs a paid Apple
 * Developer account and `expo-apple-authentication` (uninstalled) would
 * otherwise force a signed build. The real native implementation lives in git
 * history; in Sub-project 5: reinstall `expo-apple-authentication`, re-add
 * `usesAppleSignIn` + the plugin in app.config.ts, restore the flow here, and
 * flip APPLE_SIGN_IN_ENABLED to true.
 */
export async function signInWithApple(): Promise<void> {
  throw new Error("Apple Sign In sẽ bật ở bản sau");
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
