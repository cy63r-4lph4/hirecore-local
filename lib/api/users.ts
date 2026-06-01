import { api } from "@/lib/api/axios";

export async function getMyProfile() {
  const { data } = await api.get("/users/me");
  return data;
}

export async function updateMyProfile(payload: {
  fullName?: string;
  phoneNumber?: string;
}) {
  const { data } = await api.patch("/users/me", payload);
  return data;
}