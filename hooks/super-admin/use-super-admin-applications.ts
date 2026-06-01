// src/hooks/super-admin/use-super-admin-applications.ts

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getSuperAdminApplications,
  type GetSuperAdminApplicationsParams,
  type SuperAdminApplicationsResponse,
} from "@/lib/api/super-admin/applications";

export function useSuperAdminApplications(
  params: GetSuperAdminApplicationsParams = {},
) {
  const [data, setData] = useState<SuperAdminApplicationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSuperAdminApplications(params);
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load applications.",
      );
    } finally {
      setLoading(false);
    }
  }, [queryKey]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    data,
    applications: data?.data ?? [],
    meta: data?.meta,
    loading,
    error,
    refetch: fetchApplications,
  };
}