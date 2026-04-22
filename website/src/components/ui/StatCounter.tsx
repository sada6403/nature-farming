'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';
import { motion } from 'framer-motion';

interface StatCounterProps {
  end: number;
  suffix?: string;
  label: string;
  icon: any;
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export default function StatCounter({ end, suffix = '', label, icon: Icon }: StatCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2200;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(end);
    };

    requestAnimationFrame(tick);
  }, [isInView, end]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center p-6 text-center group"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="mb-4 p-4 rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 group-hover:shadow-lg group-hover:shadow-primary/15"
      >
        <Icon size={32} />
      </motion.div>
      <div className="text-4xl md:text-5xl font-bold text-primary font-serif mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-[11px] tracking-[0.2em] uppercase font-semibold text-accent/80">
        {label}
      </div>
    </motion.div>
  );
}
