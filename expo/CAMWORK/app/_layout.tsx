import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { UserProvider, useUser } from "@/context/UserContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <UserProvider>
          <StatusBar style="dark" />
          <AuthNavigation />
        </UserProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

function AuthNavigation() {
  const segments = useSegments();
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return;

    const currentSegment = segments[0] || "index";
    const publicRoutes = [
      "index",
      "language-select",
      "register",
      "ForgotPassword",
    ];
    const isPublicRoute = publicRoutes.includes(currentSegment);

    if (!user && !isPublicRoute) {
      router.replace("/");
    } else if (user && isPublicRoute) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="language-select" />
        <Stack.Screen name="register" />
        <Stack.Screen name="ForgotPassword" />
        <Stack.Screen name="profile-setup" />
        <Stack.Screen name="job-detail" />
        <Stack.Screen
          name="apply-job"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="applications" />
        <Stack.Screen name="direct-offers" />
        <Stack.Screen name="chat-thread" />
        <Stack.Screen name="videocall" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="verification" />
        <Stack.Screen name="community-vouching" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="post-job" />
        <Stack.Screen name="new-chat" />
        <Stack.Screen name="worker-search" />
        <Stack.Screen name="worker-profile" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
