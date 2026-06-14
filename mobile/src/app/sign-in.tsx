import { useState } from "react";
import { View, Text, Pressable, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth";
import { APPLE_SIGN_IN_ENABLED } from "@/lib/oauth";

export default function SignIn() {
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
      router.back();
    } catch (e) {
      Alert.alert("Đăng nhập", e instanceof Error ? e.message : "Thử lại nhé.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-paper">
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <Text className="font-serif-bold text-3xl text-accent">OMM</Text>
        <Text className="mb-4 text-center font-sans text-sm text-ink-soft">
          Ôm trọn văn hoá Việt
        </Text>
        <Pressable
          disabled={busy}
          onPress={() => run(signInWithGoogle)}
          className="w-full rounded-full border border-border-strong bg-paper-card py-3"
        >
          <Text className="text-center font-sans-medium text-ink">
            Tiếp tục với Google
          </Text>
        </Pressable>
        {Platform.OS === "ios" && APPLE_SIGN_IN_ENABLED && (
          <Pressable
            disabled={busy}
            onPress={() => run(signInWithApple)}
            className="w-full rounded-full bg-ink py-3"
          >
            <Text className="text-center font-sans-medium text-paper-card">
              Tiếp tục với Apple
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
