import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { UserProvider } from "@/context/UserContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <UserProvider>
          <StatusBar style="dark" />
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
            <Stack.Screen name="payment" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </UserProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
