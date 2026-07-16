"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminUserDetail,
  getSuperAdminUser,
} from "@/lib/api/super-admin/users";

export function useSuperAdminUser(userId: string | undefined) {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getSuperAdminUser(userId);
      setUser(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load user record.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
}