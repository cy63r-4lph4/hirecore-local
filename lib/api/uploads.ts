import { api } from "@/lib/api/axios";
import { SuperAdminUpload } from "./super-admin";

export type UploadPurpose =
  | "JOB_APPLICATION_ATTACHMENT"
  | "WORKFORCE_APPLICATION_ATTACHMENT"
  | "WORKFORCE_DOCUMENT_REQUEST";

export async function uploadFiles(
  files: File[],
  purpose: UploadPurpose,
  onProgress?: (progress: number) => void,
) {
  const formData = new FormData();

  formData.append("purpose", purpose);

  files.forEach((file) => {
    formData.append("files", file);
  });

  const { data } = await api.post("/uploads", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (event) => {
      if (!event.total) return;

      const progress = Math.round((event.loaded * 100) / event.total);
      onProgress?.(progress);
    },
  });

  return data;
}

export function getUploadPreviewUrl(id: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "";

  return `${baseUrl}/uploads/${id}/view`;
}

export async function getSuperAdminUpload(id: string) {
  const { data } = await api.get<SuperAdminUpload>(
    `/admin/super/uploads/${id}`,
  );

  return data;
}