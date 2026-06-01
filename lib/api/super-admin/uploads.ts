import { api } from "@/lib/api/axios";
import type { UserRole } from "./users";

export type UploadPurpose =
  | "JOB_APPLICATION_ATTACHMENT"
  | "WORKFORCE_APPLICATION_ATTACHMENT"
  | "WORKFORCE_DOCUMENT_ATTACHMENT"
  | "PROFILE_IMAGE";

export type SuperAdminUpload = {
  id: string;
  ownerId: string;
  purpose: UploadPurpose;
  originalName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
  isAttached?: boolean;

  owner?: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
  };

  _count?: {
    applicationAttachments: number;
    workforceApplicationAttachments: number;
    workforceDocumentSubmissionAttachments: number;
    profileImageForUsers: number;
  };
};

export type SuperAdminUploadsResponse = {
  data: SuperAdminUpload[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type GetSuperAdminUploadsParams = {
  purpose?: UploadPurpose;
  search?: string;
  page?: number;
  limit?: number;
};

export async function getSuperAdminUploads(
  params?: GetSuperAdminUploadsParams,
) {
  const { data } = await api.get<SuperAdminUploadsResponse>(
    "/admin/super/uploads",
    {
      params,
    },
  );

  return data;
}

export async function getSuperAdminUpload(id: string) {
  const { data } = await api.get<SuperAdminUpload>(
    `/admin/super/uploads/${id}`,
  );

  return data;
}

export function getUploadPreviewUrl(id: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";

  return `${baseUrl}/uploads/${id}/view`;
}

export function getUploadDownloadUrl(id: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";

  return `${baseUrl}/uploads/${id}/download`;
}