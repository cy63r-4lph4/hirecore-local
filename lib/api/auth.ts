import { api } from "@/lib/api/axios";

export type AccountType = "WORKER" | "EMPLOYER";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  phoneNumber?: string;
  email: string;
  password: string;
  accountTypes: AccountType[];
}

export interface VerifyEmailPayload {
  code: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export async function loginUser(payload: LoginPayload) {
  const { data } = await api.post("/auth/login", payload);
  return data;
}

export async function registerUser(payload: RegisterPayload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function getMe() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function logoutUser() {
  const { data } = await api.post("/auth/logout", {});
  return data;
}

export async function logoutAllSessions() {
  const { data } = await api.post("/auth/logout-all", {});
  return data;
}

export async function sendEmailVerificationOtp() {
  const { data } = await api.post("/auth/email/send-verification-otp", {});
  return data;
}

export async function verifyEmail(payload: VerifyEmailPayload) {
  const { data } = await api.post("/auth/email/verify", payload);
  return data;
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  const { data } = await api.post("/auth/password/forgot", payload);
  return data;
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const { data } = await api.post("/auth/password/reset", payload);
  return data;
}