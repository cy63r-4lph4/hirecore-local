"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getSuperAdminWorkforceApplications,
  getSuperAdminWorkforceMembers,
  requestSuperAdminWorkforceDocuments,
  reviewSuperAdminWorkforceApplication,
  type GetSuperAdminWorkforceApplicationsParams,
  type GetSuperAdminWorkforceParams,
  type PaginatedResponse,
  type RequestWorkforceDocumentsPayload,
  type ReviewWorkforceApplicationPayload,
  type SuperAdminWorkforceApplication,
  type SuperAdminWorkforceMember,
  type WorkforceApplicationStatus,
} from "@/lib/api/super-admin/workforce";
import { toast } from "@/hooks/use-toast";

export function useSuperAdminWorkforceMembers(
  params: GetSuperAdminWorkforceParams = {},
) {
  const [data, setData] =
    useState<PaginatedResponse<SuperAdminWorkforceMember> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSuperAdminWorkforceMembers(params);
      setData(response);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load workforce members.",
      );
    } finally {
      setLoading(false);
    }
  }, [queryKey]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    data,
    members: data?.data ?? [],
    meta: data?.meta,
    loading,
    error,
    refetch: fetchMembers,
  };
}

export function useSuperAdminWorkforceApplications(
  params: GetSuperAdminWorkforceApplicationsParams = {},
) {
  const [data, setData] =
    useState<PaginatedResponse<SuperAdminWorkforceApplication> | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSuperAdminWorkforceApplications(params);
      setData(response);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load workforce applications.",
      );
    } finally {
      setLoading(false);
    }
  }, [queryKey]);

  const updateApplicationLocally = useCallback(
    (updated: SuperAdminWorkforceApplication) => {
      setData((current) => {
        if (!current) return current;

        return {
          ...current,
          data: current.data.map((application) =>
            application.id === updated.id ? updated : application,
          ),
        };
      });
    },
    [],
  );

  const reviewApplication = useCallback(
    async (id: string, payload: ReviewWorkforceApplicationPayload) => {
      try {
        setActionLoadingId(id);

        const updated = await reviewSuperAdminWorkforceApplication(id, payload);
        updateApplicationLocally(updated);

        toast({
          title: "Application updated",
          description: `Application moved to ${payload.status
            .toLowerCase()
            .replaceAll("_", " ")}.`,
        });
      } catch (err) {
        console.error(err);

        toast({
          title: "Review failed",
          description:
            err instanceof Error
              ? err.message
              : "Could not update workforce application.",
          variant: "destructive",
        });
      } finally {
        setActionLoadingId(null);
      }
    },
    [updateApplicationLocally],
  );

  const quickReviewApplication = useCallback(
    async (
      id: string,
      status: WorkforceApplicationStatus,
      reviewNote?: string,
    ) => {
      await reviewApplication(id, {
        status,
        reviewNote,
      });
    },
    [reviewApplication],
  );

  const requestDocuments = useCallback(
    async (id: string, payload?: Partial<RequestWorkforceDocumentsPayload>) => {
      try {
        setActionLoadingId(id);

        await requestSuperAdminWorkforceDocuments(id, {
          title: payload?.title || "Additional documents required",
          description:
            payload?.description ||
            "Please upload the missing documents required to complete your workforce verification.",
          requestedDocuments: payload?.requestedDocuments || [
            "Identity document",
            "Relevant proof of skill",
          ],
        });

        await fetchApplications();

        toast({
          title: "Documents requested",
          description: "The applicant has been asked to submit more documents.",
        });
      } catch (err) {
        console.error(err);

        toast({
          title: "Request failed",
          description:
            err instanceof Error
              ? err.message
              : "Could not request additional documents.",
          variant: "destructive",
        });
      } finally {
        setActionLoadingId(null);
      }
    },
    [fetchApplications],
  );

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    data,
    applications: data?.data ?? [],
    meta: data?.meta,
    loading,
    error,
    actionLoadingId,
    refetch: fetchApplications,
    reviewApplication,
    quickReviewApplication,
    requestDocuments,
  };
}