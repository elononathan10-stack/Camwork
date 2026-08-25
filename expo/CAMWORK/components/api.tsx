import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface BackendUser {
  id: number | string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: BackendUser;
  token: string;
}

export interface RegisterResponse extends BackendUser {}

export const getApiBaseUrl = (): string => {
  // 1. Explicit environment variable if configured
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }

  // 2. Web browser: standard localhost
  if (Platform.OS === "web") {
    return "http://localhost:3000";
  }

  // 3. Expo Go / Dev Client dynamic host URI (picks up developer machine IP automatically)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host) {
      return `http://${host}:3000`;
    }
  }

  // 4. Android Emulator default bridge
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  // 5. Fallback LAN IP for current local network
  return "http://192.168.100.8:3000";
};

const handleApiResponse = async (response: Response) => {
  let data: any = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      (response.status === 401
        ? "Invalid email or password."
        : response.status === 404
        ? "Account not found with this email."
        : response.status === 409
        ? "An account already exists with this email."
        : `Server error (${response.status})`);
    throw new Error(message);
  }

  return data;
};

export const loginUser = async (credentials: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      }),
    });

    const result = (await handleApiResponse(response)) as LoginResponse;
    if (result?.token) {
      await AsyncStorage.setItem("camwork_token", result.token);
    }
    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("Network request failed")) {
      throw new Error(
        `Unable to reach backend server at ${baseUrl}. Ensure backend is running.`
      );
    }
    throw error;
  }
};

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  role?: string;
}): Promise<RegisterResponse> => {
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        role: payload.role || "seeker",
      }),
    });

    const result = (await handleApiResponse(response)) as RegisterResponse;
    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("Network request failed")) {
      throw new Error(
        `Unable to reach backend server at ${baseUrl}. Ensure backend is running.`
      );
    }
    throw error;
  }
};

export const requestPasswordReset = async (email: string) => {
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/user/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    return handleApiResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("Network request failed")) {
      throw new Error(
        `Unable to reach backend server at ${baseUrl}. Ensure backend is running.`
      );
    }
    throw error;
  }
};

export const resetPassword = async (token: string, password: string) => {
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/user/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    return handleApiResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("Network request failed")) {
      throw new Error(
        `Unable to reach backend server at ${baseUrl}. Ensure backend is running.`
      );
    }
    throw error;
  }
};

