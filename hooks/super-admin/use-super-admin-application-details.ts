"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getSuperAdminApplication,
  updateSuperAdminApplicationStatus,
  type ApplicationStatus,
  type SuperAdminApplication,
} from "@/lib/api/super-admin/applications";

import { toast } from "@/hooks/use-toast";

export function useSuperAdminApplicationDetails(applicationId: string) {
  const [application, setApplication] = useState<SuperAdminApplication | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    if (!applicationId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getSuperAdminApplication(applicationId);
      setApplication(response);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load application details.",
      );
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  const changeStatus = useCallback(
    async (status: ApplicationStatus, note?: string) => {
      if (!applicationId) return;

      try {
        setUpdatingStatus(true);

        const updatedApplication = await updateSuperAdminApplicationStatus(
          applicationId,
          {
            status,
            note,
          },
        );

        setApplication(updatedApplication);

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
        setUpdatingStatus(false);
      }
    },
    [applicationId],
  );

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  return {
    application,
    loading,
    error,
    updatingStatus,
    refetch: fetchApplication,
    changeStatus,
  };
}