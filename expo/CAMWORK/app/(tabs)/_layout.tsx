import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import {
  Home,
  Search,
  MessageSquare,
  User,
  BriefcaseBusiness,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useLanguage } from "@/context/LanguageContext";
import { useUser } from "@/context/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { language } = useLanguage();
  const { conversations } = useUser();
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  const unreadMessages = conversations.reduce(
    (acc, c) => acc + c.unreadCount,
    0,
  );

  const titles = {
    EN: {
      home: "Home",
      search: "Search",
      messages: "Messages",
      profile: "Profile",
    },
    FR: {
      home: "Accueil",
      search: "Recherche",
      messages: "Messages",
      profile: "Profil",
    },
  }[language];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",
          height:
            Platform.OS === "ios" ? 64 + insets.bottom : 60 + insets.bottom,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          fontFamily: theme.fonts.bold,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: user?.role === "employer" ? "Manage" : titles.home,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: user?.role === "employer" ? "Talent" : titles.search,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              {user?.role === "employer" ? (
                <BriefcaseBusiness
                  size={22}
                  color={color}
                  strokeWidth={focused ? 2.5 : 2}
                />
              ) : (
                <Search
                  size={22}
                  color={color}
                  strokeWidth={focused ? 2.5 : 2}
                />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: titles.messages,
          tabBarBadge: unreadMessages > 0 ? unreadMessages : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.primary,
            fontSize: 10,
            fontWeight: "bold",
          },
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <MessageSquare
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: titles.profile,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      {/* Hide legacy explore from tabs bar */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconWrap: {
    transform: [{ scale: 1.05 }],
  },
});
