import { api } from "@/lib/api/axios";

export async function getSuperAdminSummary() {
  const { data } = await api.get("/admin/super/summary");
  return data;
}


export type SuperAdminUserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export type SuperAdminUser = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  role: SuperAdminUserRole;
  createdAt: string;
  updatedAt: string;
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  verifiedAt?: string | null;
  workerProfile?: {
    id: string;
    trustScore: number;
    isAvailable: boolean;
    isVerified: boolean;
    isWorkforceMember: boolean;
    skills: string[];
    location?: string | null;
  } | null;
  employerProfile?: {
    id: string;
    companyName?: string | null;
    trustScore: number;
    isVerified: boolean;
    location?: string | null;
  } | null;
  profileImageAsset?: {
    id: string;
    mimeType: string;
    originalName: string;
  } | null;
};

export type SuperAdminUsersMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SuperAdminUsersSummary = {
  total: number;
  workers: number;
  employers: number;
  admins: number;
  superAdmins: number;
  emailVerified: number;
  phoneVerified: number;
  adminVerified: number;
  workforceMembers: number;
  unverified: number;
};

export type SuperAdminUsersResponse = {
  data: SuperAdminUser[];
  meta: SuperAdminUsersMeta;
  summary: SuperAdminUsersSummary;
};

 type GetSuperAdminUsersParams = {
  page?: number;
  limit?: number;
  keyword?: string;
  role?: SuperAdminUserRole | "ALL";
  category?:
    | "ALL"
    | "WORKERS"
    | "EMPLOYERS"
    | "ADMINS"
    | "WORKFORCE"
    | "UNVERIFIED"
    | "RECENT";
  verification?: "ALL" | "EMAIL_VERIFIED" | "PHONE_VERIFIED" | "ADMIN_VERIFIED" | "UNVERIFIED";
  sort?: "NEWEST" | "OLDEST" | "TRUST_HIGH" | "TRUST_LOW";
};

// export async function getSuperAdminUsers(params?: GetSuperAdminUsersParams) {
//   const { data } = await api.get<SuperAdminUsersResponse>("/admin/super/users", {
//     params,
//   });

//   return data;
// }