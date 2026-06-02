import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

type InfiniteScrollerProps = {
  children: React.ReactNode;
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  className?: string;
};

export const InfiniteScroller: React.FC<InfiniteScrollerProps> = ({
  children,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [start, setStart] = useState(false);

  // 1. Properly handle dependencies so this doesn't run on every single render
  useEffect(() => {
    addAnimation();
  }, [direction, speed]);

  const addAnimation = () => {
    if (containerRef.current && scrollerRef.current) {
      // 2. Prevent duplicate cloning if useEffect triggers again
      if (scrollerRef.current.getAttribute("data-cloned") === "true") {
        getDirection();
        getSpeed();
        setStart(true);
        return;
      }

      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true) as HTMLElement;
        // Hide duplicates from screen readers for accessibility
        duplicatedItem.setAttribute("aria-hidden", "true");
        scrollerRef.current?.appendChild(duplicatedItem);
      });

      // Mark as cloned so we never double-clone
      scrollerRef.current.setAttribute("data-cloned", "true");

      getDirection();
      getSpeed();
      setStart(true);
    }
  };

  const getDirection = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--animation-direction",
        direction === "left" ? "forwards" : "reverse",
      );
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      let duration = "120s";
      if (speed === "fast") duration = "20s";
      else if (speed === "normal") duration = "80s";
      containerRef.current.style.setProperty("--animation-duration", duration);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 overflow-hidden mask-[linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        className,
      )}
    >
      <div
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-6 py-4 w-max flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "hover:paused",
        )}
      >
        {children}
      </div>
    </div>
  );
};
