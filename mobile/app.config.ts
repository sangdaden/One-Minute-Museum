import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "One-Minute Museum",
  slug: "one-minute-museum",
  scheme: "omm",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  icon: "./assets/images/icon.png",
  ios: {
    bundleIdentifier: "com.onomi.oneminutemuseum",
    // usesAppleSignIn re-enabled in Sub-project 5 (needs a paid Apple Developer
    // account; its entitlement otherwise blocks unsigned simulator builds).
    supportsTablet: true,
  },
  android: {
    package: "com.onomi.oneminutemuseum",
  },
  plugins: ["expo-router", "expo-web-browser", "expo-font"],
  experiments: { typedRoutes: true },
};

export default config;
