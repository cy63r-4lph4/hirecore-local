// src/hooks/super-admin/use-super-admin-security.ts

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getSuperAdminSessions,
  type GetSuperAdminSessionsParams,
  type SuperAdminSessionsResponse,
} from "@/lib/api/super-admin/security";

export function useSuperAdminSessions(
  params: GetSuperAdminSessionsParams = {},
) {
  const [data, setData] = useState<SuperAdminSessionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSuperAdminSessions(params);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }, [queryKey]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    data,
    sessions: data?.data ?? [],
    meta: data?.meta,
    loading,
    error,
    refetch: fetchSessions,
  };
}