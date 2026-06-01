// src/hooks/useAdminTaskDetail.ts
"use client";

import { useEffect, useState } from "react";
import {
  getAdminTask,
  getAdminTaskApplications,
  getAdminTaskAssignment,
} from "@/lib/api/admin";

export function useAdminTaskDetail(id: string) {
  const [task, setTask] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [assignment, setAssignment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refetch() {
    setLoading(true);
    setError(null);

    try {
      const [taskData, applicationsData, assignmentData] = await Promise.all([
        getAdminTask(id),
        getAdminTaskApplications(id).catch(() => []),
        getAdminTaskAssignment(id).catch(() => null),
      ]);

      setTask(taskData);
      setApplications(
        Array.isArray(applicationsData)
          ? applicationsData
          : applicationsData.items || [],
      );
      setAssignment(assignmentData);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setError(err.response?.data?.message || "Could not load task detail");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refetch();
  }, [id]);

  return {
    task,
    applications,
    assignment,
    loading,
    error,
    notFound,
    refetch,
  };
}