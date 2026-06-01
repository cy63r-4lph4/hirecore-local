import { api } from "@/lib/api/axios";

export async function createAdmin(payload: {
  fullName: string;
  email: string;
  temporaryPassword: string;
  phoneNumber?: string;
}) {
  const { data } = await api.post("/admin/users/admins", payload);
  return data;
}

export async function approveJob(id: string) {
  const { data } = await api.patch(`/admin/jobs/${id}/approve`);
  return data;
}

export async function verifyUser(id: string) {
  const { data } = await api.patch(`/admin/users/${id}/verify`);
  return data;
}

export async function assignWorker(jobId: string, workerId: string) {
  const { data } = await api.post(`/admin/jobs/${jobId}/assign-worker`, {
    workerId,
  });
  return data;
}

// Admin task detail APIs
export async function getAdminTask(id: string) {
  const { data } = await api.get(`/jobs/${id}`);
  return data;
}

export async function getAdminTaskApplications(id: string) {
  const { data } = await api.get(`/admin/jobs/${id}/applications`);
  return data;
}

export async function getAdminTaskAssignment(id: string) {
  const { data } = await api.get(`/admin/jobs/${id}/assignment`);
  return data;
}

export async function updateAdminTask(
  id: string,
  payload: {
    title: string;
    description: string;
    pay: number;
    location: string;
  },
) {
  const { data } = await api.patch(`/admin/jobs/${id}`, payload);
  return data;
}
