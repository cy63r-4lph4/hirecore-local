"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getSuperAdminWorkforceApplication,
  requestSuperAdminWorkforceDocuments,
  reviewSuperAdminWorkforceApplication,
  type RequestWorkforceDocumentsPayload,
  type ReviewWorkforceApplicationPayload,
  type SuperAdminWorkforceApplication,
  type WorkforceApplicationStatus,
} from "@/lib/api/super-admin/workforce";
import { toast } from "@/hooks/use-toast";

export function useSuperAdminWorkforceApplicationDetails(applicationId: string) {
  const [application, setApplication] =
    useState<SuperAdminWorkforceApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [requestingDocs, setRequestingDocs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    if (!applicationId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getSuperAdminWorkforceApplication(applicationId);
      setApplication(response);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load workforce application.",
      );
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  const reviewApplication = useCallback(
    async (payload: ReviewWorkforceApplicationPayload) => {
      if (!applicationId) return;

      try {
        setReviewing(true);

        const updated = await reviewSuperAdminWorkforceApplication(
          applicationId,
          payload,
        );

        setApplication(updated);

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
              : "Could not update this application.",
          variant: "destructive",
        });
      } finally {
        setReviewing(false);
      }
    },
    [applicationId],
  );

  const quickReviewApplication = useCallback(
    async (
      status: WorkforceApplicationStatus,
      reviewNote?: string,
    ) => {
      await reviewApplication({
        status,
        reviewNote,
      });
    },
    [reviewApplication],
  );

  const requestDocuments = useCallback(
    async (payload?: Partial<RequestWorkforceDocumentsPayload>) => {
      if (!applicationId) return;

      try {
        setRequestingDocs(true);

        await requestSuperAdminWorkforceDocuments(applicationId, {
          title: payload?.title || "Additional documents required",
          description:
            payload?.description ||
            "Please upload the missing documents required to complete your workforce verification.",
          requestedDocuments: payload?.requestedDocuments || [
            "Identity document",
            "Relevant proof of skill",
          ],
        });

        await fetchApplication();

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
        setRequestingDocs(false);
      }
    },
    [applicationId, fetchApplication],
  );

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  return {
    application,
    loading,
    error,
    reviewing,
    requestingDocs,
    refetch: fetchApplication,
    reviewApplication,
    quickReviewApplication,
    requestDocuments,
  };
}