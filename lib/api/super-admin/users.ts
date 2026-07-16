import { api } from "@/lib/api/axios";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export type UserProfileType = "WORKER" | "EMPLOYER" | "DUAL" | "NONE";

export type AdminUser = {
  id: string;
  email: string;
  googleId?: string | null;
  fullName: string;
  phoneNumber?: string | null;
  role: UserRole;

  isVerified: boolean;
  isWorkforce: boolean;

  verifiedByAdminId?: string | null;
  verifiedAt?: string | null;

  profileImageAsset?: {
    id: string;
    originalName: string;
    mimeType: string;
    sizeBytes?: number;
    createdAt?: string;
  } | null;

  workerProfile?: {
    id: string;
    bio?: string | null;
    skills: string[];
    location?: string | null;
    isAvailable: boolean;
    isVerified: boolean;
    verifiedAt?: string | null;
    isWorkforceMember: boolean;
    trustScore?: number;
  } | null;

  employerProfile?: {
    id: string;
    companyName?: string | null;
    location?: string | null;
    isVerified: boolean;
    verifiedAt?: string | null;
    trustScore?: number;
  } | null;

  createdAt: string;
  updatedAt: string;
};

export type AdminUserDetail = AdminUser & {
  workerProfile:
    | (NonNullable<AdminUser["workerProfile"]> & {
        workforceApplications: {
          id: string;
          status: string;
          createdAt: string;
          reviewedAt: string | null;
        }[];
        trustEvents: {
          id: string;
          source: string;
          delta: number;
          previousScore: number;
          newScore: number;
          reason: string;
          createdAt: string;
        }[];
      })
    | null;
  employerProfile:
    | (NonNullable<AdminUser["employerProfile"]> & {
        trustEvents: {
          id: string;
          source: string;
          delta: number;
          previousScore: number;
          newScore: number;
          reason: string;
          createdAt: string;
        }[];
      })
    | null;
  jobsPosted: {
    id: string;
    title: string;
    status: string;
    pay: string;
    locationName: string;
    createdAt: string;
  }[];
  applications: {
    id: string;
    status: string;
    createdAt: string;
    job: {
      id: string;
      title: string;
      status: string;
      pay: string;
      locationName: string;
    };
  }[];
  uploads: {
    id: string;
    purpose: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
  }[];
  sessions: {
    id: string;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: string;
    expiresAt: string;
  }[];
  verifiedByAdmin: { id: string; fullName: string; email: string } | null;
};

export type AdminUsersMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminUsersResponse = {
  data: AdminUser[];
  meta: AdminUsersMeta;
};

export type GetSuperAdminUsersParams = {
  role?: UserRole;
  isVerified?: boolean | string;
  isWorkforce?: boolean | string;
  profileType?: UserProfileType;
  search?: string;
  page?: number;
  limit?: number;
};

function normalizeBooleanParam(value?: boolean | string) {
  if (value === undefined || value === "" || value === "ALL") return undefined;
  if (typeof value === "boolean") return String(value);
  return value;
}

export async function getSuperAdminUsers(params?: GetSuperAdminUsersParams) {
  const { data } = await api.get<AdminUsersResponse>("/admin/super/users", {
    params: {
      ...params,
      isVerified: normalizeBooleanParam(params?.isVerified),
      isWorkforce: normalizeBooleanParam(params?.isWorkforce),
    },
  });

  return data;
}

export async function getSuperAdminUser(id: string) {
  const { data } = await api.get<AdminUserDetail>(`/admin/super/users/${id}`);
  return data;
}

export async function verifySuperAdminUser(id: string) {
  const { data } = await api.patch<AdminUser>(`/admin/super/users/${id}/verify`);
  return data;
}