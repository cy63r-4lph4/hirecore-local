// app/dashboard/admin/tasks/[taskId]/task-detail-admin-client.tsx
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Edit,
  MapPin,
  RefreshCw,
  User,
  Wallet,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from "lucide-react";

import { useAdminTaskDetail } from "@/hooks/useAdminTaskDetail";
import { Button } from "@/components/ui/button";
import { formatDate, cn } from "@/lib/utils";

export default function TaskDetailAdminClient({ taskId }: { taskId: string }) {
  const { task, applications, assignment, loading, error, refetch } = useAdminTaskDetail(taskId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pulling Task Manifest...</p>
      </div>
    );
  }

  if (error) return <div className="p-8 text-destructive font-bold bg-destructive/5 rounded-3xl border border-destructive/20">{error}</div>;
  if (!task) return <div className="p-8 text-muted-foreground italic">Manifest entry not found.</div>;

  const assignedWorker = task.assignedWorker || assignment;

  return (
    <div className="space-y-8 pb-20">
      {/* Navigation & Actions */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <Link
          href="/dashboard/admin/tasks"
          className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/40 transition-colors group-hover:border-primary/50 group-hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to Registry
        </Link>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={refetch} 
            className="h-11 rounded-xl border-border bg-card/40 backdrop-blur-md px-5"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button asChild className="h-11 rounded-xl px-6 font-bold shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href={`/dashboard/admin/tasks/${task.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modify Task
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Identity Header */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className={cn(
            "rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-tighter",
            task.status === "OPEN" ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_12px_rgba(34,197,94,0.15)]" : "bg-orange-500/10 text-orange-500 border-orange-500/20"
          )}>
            Status: {task.status}
          </div>
          <div className="rounded-full bg-primary/10 border border-primary/20 text-primary px-3 py-1 text-[10px] font-black uppercase tracking-tighter">
            Type: {task.assignmentType}
          </div>
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter sm:text-6xl uppercase leading-tight">
          {task.title}
        </h1>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">
          Task UUID: {task.id} • Registered {task.createdAt ? formatDate(task.createdAt) : "Recently"}
        </p>
      </section>

      {/* Bento Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Primary Specs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[2rem] border border-border bg-card/40 p-6 md:p-8 backdrop-blur-md">
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-primary mb-6 flex items-center gap-2">
              <Zap size={14} className="fill-primary" /> Task Specification
            </h2>
            <p className="text-sm md:text-base font-medium leading-relaxed text-foreground/80 mb-10">
              {task.description}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem icon={<Wallet className="h-4 w-4 text-primary" />} label="Pay Grade" value={`GHS ${task.pay}`} />
              <InfoItem icon={<MapPin className="h-4 w-4 text-primary" />} label="Deployment Zone" value={task.locationName || "Remote/Global"} />
              <InfoItem icon={<Briefcase className="h-4 w-4 text-primary" />} label="Market Visibility" value={task.locationVisibility || "Public"} />
              <InfoItem icon={<Calendar className="h-4 w-4 text-primary" />} label="Last Modified" value={task.updatedAt ? formatDate(task.updatedAt) : "N/A"} />
            </div>
          </div>

          {/* Benefits/Tags */}
          {task.benefits && (
            <div className="rounded-[2rem] border border-border bg-card/40 p-6 md:p-8 backdrop-blur-md">
              <h2 className="text-xs font-black uppercase tracking-[0.25em] text-primary mb-6">Added Perks</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(task.benefits).map(([key, value]) => (
                  <span key={key} className="rounded-xl bg-surface-soft border border-border px-4 py-2 text-[10px] font-bold uppercase tracking-tight">
                    {key}: <span className="text-primary ml-1">{String(value)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stakeholder Sidebar */}
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-border bg-card/40 p-6 md:p-8 backdrop-blur-md">
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-primary mb-6">Personnel</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-surface-soft border border-border flex items-center justify-center font-black text-primary">E</div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-tighter">Employer</p>
                  <p className="text-sm font-bold truncate italic">{task.employer?.fullName || "Unknown Entity"}</p>
                </div>
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center font-black",
                  assignedWorker ? "bg-primary text-primary-foreground" : "bg-surface-soft border border-border text-muted-foreground/30"
                )}>
                  {assignedWorker ? "W" : "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-tighter">Assigned Worker</p>
                  <p className={cn("text-sm font-bold truncate italic", !assignedWorker && "text-muted-foreground/40")}>
                    {assignedWorker?.fullName || "Awaiting Match"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-primary p-6 md:p-8 text-primary-foreground shadow-2xl relative overflow-hidden group">
            <ShieldCheck className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-black italic">Security Check</h3>
            <p className="mt-3 text-xs font-medium leading-relaxed opacity-90">All industrial tasks are subject to standard verification protocols. Ensure physical zones match GPS logs.</p>
          </div>
        </div>
      </div>

      {/* Applications Registry */}
      <section className="rounded-[2rem] border border-border bg-card/40 p-6 md:p-8 backdrop-blur-md">
        <h2 className="text-xs font-black uppercase tracking-[0.25em] text-primary mb-8">Application Log</h2>
        {applications.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-border/50 rounded-3xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Zero Entries Found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app: any) => (
              <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-background/40 border border-border gap-4 transition-all hover:bg-background/60">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-lg bg-surface-soft flex items-center justify-center text-[10px] font-black text-primary border border-border">A</div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight italic">
                      {app.user?.fullName || app.user?.email || app.fullName || "Unregistered Applicant"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase">{app.user?.email || "No email logged"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 justify-between border-t border-border/50 pt-3 sm:border-0 sm:pt-0">
                  <span className="text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full bg-surface-soft border border-border">
                    {app.status}
                  </span>
                  <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest hover:text-primary">
                    Profile <CheckCircle2 size={12} className="ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-background/30 p-4 transition-all hover:bg-background/50">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">
        {icon}
        {label}
      </div>
      <div className="text-sm font-black italic tracking-tight">{value}</div>
    </div>
  );
}