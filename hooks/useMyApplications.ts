"use client";

import { useCallback, useEffect, useState } from "react";
import { getMyApplications } from "@/lib/api/applications";

export function useMyApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMyApplications();

      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setApplications(items);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Could not load your applications.";

      setApplications([]);
      setError(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications,
  };
}