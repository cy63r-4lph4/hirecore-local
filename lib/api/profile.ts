import { api } from "@/lib/api/axios";

export type UpdateBaseProfilePayload = {
  fullName?: string;
  phoneNumber?: string;
};

export type UpdateWorkerProfilePayload = {
  bio?: string;
  skills?: string[];
  location?: string;
  isAvailable?: boolean;
};

export type UpdateEmployerProfilePayload = {
  companyName?: string;
  location?: string;
};

export async function updateBaseProfile(payload: UpdateBaseProfilePayload) {
  const { data } = await api.patch("/users/me", payload);
  return data;
}

export async function updateWorkerProfile(payload: UpdateWorkerProfilePayload) {
  const { data } = await api.patch("/users/me/worker-profile", payload);
  return data;
}

export async function updateEmployerProfile(
  payload: UpdateEmployerProfilePayload,
) {
  const { data } = await api.patch("/users/me/employer-profile", payload);
  return data;
}

export async function uploadProfileImage(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const { data } = await api.patch("/users/me/profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}