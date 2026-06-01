import { api } from "@/lib/api/axios";

export type WorkforceApplicationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "NEEDS_DOCUMENTS"
  | "APPROVED"
  | "REJECTED";

export type WorkforceDocumentRequestStatus = "OPEN" | "SUBMITTED" | "CANCELLED";

export type SuperAdminWorkforceMember = {
  id: string;
  userId: string;
  bio?: string | null;
  skills: string[];
  location?: string | null;
  isAvailable: boolean;
  isVerified: boolean;
  verifiedAt?: string | null;
  isWorkforceMember: boolean;
  trustScore: number;
  createdAt: string;
  updatedAt: string;

  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    verifiedAt?: string | null;
    createdAt: string;
    profileImageAsset?: {
      id: string;
      originalName: string;
      mimeType: string;
    } | null;
  };

  workforceApplications?: {
    id: string;
    status: WorkforceApplicationStatus;
    createdAt: string;
    reviewedAt?: string | null;
  }[];
};

export type SuperAdminWorkforceApplication = {
  id: string;
  workerProfileId: string;
  status: WorkforceApplicationStatus;
  message?: string | null;
  experience?: string | null;
  portfolioUrl?: string | null;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  reviewedByAdminId?: string | null;
  createdAt: string;
  updatedAt: string;

  workerProfile: {
    id: string;
    bio?: string | null;
    skills: string[];
    location?: string | null;
    isAvailable: boolean;
    isVerified: boolean;
    isWorkforceMember: boolean;
    trustScore: number;
    user: {
      id: string;
      fullName: string;
      email: string;
      phoneNumber?: string | null;
      verifiedAt?: string | null;
    };
  };

  reviewedByAdmin?: {
    id: string;
    fullName: string;
    email: string;
  } | null;

  documentRequests?: {
    id: string;
    title: string;
    description?: string | null;
    requestedDocuments: string[];
    status: WorkforceDocumentRequestStatus;
    submittedMessage?: string | null;
    submittedAt?: string | null;
    createdAt: string;
    updatedAt: string;
  }[];

  statusHistory?: {
    id: string;
    workforceApplicationId: string;
    status: WorkforceApplicationStatus;
    changedByAdminId?: string | null;
    changedAt: string;
    note?: string | null;
    changedByAdmin?: {
      id: string;
      fullName: string;
      email: string;
    } | null;
  }[];
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type GetSuperAdminWorkforceParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export type GetSuperAdminWorkforceApplicationsParams = {
  status?: WorkforceApplicationStatus;
  search?: string;
  page?: number;
  limit?: number;
};

export type ReviewWorkforceApplicationPayload = {
  status: WorkforceApplicationStatus;
  reviewNote?: string;
};

export type RequestWorkforceDocumentsPayload = {
  title: string;
  description?: string;
  requestedDocuments?: string[];
};

export async function getSuperAdminWorkforceMembers(
  params?: GetSuperAdminWorkforceParams,
) {
  const { data } = await api.get<PaginatedResponse<SuperAdminWorkforceMember>>(
    "/admin/super/workforce",
    {
      params,
    },
  );

  return data;
}

export async function getSuperAdminWorkforceApplications(
  params?: GetSuperAdminWorkforceApplicationsParams,
) {
  const { data } = await api.get<
    PaginatedResponse<SuperAdminWorkforceApplication>
  >("/admin/super/workforce/applications", {
    params,
  });

  return data;
}

export async function getSuperAdminWorkforceApplication(id: string) {
  const { data } = await api.get<SuperAdminWorkforceApplication>(
    `/admin/super/workforce/applications/${id}`,
  );

  return data;
}

export async function reviewSuperAdminWorkforceApplication(
  id: string,
  payload: ReviewWorkforceApplicationPayload,
) {
  const { data } = await api.patch<SuperAdminWorkforceApplication>(
    `/admin/super/workforce/applications/${id}/review`,
    payload,
  );

  return data;
}

export async function requestSuperAdminWorkforceDocuments(
  id: string,
  payload: RequestWorkforceDocumentsPayload,
) {
  const { data } = await api.post(
    `/admin/super/workforce/applications/${id}/request-documents`,
    payload,
  );

  return data;
}