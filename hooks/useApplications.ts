"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/axios";

export function useApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get("/admin/applications");
      setApplications(Array.isArray(data) ? data : data.items || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications,
    setApplications,
  };
}