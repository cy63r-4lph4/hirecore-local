"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

type InfiniteScrollerProps = {
  children: React.ReactNode;
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  className?: string;
};

const SPEED_MAP: Record<NonNullable<InfiniteScrollerProps["speed"]>, string> = {
  slow: "120s",
  normal: "60s",
  fast: "20s",
};

export const InfiniteScroller: React.FC<InfiniteScrollerProps> = ({
  children,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Clone items once on mount
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Guard: never double-clone
    if (scroller.dataset.cloned === "true") return;

    const items = Array.from(scroller.children);
    if (items.length === 0) return;

    items.forEach((item) => {
      const clone = item.cloneNode(true) as HTMLElement;
      clone.setAttribute("aria-hidden", "true");
      scroller.appendChild(clone);
    });

    scroller.dataset.cloned = "true";
    setReady(true);
  }, []);

  // Apply direction & speed via CSS custom properties
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.style.setProperty(
      "--animation-direction",
      direction === "left" ? "normal" : "reverse",
    );
    container.style.setProperty(
      "--animation-duration",
      SPEED_MAP[speed] ?? "120s",
    );
  }, [direction, speed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative overflow-hidden",
        "mask-[linear-gradient(to_right,transparent,white_12%,white_88%,transparent)]",
        className,
      )}
    >
      <div
        ref={scrollerRef}
        className={cn(
          "flex w-max flex-nowrap gap-6 py-4",
          ready && "animate-scroll",
          pauseOnHover && "hover:paused",
        )}
      >
        {children}
      </div>
    </div>
  );
};
