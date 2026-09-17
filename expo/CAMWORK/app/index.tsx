import React from "react";
import { useUser } from "@/context/UserContext";
import LoginScreen from "../components/LoginScreen";

export default function Index() {
  const { isLoading } = useUser();

  if (isLoading) {
    return null;
  }

  return <LoginScreen />;
}
