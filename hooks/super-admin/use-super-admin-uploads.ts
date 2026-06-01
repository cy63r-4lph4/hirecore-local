// src/hooks/super-admin/use-super-admin-uploads.ts

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getSuperAdminUploads,
  type GetSuperAdminUploadsParams,
  type SuperAdminUploadsResponse,
} from "@/lib/api/super-admin/uploads";

export function useSuperAdminUploads(
  params: GetSuperAdminUploadsParams = {},
) {
  const [data, setData] = useState<SuperAdminUploadsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchUploads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSuperAdminUploads(params);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load uploads.");
    } finally {
      setLoading(false);
    }
  }, [queryKey]);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  return {
    data,
    uploads: data?.data ?? [],
    meta: data?.meta,
    loading,
    error,
    refetch: fetchUploads,
  };

  
}

