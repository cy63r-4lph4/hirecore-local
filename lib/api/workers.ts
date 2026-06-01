import { api } from "@/lib/api/axios";

export type WorkersQuery = {
  keyword?: string;
  location?: string;
  available?: boolean;
  verified?: boolean;
  workforce?: boolean;
  page?: number;
  limit?: number;
};

export async function getWorkers(params?: WorkersQuery) {
  const { data } = await api.get("/users/workers", { params });
  return data;
}

export async function getPublicProfile(id: string) {
  const { data } = await api.get(`/users/${id}/profile`);
  return data;
}
