import React, { useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { router } from "expo-router";
import LoginScreen from "../components/LoginScreen";

export default function Index() {
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading]);

  if (isLoading) {
    return null; // or a loading screen
  }

  return <LoginScreen />;
}
