"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getSuperAdminTask,
  type SuperAdminTask,
} from "@/lib/api/super-admin/tasks";

import {
  getSuperAdminApplications,
  updateSuperAdminApplicationStatus,
  type ApplicationStatus,
  type SuperAdminApplication,
} from "@/lib/api/super-admin/applications";

import { toast } from "@/hooks/use-toast";

export function useSuperAdminTaskDetails(taskId: string) {
  const [task, setTask] = useState<SuperAdminTask | null>(null);
  const [applications, setApplications] = useState<SuperAdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingApplicationId, setUpdatingApplicationId] = useState<
    string | null
  >(null);

  const fetchTaskDetails = useCallback(async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      setError(null);

      const [taskResponse, applicationsResponse] = await Promise.all([
        getSuperAdminTask(taskId),
        getSuperAdminApplications({
          jobId: taskId,
          page: 1,
          limit: 50,
        }),
      ]);

      setTask(taskResponse);
      setApplications(applicationsResponse.data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Failed to load task details.",
      );
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const changeApplicationStatus = useCallback(
    async (applicationId: string, status: ApplicationStatus, note?: string) => {
      try {
        setUpdatingApplicationId(applicationId);

        const updatedApplication = await updateSuperAdminApplicationStatus(
          applicationId,
          {
            status,
            note,
          },
        );

        setApplications((current) =>
          current.map((application) =>
            application.id === applicationId ? updatedApplication : application,
          ),
        );

        toast({
          title: "Application updated",
          description: `Application marked as ${status
            .toLowerCase()
            .replaceAll("_", " ")}.`,
        });
      } catch (err) {
        console.error(err);

        toast({
          title: "Update failed",
          description:
            err instanceof Error
              ? err.message
              : "Could not update application status.",
          variant: "destructive",
        });
      } finally {
        setUpdatingApplicationId(null);
      }
    },
    [],
  );

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  return {
    task,
    applications,
    loading,
    error,
    updatingApplicationId,
    refetch: fetchTaskDetails,
    changeApplicationStatus,
  };
}