'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface StatCounterProps {
  end: number;
  suffix?: string;
  label: string;
  icon: any;
}

export default function StatCounter({ end, suffix = "", label, icon: Icon }: StatCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000; // 2 seconds
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [isInView, end]);

  return (
    <div ref={ref} className="flex flex-col items-center p-6 text-center group">
      <div className="mb-4 p-4 rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
        <Icon size={32} />
      </div>
      <div className="text-4xl md:text-5xl font-bold text-primary font-serif mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm tracking-widest uppercase font-semibold text-accent/80">
        {label}
      </div>
    </div>
  );
}
