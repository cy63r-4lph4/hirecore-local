"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from "lucide-react";

const images = [
  "/images/cleaner.jpeg",
  "/images/carpenter.jpeg",
  "/images/tailor.jpeg",
  "/images/electrician.jpeg",
  "/images/mechanic.jpeg",
];

const roles = [
  "cleaners",
  "carpenters",
  "tailors",
  "electricians",
  "mechanics",
  "local experts",
];

function TypewriterText() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const currentRole = roles[roleIndex];

  useEffect(() => {
    const speed = deleting ? 45 : 80;
    const pause = text === currentRole && !deleting ? 1300 : speed;

    const timeout = setTimeout(() => {
      if (!deleting && text.length < currentRole.length) {
        setText(currentRole.slice(0, text.length + 1));
        return;
      }

      if (!deleting && text.length === currentRole.length) {
        setDeleting(true);
        return;
      }

      if (deleting && text.length > 0) {
        setText(currentRole.slice(0, text.length - 1));
        return;
      }

      if (deleting && text.length === 0) {
        setDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      }
    }, pause);

    return () => clearTimeout(timeout);
  }, [currentRole, deleting, text]);

  return (
    <span className="inline-flex items-center">
      <span className="gradient-text">{text}</span>
      <span className="ml-1 h-[1em] w-[3px] animate-pulse rounded-full bg-primary" />
    </span>
  );
}

export default function Hero() {
  const [index, setIndex] = useState(0);

  const currentImage = useMemo(() => images[index], [index]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-section-dark px-6 py-32 text-center text-section-dark-foreground">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--section-dark-foreground)/0.06)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--section-dark-foreground)/0.06)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,hsl(var(--secondary)/0.18),transparent_35%),radial-gradient(circle_at_82%_18%,hsl(var(--primary)/0.22),transparent_40%),radial-gradient(circle_at_50%_90%,hsl(var(--primary)/0.16),transparent_45%)]" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentImage}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.42, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={currentImage}
            alt="Local skilled worker"
            fill
            priority
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* <div className="absolute inset-0 bg-[linear-gradient(to_bottom,hsl(var(--section-dark)/0.72),hsl(var(--section-dark)/0.58),hsl(var(--section-dark)/0.9))]" /> */}

      <div className="absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl ">
        

        <motion.h1
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-5xl text-5xl font-black leading-[1.02] tracking-[-0.06em] md:text-7xl lg:text-8xl"
        >
          Hire trusted <TypewriterText />
          <br />
          around you.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.8 }}
          className="mx-auto mt-8 max-w-2xl text-base leading-8 text-section-dark-foreground/72 md:text-xl"
        >
          Find verified workers, post urgent tasks, and move from request to
          completed without the messy back-and-forth.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.8 }}
          className="mt-11 flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-[var(--glow-primary)] transition hover:-translate-y-0.5 hover:bg-primary/90"
          >
            Browse local tasks <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/apply-workforce"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-8 py-4 font-semibold text-section-dark-foreground backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15"
          >
            Become verified
          </Link>
        </motion.div>

       
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}