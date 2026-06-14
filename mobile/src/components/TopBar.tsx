import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import { COLORS } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

/** App top bar: brand wordmark + notifications + account avatar. */
export default function TopBar() {
  const { user } = useAuth();
  const initial = (user?.email ?? "?").charAt(0).toUpperCase();
  return (
    <View className="flex-row items-center justify-between border-b border-border bg-paper px-4 py-3">
      <Text className="font-serif-bold text-lg text-accent">OMM</Text>
      <View className="flex-row items-center gap-4">
        <Bell size={22} color={COLORS.inkSoft} strokeWidth={1.75} />
        <Pressable
          onPress={() => router.push("/sign-in")}
          className="h-8 w-8 items-center justify-center rounded-full bg-teal/10"
        >
          <Text className="font-sans-medium text-teal">{initial}</Text>
        </Pressable>
      </View>
    </View>
  );
}
