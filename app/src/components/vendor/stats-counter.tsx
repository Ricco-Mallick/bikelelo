/**
 * Vengeance UI Component: Stats Counter (stats-counter)
 * Category: Text & Motion
 * 
 * Description:
 * Count-up number animation triggered on scroll
 * 
 * Installation (shadcn CLI):
 *   npx shadcn@latest add https://www.vengenceui.com/r/stats-counter.json
 * 
 * Dependencies:
 *   npm install framer-motion clsx tailwind-merge
 * Props:
 *   - value (number, default: -) - The target number to count up to.
 *   - duration (number, default: 1.5) - Duration of the count-up animation in seconds.
 *   - prefix (string, default: '') - Text shown before the number (e.g. '$').
 *   - suffix (string, default: '') - Text shown after the number (e.g. '+', '%').
 *   - decimals (number, default: 0) - Number of decimal places to display.
 *   - className (string, default: -) - Additional CSS classes to apply.
 * Usage:
 *   import StatsCounter from "@/components/ui/stats-counter"
 *   
 *   export function StatsCounterDemo() {
 *     return (
 *       <StatsCounter
 *         value={12000}
 *         suffix="+"
 *         duration={2}
 *       />
 *     )
 *   }
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatsCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function StatsCounter({
  value,
  duration = 1.5,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: StatsCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [springValue]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}
