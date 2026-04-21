'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  containerClassName?: string;
  bgVariant?: 'light' | 'warm' | 'earth' | 'dark' | 'none';
  title?: string;
  subtitle?: string;
  centered?: boolean;
}

export default function Section({
  children,
  className,
  id,
  containerClassName,
  bgVariant = 'none',
  title,
  subtitle,
  centered = false
}: SectionProps) {
  const bgStyles = {
    light: 'bg-light/20',
    warm: 'bg-warm',
    earth: 'bg-earth/30',
    dark: 'bg-dark text-warm shadow-inner',
    none: ''
  };

  return (
    <section 
      id={id} 
      className={cn(
        'py-20 md:py-32 overflow-hidden relative',
        bgStyles[bgVariant],
        className
      )}
    >
      <div className={cn(
        'container mx-auto px-6 relative z-10',
        containerClassName
      )}>
        {(title || subtitle) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className={cn(
              'max-w-3xl mb-16 md:mb-24',
              centered ? 'mx-auto text-center' : ''
            )}
          >
            {subtitle && (
              <span className={cn(
                "text-sm font-bold tracking-[0.2em] uppercase mb-4 block",
                bgVariant === 'dark' ? 'text-accent' : 'text-accent'
              )}>
                {subtitle}
              </span>
            )}
            {title && (
              <h2 className={cn(
                "text-4xl md:text-6xl font-serif leading-tight",
                bgVariant === 'dark' ? 'text-warm' : 'text-primary'
              )}>
                {title}
              </h2>
            )}
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
