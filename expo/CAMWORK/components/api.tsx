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

export interface RegisterResponse extends BackendUser {
  token?: string;
}

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

  // A standalone build must explicitly point to the deployed shared API.
  // A private development-machine IP makes each phone appear to have its own data.
  throw new Error(
    "EXPO_PUBLIC_API_URL is required for a standalone build. Set it to your public CamWork API URL.",
  );
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

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
    throw new ApiError(message, response.status);
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
    if (
      error instanceof TypeError &&
      error.message.includes("Network request failed")
    ) {
      throw new Error(
        `Unable to reach backend server at ${baseUrl}. Ensure backend is running.`,
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
    if (
      error instanceof TypeError &&
      error.message.includes("Network request failed")
    ) {
      throw new Error(
        `Unable to reach backend server at ${baseUrl}. Ensure backend is running.`,
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
    if (
      error instanceof TypeError &&
      error.message.includes("Network request failed")
    ) {
      throw new Error(
        `Unable to reach backend server at ${baseUrl}. Ensure backend is running.`,
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
    if (
      error instanceof TypeError &&
      error.message.includes("Network request failed")
    ) {
      throw new Error(
        `Unable to reach backend server at ${baseUrl}. Ensure backend is running.`,
      );
    }
    throw error;
  }
};

export const createPayment = async (payload: {
  payerEmail: string;
  amount: string;
  method: "mobile-money" | "card";
  applicationId?: string;
}) => {
  return authenticatedRequest("/api/payments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const authenticatedRequest = async (
  path: string,
  options: RequestInit = {},
) => {
  const token = await AsyncStorage.getItem("camwork_token");
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 401) {
    await AsyncStorage.removeItem("camwork_token");
  }
  return handleApiResponse(response);
};

export const createJob = async (job: object) =>
  authenticatedRequest("/api/jobs", {
    method: "POST",
    body: JSON.stringify(job),
  });

export const updateJob = async (jobId: string, job: object) =>
  authenticatedRequest(`/api/jobs/${jobId}`, {
    method: "PUT",
    body: JSON.stringify(job),
  });

export const deleteJob = async (jobId: string) =>
  authenticatedRequest(`/api/jobs/${jobId}`, { method: "DELETE" });

export const getConversations = async () =>
  authenticatedRequest("/api/messages");

export const createConversation = async (conversation: object) =>
  authenticatedRequest("/api/messages", {
    method: "POST",
    body: JSON.stringify(conversation),
  });

export const sendMessage = async (conversationId: string, text: string) =>
  authenticatedRequest(`/api/messages/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });

export const getApplications = async (role: "seeker" | "employer") =>
  authenticatedRequest(`/api/applications?role=${role}`);

export const createApplication = async (application: object) =>
  authenticatedRequest("/api/applications", {
    method: "POST",
    body: JSON.stringify(application),
  });

export const updateApplicationStatusApi = async (
  applicationId: string,
  status: string,
) =>
  authenticatedRequest(`/api/applications/${applicationId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const validateApplicationApi = async (
  applicationId: string,
  validated: boolean,
) =>
  authenticatedRequest(`/api/applications/${applicationId}/validate`, {
    method: "PATCH",
    body: JSON.stringify({ validated }),
  });

export const updateJobStatusApi = async (jobId: string, status: string) =>
  authenticatedRequest(`/api/jobs/${jobId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const uploadVerificationDocumentApi = async (payload: {
  documentType: "id" | "certificate";
  fileName: string;
  mimeType: string;
  data: string;
}) =>
  authenticatedRequest("/api/user/verification/documents", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const searchWorkersApi = async (query: string) =>
  authenticatedRequest(`/api/user/workers?q=${encodeURIComponent(query)}`);

export const updateUserProfileApi = async (profile: object) =>
  authenticatedRequest("/api/user/profile", {
    method: "PATCH",
    body: JSON.stringify(profile),
  });

export const createDirectOfferApi = async (payload: object) =>
  authenticatedRequest("/api/direct-offers", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getDirectOffersApi = async (role: "seeker" | "employer") =>
  authenticatedRequest(`/api/direct-offers?role=${role}`);

export const updateDirectOfferStatusApi = async (
  offerId: string,
  status: "Accepted" | "Declined",
) =>
  authenticatedRequest(`/api/direct-offers/${offerId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
