"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api/axios";

type UsersQuery = {
  role?: "SUPER_ADMIN" | "ADMIN" | "WORKER" | "EMPLOYER";
  isVerified?: boolean;
  isWorkforce?: boolean;
};

export function useUsers(params?: UsersQuery) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(() => JSON.stringify(params || {}), [params]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get("/admin/users", { params });
      setUsers(Array.isArray(data) ? data : data.items || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not load users");
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    setUsers,
  };
}