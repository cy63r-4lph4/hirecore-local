"use client";

import { useEffect, useMemo, useState } from "react";
import { getWorkers, WorkersQuery } from "@/lib/api/workers";

type WorkersMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function useWorkers(params?: WorkersQuery) {
  const [workers, setWorkers] = useState<any[]>([]);
  const [meta, setMeta] = useState<WorkersMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(() => JSON.stringify(params ?? {}), [params]);

  useEffect(() => {
    let alive = true;

    const parsedParams = JSON.parse(key) as WorkersQuery;

    setLoading(true);
    setError(null);

    getWorkers(parsedParams)
      .then((response) => {
        if (!alive) return;

        setWorkers(Array.isArray(response?.data) ? response.data : []);
        setMeta(response?.meta ?? null);
      })
      .catch((err) => {
        if (!alive) return;

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Could not load workers";

        setWorkers([]);
        setMeta(null);
        setError(Array.isArray(message) ? message.join(", ") : message);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [key]);

  return {
    workers,
    meta,
    loading,
    error,
  };
}