import { Redirect, Stack, useSegments } from "expo-router";
import { View } from "react-native";
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
          <AuthGate>
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
          </AuthGate>
        </UserProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const { user, isLoading } = useUser();
  const isPublicRoute = [
    "index",
    "language-select",
    "register",
    "ForgotPassword",
  ].includes(segments[0] || "index");

  if (isLoading) return null;
  if (!user && !isPublicRoute) return <Redirect href="/" />;
  if (user && isPublicRoute) return <Redirect href="/(tabs)" />;
  return <>{children}</>;
}
