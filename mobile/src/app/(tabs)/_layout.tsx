import { Tabs } from "expo-router";
import { View } from "react-native";
import { Home, Images, Plus, Bookmark, User } from "lucide-react-native";
import { COLORS } from "@/lib/theme";
import TopBar from "@/components/TopBar";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        header: () => <TopBar />,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.inkFaint,
        tabBarStyle: {
          backgroundColor: COLORS.paperCard,
          borderTopColor: COLORS.border,
        },
        tabBarLabelStyle: {
          fontFamily: "BeVietnamPro_400Regular",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="thu-vien"
        options={{
          title: "Thư viện",
          tabBarIcon: ({ color }) => <Images size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tao"
        options={{
          title: "",
          tabBarIcon: () => (
            <View
              style={{ backgroundColor: COLORS.accent }}
              className="-mt-4 h-14 w-14 items-center justify-center rounded-full shadow-lg"
            >
              <Plus size={26} color={COLORS.paperCard} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bo-suu-tap"
        options={{
          title: "Bộ sưu tập",
          tabBarIcon: ({ color }) => <Bookmark size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ca-nhan"
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
