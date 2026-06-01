// app/dashboard/admin/workforce/workforce-client.tsx
"use client";

import { useState } from "react";
import { Search, MapPin, Phone, Mail, UserCheck, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

import { Input } from "@/components/ui/input";
import EmptyState from "@/components/shared/empty-state";
import { formatDate, cn } from "@/lib/utils";
import { useUsers } from "@/hooks/useUsers";

export default function WorkforceClient() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { users, loading, error } = useUsers({
    role: "WORKER",
    isWorkforce: true,
  });

  const members = users as any[];

  const filtered = members.filter((member) => {
    const q = search.toLowerCase();
    const app = (member.workforceApplications || member.workforce_applications || [])[0];
    const name = member.fullName || member.full_name || "";

    return (
      name.toLowerCase().includes(q) ||
      member.email.toLowerCase().includes(q) ||
      (app?.location || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">Querying Personnel Registry...</p>
      </div>
    );
  }

  if (error) return <div className="p-6 text-destructive font-bold">{error}</div>;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Workforce Directory</p>
          <h1 className="text-4xl font-black tracking-tight italic sm:text-5xl">Verified Personnel</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Manage the active-duty workforce and audit professional credentials.
          </p>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search registry by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 pl-11 rounded-2xl border-border bg-card/40 backdrop-blur-md focus:ring-primary/20"
          />
        </div>
      </section>

      {filtered.length === 0 ? (
        <EmptyState
          title="No Personnel Found"
          description={search ? "Adjust your search parameters." : "Approved workforce members will appear here."}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((member) => {
            const app = (member.workforceApplications || member.workforce_applications || [])[0];
            const name = member.fullName || member.full_name || "Unnamed";
            const isExpanded = expandedId === member.id;

            return (
              <div
                key={member.id}
                onClick={() => setExpandedId(isExpanded ? null : member.id)}
                className={cn(
                  "group cursor-pointer rounded-[2rem] border border-border bg-card/40 p-6 transition-all backdrop-blur-md",
                  "hover:bg-card/60 hover:border-primary/30",
                  isExpanded && "ring-1 ring-primary/40 border-primary/40 bg-card/80"
                )}
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-black text-sm uppercase tracking-tight truncate">{name}</p>
                        <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate font-medium">
                        <Mail className="h-2.5 w-2.5" />
                        {member.email}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {app && (
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
                    {app.location && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground/80">
                        <MapPin className="h-3 w-3 text-primary" />
                        {app.location}
                      </div>
                    )}
                    {app.phone && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground/80">
                        <Phone className="h-3 w-3 text-primary" />
                        {app.phone}
                      </div>
                    )}
                  </div>
                )}

                {isExpanded && app?.skills && (
                  <div className="mt-5 pt-5 border-t border-border/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary mb-3">Skill Matrix</p>
                      <div className="flex flex-wrap gap-1.5">
                        {app.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="rounded-lg bg-surface-soft border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-muted-foreground/50 border-t border-border/20 pt-4">
                      <span>Verified Status</span>
                      <span className="flex items-center gap-1 text-primary">
                        <UserCheck size={12} />
                        Active Workforce
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}