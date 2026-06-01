// src/hooks/super-admin/use-super-admin-admins.ts

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getSuperAdminAdmins,
  type GetSuperAdminAdminsParams,
} from "@/lib/api/super-admin/admins";
import type { AdminUsersResponse } from "@/lib/api/super-admin/users";

export function useSuperAdminAdmins(params: GetSuperAdminAdminsParams) {
  const [data, setData] = useState<AdminUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSuperAdminAdmins(params);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admins.");
    } finally {
      setLoading(false);
    }
  }, [queryKey, params]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  return {
    data,
    admins: data?.data ?? [],
    meta: data?.meta,
    loading,
    error,
    refetch: fetchAdmins,
  };
}