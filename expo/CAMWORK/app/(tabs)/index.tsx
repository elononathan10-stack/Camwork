import React from "react";
import SeekerDashboard from "@/components/seekerDashboard";
import EmployerDashboard from "@/components/employerDashboard";
import { useUser } from "@/context/UserContext";

export default function HomeScreen() {
  const { user } = useUser();
  return user?.role === "employer" ? (
    <EmployerDashboard />
  ) : (
    <SeekerDashboard />
  );
}
