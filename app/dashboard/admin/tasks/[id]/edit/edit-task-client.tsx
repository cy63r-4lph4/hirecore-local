"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

import { toast } from "@/hooks/use-toast";
import { getAdminTask, updateAdminTask } from "@/lib/api/admin";

export default function EditTaskClient({ taskId }: { taskId: string }) {
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    pay: "",
    location: "",
  });

  useEffect(() => {
    let alive = true;

    async function loadTask() {
      try {
        const task = await getAdminTask(taskId);

        if (!alive) return;

        setForm({
          title: task.title || "",
          description: task.description || "",
          pay: String(task.pay || ""),
          location: task.location || task.locationName || "",
        });
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Could not load task",
          description:
            err.response?.data?.message || "Task data failed to load.",
        });
      } finally {
        if (alive) setPageLoading(false);
      }
    }

    loadTask();

    return () => {
      alive = false;
    };
  }, [taskId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.pay ||
      !form.location.trim()
    ) {
      toast({
        variant: "destructive",
        title: "Please fill in all required fields.",
      });
      return;
    }

    setSaving(true);

    try {
      await updateAdminTask(taskId, {
        title: form.title.trim(),
        description: form.description.trim(),
        pay: Number(form.pay),
        location: form.location.trim(),
      });

      toast({ title: "Task updated!" });

      router.push(`/dashboard/admin/tasks/${taskId}`);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description:
          err.response?.data?.message || err.message || "Could not update task.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return <div className="p-6">Loading task...</div>;
  }

  return (
    <div className="max-w-2xl p-6">
      <Link
        href={`/dashboard/admin/tasks/${taskId}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Task
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit Task</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the details for this task listing.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={5}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pay">Pay (GHS) *</Label>
              <Input
                id="pay"
                type="number"
                min="1"
                step="0.01"
                value={form.pay}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    pay: event.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="flex gap-3 border-t pt-2">
            <Button type="button" variant="outline" asChild>
              <Link href={`/dashboard/admin/tasks/${taskId}`}>Cancel</Link>
            </Button>

            <Button type="submit" variant="default" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}