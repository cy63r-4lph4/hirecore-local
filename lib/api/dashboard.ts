import { api } from "@/lib/api/axios";

export async function getMyApplications() {
  const { data } = await api.get("/applications/my");
  return data;
}

export async function getOpenJobs() {
  const { data } = await api.get("/jobs", {
    params: {
      status: "OPEN",
      page: 1,
      limit: 6,
    },
  });

  return data;
}

export async function getWorkersPreview() {
  const { data } = await api.get("/users/workers", {
    params: {
      page: 1,
      limit: 6,
      available: true,
    },
  });

  return data;
}