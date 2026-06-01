// src/lib/api/super-admin/security.ts

import { api } from "@/lib/api/axios";
import type { UserRole } from "./users";

export type SuperAdminSession = {
  id: string;
  userId: string;
  refreshToken?: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  expiresAt: string;
  isActive?: boolean;

  user?: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
  };
};

export type SuperAdminSessionsResponse = {
  data: SuperAdminSession[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    activeSessions: number;
  };
};

export type GetSuperAdminSessionsParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export async function getSuperAdminSessions(
  params?: GetSuperAdminSessionsParams,
) {
  const { data } = await api.get<SuperAdminSessionsResponse>(
    "/admin/super/security/sessions",
    {
      params,
    },
  );

  return data;
}