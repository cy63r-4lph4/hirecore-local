import { api } from "@/lib/api/axios";

export type JobStatus = "OPEN" | "CLOSED" | "PENDING_APPROVAL" | "REJECTED";

export type AssignmentType = "OPEN" | "HIRECORE_ASSIGNED";

export type LocationVisibility = "HIDDEN" | "APPROXIMATE" | "PUBLIC";

export type ApplicationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETED";

export type SuperAdminTask = {
  id: string;
  title: string;
  description: string;
  pay: string | number;
  benefits?: string[];
  locationName: string;
  locationLat?: number | null;
  locationLng?: number | null;
  locationVisibility?: LocationVisibility;
  assignmentType: AssignmentType;
  status: JobStatus;
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
      isVerified?: boolean;
      trustScore?: number;
    } | null;
  };

  assignedWorker?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    workerProfile?: {
      id: string;
      isVerified: boolean;
      isWorkforceMember: boolean;
      isAvailable: boolean;
      skills: string[];
    } | null;
  } | null;

  approvedByAdmin?: {
    id: string;
    fullName: string;
    email: string;
  } | null;

  moderatedByAdmin?: {
    id: string;
    fullName: string;
    email: string;
  } | null;

  _count?: {
    applications: number;
  };
};

export type SuperAdminTaskApplication = {
  id: string;
  message?: string | null;
  status: ApplicationStatus;
  note?: string | null;
  createdAt: string;
  updatedAt: string;

  worker?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    workerProfile?: {
      id: string;
      isVerified: boolean;
      isWorkforceMember: boolean;
      isAvailable: boolean;
      skills: string[];
      location?: string | null;
    } | null;
  } | null;

  job?: {
    id: string;
    title: string;
    status: JobStatus;
  };

  uploads?: {
    id: string;
    url: string;
    fileName?: string | null;
    originalName?: string | null;
    mimeType?: string | null;
    purpose?: string | null;
    createdAt?: string;
  }[];

  assets?: {
    id: string;
    url: string;
    fileName?: string | null;
    originalName?: string | null;
    mimeType?: string | null;
    purpose?: string | null;
    createdAt?: string;
  }[];
};

export type SuperAdminTasksResponse = {
  data: SuperAdminTask[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type SuperAdminApplicationsResponse = {
  data: SuperAdminTaskApplication[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type GetSuperAdminTasksParams = {
  status?: JobStatus;
  assignmentType?: AssignmentType;
  search?: string;
  page?: number;
  limit?: number;
};

export type GetSuperAdminApplicationsParams = {
  status?: ApplicationStatus;
  jobId?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type RejectTaskPayload = {
  moderationNote?: string;
};

export type AssignWorkerPayload = {
  workerId: string;
};

export type UpdateApplicationStatusPayload = {
  status: ApplicationStatus;
  note?: string;
};

export async function getSuperAdminTasks(params?: GetSuperAdminTasksParams) {
  const { data } = await api.get<SuperAdminTasksResponse>(
    "/admin/super/tasks",
    {
      params,
    },
  );

  return data;
}

export async function getSuperAdminTask(id: string) {
  const { data } = await api.get<SuperAdminTask>(`/admin/super/tasks/${id}`);
  return data;
}

export async function approveSuperAdminTask(id: string) {
  const { data } = await api.patch<SuperAdminTask>(
    `/admin/super/tasks/${id}/approve`,
  );

  return data;
}

export async function rejectSuperAdminTask(
  id: string,
  payload: RejectTaskPayload,
) {
  const { data } = await api.patch<SuperAdminTask>(
    `/admin/super/tasks/${id}/reject`,
    payload,
  );

  return data;
}

export async function assignWorkerToSuperAdminTask(
  id: string,
  payload: AssignWorkerPayload,
) {
  const { data } = await api.post<SuperAdminTask>(
    `/admin/super/tasks/${id}/assign-worker`,
    payload,
  );

  return data;
}

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

export async function getSuperAdminTaskApplications(taskId: string) {
  const response = await getSuperAdminApplications({
    jobId: taskId,
    page: 1,
    limit: 50,
  });

  return response;
}

export async function getSuperAdminApplication(id: string) {
  const { data } = await api.get<SuperAdminTaskApplication>(
    `/admin/super/applications/${id}`,
  );

  return data;
}

export async function updateSuperAdminApplicationStatus(
  id: string,
  payload: UpdateApplicationStatusPayload,
) {
  const { data } = await api.patch<SuperAdminTaskApplication>(
    `/admin/super/applications/${id}/status`,
    payload,
  );

  return data;
}