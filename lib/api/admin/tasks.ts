import { api } from "@/lib/api/axios";

export type JobStatus = "OPEN" | "CLOSED" | "PENDING_APPROVAL" | "REJECTED";

export type AssignmentType = "OPEN" | "HIRECORE_ASSIGNED";

export type LocationVisibility = "HIDDEN" | "APPROXIMATE" | "PUBLIC";

export type AdminTask = {
  id: string;
  title: string;
  description: string;
  pay: string | number;
  benefits: string[];
  locationName: string;
  locationLat?: number | null;
  locationLng?: number | null;
  locationVisibility: LocationVisibility;
  assignmentType: AssignmentType;
  status: JobStatus;
  employerId: string;
  assignedWorkerId?: string | null;
  approvedByAdminId?: string | null;
  moderatedByAdminId?: string | null;
  moderationNote?: string | null;
  createdAt: string;
  updatedAt: string;

  employer?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    employerProfile?: {
      id: string;
      companyName?: string | null;
      location?: string | null;
      isVerified: boolean;
      trustScore: number;
    } | null;
  };

  assignedWorker?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
  } | null;

  _count?: {
    applications: number;
  };
};

export type AdminTasksResponse = {
  data: AdminTask[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type GetAdminTasksParams = {
  status?: JobStatus;
  assignmentType?: AssignmentType;
  search?: string;
  page?: number;
  limit?: number;
};

export type CreateAdminTaskPayload = {
  title: string;
  description: string;
  pay: string | number;
  benefits?: string[];
  locationName: string;
  locationLat?: number | null;
  locationLng?: number | null;
  locationVisibility?: LocationVisibility;
  assignmentType?: AssignmentType;
  employerId?: string;
};

export type RejectAdminTaskPayload = {
  moderationNote?: string;
};

export async function getAdminTasks(params?: GetAdminTasksParams) {
  const { data } = await api.get<AdminTasksResponse>("/admin/jobs", {
    params,
  });

  return data;
}

export async function getAdminTask(id: string) {
  const { data } = await api.get<AdminTask>(`/admin/jobs/${id}`);
  return data;
}

export async function createAdminTask(payload: CreateAdminTaskPayload) {
  const { data } = await api.post<AdminTask>("/admin/jobs", {
    ...payload,
    assignmentType: payload.assignmentType || "HIRECORE_ASSIGNED",
    locationVisibility: payload.locationVisibility || "APPROXIMATE",
  });

  return data;
}

export async function approveAdminTask(id: string) {
  const { data } = await api.patch<AdminTask>(`/admin/jobs/${id}/approve`);
  return data;
}

export async function rejectAdminTask(
  id: string,
  payload: RejectAdminTaskPayload,
) {
  const { data } = await api.patch<AdminTask>(
    `/admin/jobs/${id}/reject`,
    payload,
  );

  return data;
}