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
    usesAppleSignIn: true,
    supportsTablet: true,
  },
  android: {
    package: "com.onomi.oneminutemuseum",
  },
  plugins: [
    "expo-router",
    "expo-apple-authentication",
    "expo-web-browser",
    "expo-font",
  ],
  experiments: { typedRoutes: true },
};

export default config;
