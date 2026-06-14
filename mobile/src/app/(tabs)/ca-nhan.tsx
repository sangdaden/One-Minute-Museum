import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth";

export default function CaNhan() {
  const { user, signOut } = useAuth();
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <Text className="font-serif text-2xl text-ink">Cá nhân</Text>
        {user ? (
          <>
            <Text className="font-sans text-sm text-ink-soft">{user.email}</Text>
            <Pressable
              onPress={() => void signOut()}
              className="rounded-full border border-border-strong px-5 py-2.5"
            >
              <Text className="font-sans-medium text-ink-soft">Đăng xuất</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={() => router.push("/sign-in")}
            className="rounded-full bg-accent px-6 py-3"
          >
            <Text className="font-sans-medium text-paper-card">Đăng nhập</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
