import { api } from "@/lib/api/axios";

export type AccountType = "WORKER" | "EMPLOYER";

export type UpdateBaseProfilePayload = {
  fullName?: string;
  phoneNumber?: string | null;
};

export type UpdateWorkerProfilePayload = {
  bio?: string | null;
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

export async function createAccountTypes(payload: {
  accountTypes: AccountType[];
}) {
  const { data } = await api.post("/users/me/account-types", payload);
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

export async function uploadProfileImageAsset(file: File) {
  const formData = new FormData();
  formData.append("files", file);

  const { data } = await api.post("/uploads/profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const assetId =
    data?.assetId ||
    data?.asset?.id ||
    data?.data?.[0]?.id ||
    data?.assets?.[0]?.id ||
    data?.items?.[0]?.id;

  if (!assetId) {
    console.error("Unexpected profile image upload response:", data);
    throw new Error("Profile image upload did not return an asset id.");
  }

  return assetId;
}

export async function updateProfileImageAsset(assetId: string) {
  const { data } = await api.patch("/users/me/profile-image", {
    assetId,
  });

  return data;
}

export async function uploadAndSetProfileImage(file: File) {
  const assetId = await uploadProfileImageAsset(file);
  return updateProfileImageAsset(assetId);
}
