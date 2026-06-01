// src/hooks/super-admin/use-super-admin-tasks.ts

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getSuperAdminTasks,
  type GetSuperAdminTasksParams,
  type SuperAdminTasksResponse,
} from "@/lib/api/super-admin/tasks";

export function useSuperAdminTasks(params: GetSuperAdminTasksParams = {}) {
  const [data, setData] = useState<SuperAdminTasksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSuperAdminTasks(params);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [queryKey]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    data,
    tasks: data?.data ?? [],
    meta: data?.meta,
    loading,
    error,
    refetch: fetchTasks,
  };
}