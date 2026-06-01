"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveAdminTask,
  createAdminTask,
  getAdminTasks,
  rejectAdminTask,
  type AdminTask,
  type AdminTasksResponse,
  type CreateAdminTaskPayload,
  type GetAdminTasksParams,
  type RejectAdminTaskPayload,
} from "@/lib/api/admin/tasks";
import { toast } from "@/hooks/use-toast";

export function useAdminTasks(params: GetAdminTasksParams = {}) {
  const [data, setData] = useState<AdminTasksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminTasks(params);
      setData(response);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [queryKey]);

  const updateTaskLocally = useCallback((updated: AdminTask) => {
    setData((current) => {
      if (!current) return current;

      return {
        ...current,
        data: current.data.map((task) =>
          task.id === updated.id ? updated : task,
        ),
      };
    });
  }, []);

  const createTask = useCallback(
    async (payload: CreateAdminTaskPayload) => {
      try {
        setCreating(true);

        await createAdminTask(payload);
        await fetchTasks();

        toast({
          title: "Task created",
          description: "The HireCore-assigned task has been created.",
        });
      } catch (err) {
        console.error(err);

        toast({
          title: "Create failed",
          description:
            err instanceof Error ? err.message : "Could not create task.",
          variant: "destructive",
        });
      } finally {
        setCreating(false);
      }
    },
    [fetchTasks],
  );

  const approveTask = useCallback(
    async (id: string) => {
      try {
        setActionLoadingId(id);

        const updated = await approveAdminTask(id);
        updateTaskLocally(updated);

        toast({
          title: "Task approved",
          description: "The task is now open.",
        });
      } catch (err) {
        console.error(err);

        toast({
          title: "Approval failed",
          description:
            err instanceof Error ? err.message : "Could not approve task.",
          variant: "destructive",
        });
      } finally {
        setActionLoadingId(null);
      }
    },
    [updateTaskLocally],
  );

  const rejectTask = useCallback(
    async (id: string, payload: RejectAdminTaskPayload = {}) => {
      try {
        setActionLoadingId(id);

        const updated = await rejectAdminTask(id, payload);
        updateTaskLocally(updated);

        toast({
          title: "Task rejected",
          description: "The task has been rejected.",
        });
      } catch (err) {
        console.error(err);

        toast({
          title: "Rejection failed",
          description:
            err instanceof Error ? err.message : "Could not reject task.",
          variant: "destructive",
        });
      } finally {
        setActionLoadingId(null);
      }
    },
    [updateTaskLocally],
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    data,
    tasks: data?.data ?? [],
    meta: data?.meta,
    loading,
    error,
    creating,
    actionLoadingId,
    refetch: fetchTasks,
    createTask,
    approveTask,
    rejectTask,
  };
}