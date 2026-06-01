// src/hooks/super-admin/use-super-admin-users.ts

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AdminUsersResponse,
  getSuperAdminUsers,
  GetSuperAdminUsersParams,
} from "@/lib/api/super-admin";

export function useSuperAdminUsers(params: GetSuperAdminUsersParams) {
  const [data, setData] = useState<AdminUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSuperAdminUsers(params);
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load super admin users.",
      );
    } finally {
      setLoading(false);
    }
  }, [queryKey, params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    data,
    users: data?.data ?? [],
    meta: data?.meta,
    loading,
    error,
    refetch: fetchUsers,
  };
}