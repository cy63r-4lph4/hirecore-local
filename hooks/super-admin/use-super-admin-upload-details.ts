"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getSuperAdminUpload,
  type SuperAdminUpload,
} from "@/lib/api/super-admin/uploads";

export function useSuperAdminUploadDetails(uploadId: string) {
  const [upload, setUpload] = useState<SuperAdminUpload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpload = useCallback(async () => {
    if (!uploadId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getSuperAdminUpload(uploadId);
      setUpload(response);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Failed to load upload details.",
      );
    } finally {
      setLoading(false);
    }
  }, [uploadId]);

  useEffect(() => {
    fetchUpload();
  }, [fetchUpload]);

  return {
    upload,
    loading,
    error,
    refetch: fetchUpload,
  };
}
