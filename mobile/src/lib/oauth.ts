import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
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

/** Apple via the native button → Supabase signInWithIdToken (nonce-hashed). */
export async function signInWithApple(): Promise<void> {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });
  if (!credential.identityToken) throw new Error("Không lấy được Apple token");
  const { error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: credential.identityToken,
    nonce: rawNonce,
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
