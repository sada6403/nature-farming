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

const titleVariants: any = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

const subtitleVariants: any = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const contentVariants: any = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.15 },
  },
};

export default function Section({
  children,
  className,
  id,
  containerClassName,
  bgVariant = 'none',
  title,
  subtitle,
  centered = false,
}: SectionProps) {
  const bgStyles = {
    light: 'bg-light/20',
    warm: 'bg-warm',
    earth: 'bg-earth/30',
    dark: 'bg-dark text-warm shadow-inner',
    none: '',
  };

  const isDark = bgVariant === 'dark';

  return (
    <section
      id={id}
      className={cn(
        'py-12 md:py-20 overflow-hidden relative',
        bgStyles[bgVariant],
        className
      )}
    >
      <div
        className={cn(
          'container mx-auto px-6 relative z-10',
          containerClassName
        )}
      >
        {(title || subtitle) && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className={cn(
              'max-w-3xl mb-10 md:mb-16',
              centered ? 'mx-auto text-center' : ''
            )}
          >
            {subtitle && (
              <motion.div
                variants={subtitleVariants}
                className={cn(
                  'flex items-center gap-3 mb-5',
                  centered ? 'justify-center' : ''
                )}
              >
                <span
                  className={cn(
                    'h-px w-8 shrink-0 rounded-full',
                    isDark ? 'bg-accent/40' : 'bg-accent/50'
                  )}
                />
                <span
                  className={cn(
                    'text-[11px] font-bold tracking-[0.25em] uppercase',
                    isDark ? 'text-accent' : 'text-accent'
                  )}
                >
                  {subtitle}
                </span>
              </motion.div>
            )}
            {title && (
              <motion.h2
                variants={titleVariants}
                className={cn(
                  'text-4xl md:text-6xl font-serif leading-tight',
                  isDark ? 'text-warm' : 'text-primary'
                )}
              >
                {title}
              </motion.h2>
            )}
          </motion.div>
        )}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={contentVariants}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
