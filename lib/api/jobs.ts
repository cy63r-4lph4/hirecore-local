import { api } from "@/lib/api/axios";

export type JobStatus =
  | "OPEN"
  | "CLOSED"
  | "PENDING_APPROVAL"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED"
  | "IN_PROGRESS";

export type AssignmentType = "OPEN" | "HIRECORE_ASSIGNED";

export interface JobsQuery {
  page?: number;
  limit?: number;
  status?: JobStatus;
  assignmentType?: AssignmentType;
  locationName?: string;
  keyword?: string;
}

export type LocationVisibility = "PUBLIC" | "APPROXIMATE" | "PRIVATE";

export interface EmployerProfile {
  id: string;
  companyName: string;
  location: string;
  isVerified: boolean;
  trustScore: number;
}

export interface Employer {
  id: string;
  fullName: string;
  employerProfile: EmployerProfile | null;
}

export interface WorkerProfile {
  id: string;
  isVerified: boolean;
  isWorkforceMember: boolean;
  trustScore: number;
}

export interface AssignedWorker {
  id: string;
  fullName: string;
  workerProfile: WorkerProfile | null;
}

export interface JobViewerContext {
  hasApplied: boolean;
  myApplication: any | null; // Replace 'any' with your explicit Application type if available
}

export interface Job {
  id: string;
  title: string;
  description: string;
  pay: string | number; // Backed up as a string in payload data, parsed comfortably as currency
  benefits: string[];
  locationName: string;
  locationLat: number | null;
  locationLng: number | null;
  locationVisibility: LocationVisibility;
  assignmentType: AssignmentType;
  status: JobStatus;
  employer: Employer;
  assignedWorker: AssignedWorker | null; // Explicitly nullable if open marketplace
  applicationCount: number;
  viewer: JobViewerContext;
  createdAt: string; // ISO 8601 Date String
  updatedAt: string; // ISO 8601 Date String
}

export interface APIPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface JobsResponse {
  data: Job[];
  meta: APIPaginationMeta;
}

export async function getJobs(params?: JobsQuery) {
  const { data } = await api.get("/jobs", { params });
  return data;
}

export async function getJob(id: string) {
  const { data } = await api.get(`/jobs/${id}`);
  return data;
}

export async function createJob(payload: unknown) {
  const { data } = await api.post("/jobs", payload);
  return data;
}
