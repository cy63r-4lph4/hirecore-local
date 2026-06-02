"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  cubicBezier,
  useMotionValue,
  useMotionTemplate,
  useSpring,
} from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Hero from "@/components/shared/hero";
import SectionDivider from "@/components/shared/section-divider";
import { InfiniteScroller } from "@/components/shared/infinite-scroller";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: cubicBezier(0.22, 1, 0.36, 1) },
};

const springConfig = { stiffness: 150, damping: 22, mass: 0.6 };

const WORK_TYPES = [
  { name: "Gardener", image: "/images/work-types/gardener.jpeg" },
  { name: "Carpenter", image: "/images/work-types/carpenter.jpeg" },
  { name: "Electrician", image: "/images/work-types/electrician.jpeg" },
  { name: "Delivery Rider", image: "/images/work-types/delivery-rider.jpeg" },
  { name: "Caretaker", image: "/images/work-types/caretaker.jpeg" },
  { name: "Seamstress", image: "/images/work-types/seamstress.jpeg" },
  { name: "Driver", image: "/images/work-types/driver.jpeg" },
  { name: "Cook", image: "/images/work-types/cook.jpeg" },
];

// Extracted Sub-component for individual card tracking logic
function WorkTypeCard({
  type,
  index,
}: {
  type: (typeof WORK_TYPES)[0];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Values
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Hover Glow Coordinates
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  // Smooth Springs for fluid movement
  const smoothRotateX = useSpring(rotateX, springConfig);
  const smoothRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;

    // Tilt angle intensity modifier
    rotateX.set(-relativeY * 12);
    rotateY.set(relativeX * 12);

    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    mouseX.set(-1000);
    mouseY.set(-1000);
  };

  // Dynamic inline-style templates for the lighting spotlights
  const glowBg = useMotionTemplate`
    radial-gradient(
      200px circle at ${mouseX}px ${mouseY}px,
      hsl(var(--primary) / 0.12),
      transparent 80%
    )
  `;

  const borderGlowBg = useMotionTemplate`
    radial-gradient(
      100px circle at ${mouseX}px ${mouseY}px,
      hsl(var(--primary) / 0.4),
      transparent 60%
    )
  `;

  return (
    <motion.div
      ref={cardRef}
      {...fadeUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative w-55 shrink-0 cursor-pointer overflow-hidden rounded-3xl border border-border/60 bg-card/60 shadow-sm backdrop-blur-xl transition-shadow duration-500 hover:border-border hover:shadow-2xl hover:shadow-primary/5 perspective-[1000px]"
    >
      {/* Animated Inner Border Glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-30 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: borderGlowBg,
          maskImage:
            "linear-gradient(#fff, #fff) padding-box, linear-gradient(#fff, #fff)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
      />

      {/* Surface Spotlight Background Glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: glowBg }}
      />

      {/* 3D Depth Canvas Wrapper */}
      <div
        style={{ transform: "translateZ(15px)" }}
        className="relative z-10 transition-transform duration-500"
      >
        {/* Media Block */}
        <div className="relative h-60 w-full overflow-hidden">
          <Image
            src={type.image}
            alt={type.name}
            fill
            priority={index === 0}
            sizes="220px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
          {/* Subtle Deepening Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/15 to-transparent transition-opacity duration-500 group-hover:from-background/95" />

          {/* Dynamic Status Badge */}
          <span className="absolute top-4 left-4 scale-90 rounded-full bg-background/50 px-2.5 py-1 text-[10px] font-semibold text-foreground/80 backdrop-blur-md opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
            Available Now
          </span>
        </div>

        {/* Info Block */}
        <div className="p-4 text-left">
          <h3 className="text-sm font-black text-foreground transition-colors duration-300 group-hover:text-primary">
            {type.name}
          </h3>

          <div className="mt-1 flex items-center justify-between">
            <p className="text-xs text-muted-foreground transition-transform duration-500 group-hover:translate-x-0.5">
              Verified local skill
            </p>

            {/* Sliding Link Indicator */}
            <ArrowRight className="h-3.5 w-3.5 -translate-x-2 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <div className="overflow-hidden bg-background text-foreground">
      <Hero />

      <SectionDivider />

      {/* STATS */}
      <section className="relative bg-surface px-6 py-28 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.08),transparent_45%)]" />

        <div className="relative mx-auto mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Local skills, ready when needed
          </p>
          <h2 className="text-3xl font-black tracking-tight text-foreground md:text-5xl">
            Find trusted hands for everyday work
          </h2>
        </div>

        <InfiniteScroller speed="slow" className="relative mx-auto max-w-6xl">
          {WORK_TYPES.map((type, index) => (
            <WorkTypeCard key={type.name} type={type} index={index} />
          ))}
        </InfiniteScroller>
      </section>

      <SectionDivider flip />

      {/* HOW IT WORKS */}
      <section className="relative bg-background px-6 py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--primary)/0.1),transparent_45%),radial-gradient(circle_at_80%_60%,hsl(var(--secondary)/0.08),transparent_40%)]" />

        <div className="relative mx-auto max-w-6xl text-center">
          <motion.div {...fadeUp}>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              How it works
            </p>

            <h2 className="mx-auto mb-16 max-w-3xl text-4xl font-black tracking-tight text-foreground md:text-5xl">
              From request to completed — in minutes
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              ["01", "Verify", "ID + biometric check"],
              ["02", "Match", "Smart local matching"],
              ["03", "Get Paid", "Instant escrow payout"],
            ].map(([n, t, d]) => (
              <motion.div
                key={t}
                {...fadeUp}
                className="group rounded-3xl border border-border bg-card/80 p-10 text-left shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                  {n}
                </div>

                <div className="mb-3 text-xl font-bold text-card-foreground">
                  {t}
                </div>

                <p className="text-sm leading-6 text-muted-foreground">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* IMAGE + CONTENT SPLIT */}
      <section className="relative bg-section-dark px-6 py-32 text-section-dark-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,hsl(var(--primary)/0.22),transparent_42%)]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
          <motion.div
            {...fadeUp}
            className="relative h-105 overflow-hidden rounded-4xl border border-white/10 shadow-2xl"
          >
            <Image
              src="/images/delivery-guy.jpeg"
              alt="Verified worker completing a local task"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />
          </motion.div>

          <motion.div {...fadeUp}>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              For workers
            </p>

            <h3 className="mb-6 text-4xl font-black tracking-tight md:text-5xl">
              Get paid for skills you already have
            </h3>

            <p className="mb-10 max-w-xl text-section-dark-foreground/70">
              HireCore helps skilled local workers find trusted tasks, build a
              visible reputation, and earn without the usual chaos.
            </p>

            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                "Free to join",
                "Instant job matching",
                "Same-day payouts",
                "Build reputation",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <SectionDivider variant="peak" />

      {/* FINAL CTA */}
      <section className="relative bg-surface-soft px-6 py-36 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,hsl(var(--secondary)/0.18),transparent_45%),radial-gradient(circle_at_50%_90%,hsl(var(--primary)/0.1),transparent_45%)]" />

        <motion.div {...fadeUp} className="relative mx-auto max-w-4xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Ready when you are
          </p>

          <h2 className="mb-6 text-4xl font-black tracking-tight text-foreground md:text-6xl">
            The future of local work is already here
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-muted-foreground">
            Join a trusted network built for speed, verification, and reliable
            work opportunities.
          </p>

          <Link
            href="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-5 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Get started <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
