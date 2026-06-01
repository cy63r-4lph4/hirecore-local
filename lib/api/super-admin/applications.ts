import { api } from "@/lib/api/axios";
import type { SuperAdminTask } from "./tasks";

export type ApplicationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETED";

export type SuperAdminApplication = {
  id: string;
  jobId: string;
  workerId: string;
  status: ApplicationStatus;
  message?: string | null;
  createdAt: string;
  updatedAt: string;

  job?: Pick<
    SuperAdminTask,
    "id" | "title" | "status" | "assignmentType" | "pay" | "locationName"
  >;

  worker?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    workerProfile?: {
      id: string;
      bio?: string | null;
      skills: string[];
      location?: string | null;
      isAvailable: boolean;
      isVerified: boolean;
      isWorkforceMember: boolean;
    } | null;
  };

  attachments?: {
    id: string;
    assetId: string;
    asset?: {
      id: string;
      originalName: string;
      mimeType: string;
      sizeBytes: number;
      createdAt: string;
    };
  }[];

  statusHistory?: {
    id: string;
    applicationId: string;
    status: ApplicationStatus;
    changedAt: string;
    note?: string | null;
  }[];
};

export type SuperAdminApplicationsResponse = {
  data: SuperAdminApplication[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type GetSuperAdminApplicationsParams = {
  status?: ApplicationStatus;
  jobId?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type UpdateApplicationStatusPayload = {
  status: ApplicationStatus;
  note?: string;
};

export async function getSuperAdminApplications(
  params?: GetSuperAdminApplicationsParams,
) {
  const { data } = await api.get<SuperAdminApplicationsResponse>(
    "/admin/super/applications",
    {
      params,
    },
  );

  return data;
}

export async function getSuperAdminApplication(id: string) {
  const { data } = await api.get<SuperAdminApplication>(
    `/admin/super/applications/${id}`,
  );

  return data;
}

export async function updateSuperAdminApplicationStatus(
  id: string,
  payload: UpdateApplicationStatusPayload,
) {
  const { data } = await api.patch<SuperAdminApplication>(
    `/admin/super/applications/${id}/status`,
    payload,
  );

  return data;
}