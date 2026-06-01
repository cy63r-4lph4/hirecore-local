// app/dashboard/admin/page.tsx
"use client";

import { Activity, BriefcaseBusiness, CheckCircle2, Plus, Users, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function MetricCard({ label, value, helper, icon: Icon }: any) {
  return (
    <div className="group relative rounded-[2rem] border border-border bg-card/40 p-5 md:p-6 transition-all hover:bg-card/70 hover:border-primary/30">
      <div className="flex justify-between items-start">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
          <Icon size={20} />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
          <TrendingUp size={10} /> +5%
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-2xl md:text-3xl font-black tracking-tighter">{value}</h3>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mt-1">{label}</p>
        <p className="mt-4 text-[10px] font-medium text-muted-foreground/60 italic border-t border-border/50 pt-3">{helper}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 md:space-y-10">
      {/* Header section - stacks on mobile */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-primary">Operations Center</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight italic break-words">Command Room</h1>
          <p className="text-muted-foreground max-w-xl text-sm md:text-base">Monitor fulfillment velocity and workforce health from one console.</p>
        </div>
        <Link href="/dashboard/admin/tasks/new" className="w-full sm:w-auto">
          <Button className="h-14 w-full sm:w-auto px-8 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20">
            <Plus className="mr-2 h-5 w-5" /> Launch Task
          </Button>
        </Link>
      </section>

      {/* Metrics - 1 col on mobile, 2 on tablet, 4 on desktop */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Open Tasks" value="42" helper="Ready for matching" icon={BriefcaseBusiness} />
        <MetricCard label="Total Flux" value="1,204" helper="System volume" icon={Activity} />
        <MetricCard label="Verified" value="850" helper="Trusted professionals" icon={Users} />
        <MetricCard label="Review Queue" value="12" helper="Pending action" icon={CheckCircle2} />
      </section>

      {/* Main Bento Grid - Stacks vertically on mobile */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-[2rem] border border-border bg-card/40 p-5 md:p-8 backdrop-blur-md overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl md:text-2xl font-black italic">Live Task Stream</h3>
            <Link href="/dashboard/admin/tasks" className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">View All</Link>
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 rounded-[1.5rem] bg-background/40 border border-border gap-4 transition-all hover:bg-background/80 hover:border-primary/20">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-2xl bg-surface-soft border border-border flex items-center justify-center font-black text-primary">T</div>
                  <div className="min-w-0">
                    <p className="text-sm font-black uppercase tracking-tight truncate">Express Delivery Route</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground truncate italic">Greater Accra · Instant Assignment</p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
                  <p className="text-sm font-black tracking-tighter">GHS 250.00</p>
                  <p className="text-[10px] font-bold text-primary uppercase">Open</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-border bg-card/40 p-6 md:p-8 backdrop-blur-md">
             <h3 className="text-lg font-black mb-6 italic text-primary">Application Pipeline</h3>
             <div className="space-y-6">
               {[1, 2].map(i => (
                 <div key={i} className="flex gap-4 min-w-0">
                   <div className="h-2 w-2 shrink-0 rounded-full bg-primary mt-1.5 shadow-[0_0_8px_hsl(var(--primary))]" />
                   <div className="min-w-0">
                     <p className="text-sm font-bold truncate">Kofi Mensah</p>
                     <p className="text-[10px] text-muted-foreground mt-0.5 truncate uppercase tracking-tighter">Applying for Logistics</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>

          <div className="rounded-[2rem] bg-primary p-6 md:p-8 text-primary-foreground shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles size={120} />
            </div>
            <h3 className="text-lg font-black italic">Ops Insight</h3>
            <p className="mt-3 text-xs md:text-sm font-medium leading-relaxed opacity-90">Efficiency is up 14%. Review the queue to maintain fulfillment speed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}