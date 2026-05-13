"use client";

import React, { useEffect, useId, useRef } from "react";
import {
  motion,
  type MotionValue,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue
} from "framer-motion";
import { cn } from "@/lib/utils";

type GridPatternProps = {
  id: string;
  offsetX: MotionValue<number>;
  offsetY: MotionValue<number>;
  size: number;
};

function GridPattern({ id, offsetX, offsetY, size }: GridPatternProps) {
  return (
    <svg className="h-full w-full" aria-hidden="true">
      <defs>
        <motion.pattern
          id={id}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d={`M ${size} 0 L 0 0 0 ${size}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

type AnimatedGridBackgroundProps = {
  className?: string;
  gridSize?: number;
};

export function AnimatedGridBackground({
  className,
  gridSize = 40
}: AnimatedGridBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rawId = useId().replace(/:/g, "");
  const mutedPatternId = `grid-muted-${rawId}`;
  const activePatternId = `grid-active-${rawId}`;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  useEffect(() => {
    const centerMask = () => {
      const bounds = rootRef.current?.getBoundingClientRect();
      if (!bounds) return;
      mouseX.set(bounds.width * 0.65);
      mouseY.set(bounds.height * 0.35);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = rootRef.current?.getBoundingClientRect();
      if (!bounds) return;
      mouseX.set(event.clientX - bounds.left);
      mouseY.set(event.clientY - bounds.top);
    };

    centerMask();
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("resize", centerMask);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", centerMask);
    };
  }, [mouseX, mouseY]);

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + 0.45) % gridSize);
    gridOffsetY.set((gridOffsetY.get() + 0.45) % gridSize);
  });

  const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent 72%)`;

  return (
    <div
      ref={rootRef}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-[0.06]">
        <GridPattern
          id={mutedPatternId}
          offsetX={gridOffsetX}
          offsetY={gridOffsetY}
          size={gridSize}
        />
      </div>
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern
          id={activePatternId}
          offsetX={gridOffsetX}
          offsetY={gridOffsetY}
          size={gridSize}
        />
      </motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_12%,hsl(var(--primary)/0.16),transparent_32%),radial-gradient(circle_at_5%_92%,hsl(var(--accent)/0.30),transparent_34%)]" />
    </div>
  );
}
