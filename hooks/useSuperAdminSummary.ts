"use client";

import { useCallback, useEffect, useState } from "react";
import { getSuperAdminSummary } from "@/lib/api/super-admin/summary";

export function useSuperAdminSummary() {
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getSuperAdminSummary();
      setSummary(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Could not load super admin summary.";

      setError(Array.isArray(message) ? message.join(", ") : message);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    summary,
    loading,
    error,
    refetch,
  };
}
