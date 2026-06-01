import { api } from "@/lib/api/axios";
import type { AdminUsersResponse, AdminUser } from "./users";

export type CreateAdminPayload = {
  fullName: string;
  email: string;
  phoneNumber?: string;
  temporaryPassword: string;
};

export type GetSuperAdminAdminsParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export async function getSuperAdminAdmins(params?: GetSuperAdminAdminsParams) {
  const { data } = await api.get<AdminUsersResponse>("/admin/super/admins", {
    params,
  });

  return data;
}

export async function createSuperAdminAdmin(payload: CreateAdminPayload) {
  const { data } = await api.post<AdminUser>("/admin/super/admins", payload);
  return data;
}


