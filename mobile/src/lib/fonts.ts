import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Lora_500Medium, Lora_600SemiBold } from "@expo-google-fonts/lora";
import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
} from "@expo-google-fonts/be-vietnam-pro";

void SplashScreen.preventAutoHideAsync();

/** Loads the brand fonts and hides the splash when ready. Returns true when done. */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    Lora_500Medium,
    Lora_600SemiBold,
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
  });
  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync();
  }, [loaded, error]);
  return loaded || !!error;
}
