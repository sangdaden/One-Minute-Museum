import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Themed safe-area placeholder used by the foundation tab screens. */
export default function Screen({ title, note }: { title: string; note?: string }) {
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="font-serif text-2xl text-ink">{title}</Text>
        <Text className="mt-2 font-sans text-sm text-ink-faint">
          {note ?? "Sắp có"}
        </Text>
      </View>
    </SafeAreaView>
  );
}
