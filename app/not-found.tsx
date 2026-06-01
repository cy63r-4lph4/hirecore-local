"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Compass, Home, Sparkles, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-20 text-foreground">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glow orbs */}
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl" />

        {/* Noise */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('/noise.png')]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        {/* Floating icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />

          <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-border bg-card/80 shadow-[var(--shadow-lift)] backdrop-blur-xl">
            <SearchX className="h-12 w-12 text-primary" />
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="mt-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5" />
            Lost in the system
          </div>

          <h1 className="mt-8 text-6xl font-black tracking-tight sm:text-7xl md:text-8xl">
            404
          </h1>

          <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-4xl">
            This page drifted beyond the grid.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            The route you followed no longer exists, was moved, or never made it
            through deployment. Somewhere in the digital fog, a lonely endpoint
            is crying.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-12 flex flex-col gap-4 sm:flex-row"
        >
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-semibold text-primary-foreground shadow-[var(--glow-primary)] transition hover:scale-[1.02] hover:bg-primary/90"
          >
            <Home className="h-4 w-4 transition group-hover:scale-110" />
            Return Home
          </Link>

          <button
            onClick={() => router.back()}
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card/70 px-7 py-4 text-sm font-semibold backdrop-blur-xl transition hover:border-primary/40 hover:bg-card"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            Go Back
          </button>
        </motion.div>

        {/* Bottom card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="mt-16 w-full max-w-3xl rounded-[2rem] border border-border bg-card/70 p-6 shadow-[var(--shadow-card)] backdrop-blur-2xl"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4 text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Compass className="h-6 w-6" />
              </div>

              <div>
                <h3 className="font-black tracking-tight">
                  Navigation Recovery
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Try checking the URL, returning to the dashboard, or exploring
                  active sections of the platform.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
