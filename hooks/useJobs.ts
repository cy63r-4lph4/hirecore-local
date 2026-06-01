"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getJobs, JobsQuery } from "@/lib/api/jobs";

type JobsMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function useJobs(params?: JobsQuery) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [meta, setMeta] = useState<JobsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(() => JSON.stringify(params ?? {}), [params]);

  const fetchJobs = useCallback(async () => {
    let parsedParams: JobsQuery = {};

    try {
      parsedParams = JSON.parse(key) as JobsQuery;
    } catch {
      parsedParams = params ?? {};
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getJobs(parsedParams);

      setJobs(Array.isArray(response?.data) ? response.data : []);
      setMeta(response?.meta ?? null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Could not load tasks";

      setJobs([]);
      setMeta(null);
      setError(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    meta,
    loading,
    error,
    refetch: fetchJobs,
    setJobs,
  };
}