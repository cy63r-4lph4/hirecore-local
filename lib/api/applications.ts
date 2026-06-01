import { api } from "@/lib/api/axios";

export type CreateApplicationPayload = {
  jobId: string;
  message?: string;
  assetIds?: string[];
};

export async function applyForJob(payload: CreateApplicationPayload) {
  const { data } = await api.post("/applications", payload);
  return data;
}

export async function getMyApplications() {
  const { data } = await api.get("/applications/my");
  return data;
}