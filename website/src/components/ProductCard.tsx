'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/Button';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    isFarmerExclusive?: boolean;
    isComingSoon?: boolean;
  };
  className?: string;
}

const FALLBACK_IMAGE = '/aloe_soap_product_1776647089967.png';

export default function ProductCard({ product, className }: ProductCardProps) {
  const [imgSrc, setImgSrc] = React.useState(product.image || FALLBACK_IMAGE);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "group relative h-[450px] w-full rounded-2xl bg-white/10 p-1 transition-all duration-500 hover:bg-white/20",
        className
      )}
    >
      <div 
        style={{ transform: "translateZ(75px)" }}
        className="flex h-full flex-col overflow-hidden rounded-2xl glass-card transition-all"
      >
        <div className="relative h-64 overflow-hidden">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImgSrc(FALLBACK_IMAGE)}
          />
          {product.category && (
            <span className="absolute left-4 top-4 rounded-full bg-primary/90 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
              {product.category}
            </span>
          )}
          {product.isFarmerExclusive && (
            <span className="absolute right-4 top-4 rounded-full bg-gold/90 px-4 py-1 text-xs font-bold uppercase tracking-wider text-dark backdrop-blur-md">
              Farmer Exclusive
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="text-xl font-bold text-primary">{product.name}</h3>
            {!product.isFarmerExclusive && (
              <span className="text-lg font-bold text-accent">Rs. {product.price}</span>
            )}
          </div>
          <p className="mb-6 flex-1 text-sm leading-relaxed text-dark/70 line-clamp-2 italic">
            {product.description}
          </p>

          <a 
            href="tel:0244335099"
            className={cn(
              "btn-premium w-full flex items-center justify-center py-3 text-sm",
              product.isFarmerExclusive 
                ? "border-2 border-gold text-gold hover:bg-gold hover:text-dark" 
                : "bg-primary text-white hover:bg-primary/90"
            )}
          >
            {product.isFarmerExclusive ? (
              <span className="flex items-center gap-2">Contact Branch <ArrowRight size={16} /></span>
            ) : (
              <span className="flex items-center gap-2"><ShoppingBag size={16} /> Call to Order</span>
            )}
          </a>
        </div>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-white/10 via-white/5 to-transparent rounded-2xl" />
    </motion.div>
  );
}
