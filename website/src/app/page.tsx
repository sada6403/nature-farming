'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Leaf, Users, ShieldCheck, TrendingUp, ArrowRight, MapPin, Flag, ShoppingBag } from 'lucide-react';
import Section from '@/components/Section';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';

import ProductCard from '@/components/ProductCard';
import HeroScene from '@/components/3d/HeroScene';
import StatCounter from '@/components/ui/StatCounter';

export default function Home() {
  const [settings, setSettings] = React.useState<any>({
    companyName: 'Nature Farming',
    tagline: 'Leading Sri Lanka in Premium Aloe Vera Production'
  });
  const [products, setProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      // Fetch Settings
      const { data: sData } = await supabase.from('company_settings').select('*').eq('id', 1).single();
      if (sData) setSettings(sData);

      // Fetch Products with categories
      const { data: pData } = await supabase.from('products').select(`
        *,
        product_categories(name)
      `).eq('is_published', true).order('is_featured', { ascending: false });
      
      if (pData) {
        setProducts(pData.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          image: p.image_url || '/aloe_soap_product_1776647089967.png',
          category: p.product_categories?.name
        })));
      }
    }
    fetchData();
  }, []);

  // Filter Raw Materials (Aloe Leaves/Plants)
  const rawMaterials = products.filter(p => p.category === 'Raw Materials');
  // Filter Handcrafted Products (that are NOT raw materials)
  const handcraftedProducts = products.filter(p => p.category !== 'Raw Materials');

  const stats = [
    { label: 'Registered Farmers', end: 5000, suffix: '+', icon: Users },
    { label: 'Happy Customers', end: 10000, suffix: '+', icon: ShieldCheck },
    { label: 'Products Launching', end: 25, suffix: '+', icon: Leaf },
    { label: 'Active Branches', end: 12, suffix: '', icon: TrendingUp },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.2, ease: "easeOut" },
    },
  };

  return (
    <div className="relative">
      {/* 3D Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-warm">
        <HeroScene />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-warm/30 to-warm pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-center lg:text-left pt-20 lg:pt-0"
            >
              <motion.span variants={itemVariants} className="inline-block px-5 py-1.5 rounded-full border border-primary/10 text-primary font-bold text-[10px] uppercase tracking-[0.4em] mb-10 bg-white/30 backdrop-blur-sm">
                Cultivating Excellence Since 2018
              </motion.span>
              <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-serif text-primary mb-8 leading-[0.85] tracking-tighter">
                Pure Nature.<br/>
                <span className="text-accent italic font-light">Trusted Roots.</span>
              </motion.h1>
              <motion.p variants={itemVariants} className="max-w-xl mx-auto lg:mx-0 text-base md:text-lg text-dark/60 mb-16 font-luxury italic leading-relaxed">
                Empowering Sri Lankan agriculture through premium Aloe Vera cultivation, sustainable practices, and a thriving farmer network.
              </motion.p>
              <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-5 justify-center lg:justify-start items-center">
                <Link href="/products" className="btn-premium btn-premium-primary text-[11px] tracking-[0.2em] uppercase px-10">
                  Explore Collection
                </Link>
                <Link href="/farmer-join" className="btn-premium btn-premium-outline text-[11px] tracking-[0.2em] uppercase px-10">
                  Join Network
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Empty column for 3D asset on desktop */}
            <div className="hidden lg:block h-full" />
          </div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary">Scroll</span>
          <div className="w-px h-12 bg-primary" />
        </motion.div>
      </section>

      {/* Trust Stats Bar */}
      <div className="bg-white border-y border-primary/10 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-8">
            {stats.map((stat, i) => (
              <StatCounter key={i} {...stat} />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Company Introduction */}
      <Section 
        subtitle="Our Essence" 
        title="Revolutionizing Aloe Vera in Sri Lanka"
        bgVariant="warm"
      >
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <p className="text-2xl text-dark/60 leading-relaxed font-luxury italic">
              Nature Farming isn't just a company; it's a movement towards organic resilience and farmer empowerment.
            </p>
            <div className="space-y-4 text-dark/80">
              <p>Based in the fertile lands of Kurunegala, we've pioneered a model where quality meets compassion. We provide the seeds of success to our farmers and deliver the fruits of nature to your doorstep.</p>
              <p>Our 100% natural Aloe Vera soaps and upcoming wellness range are crafted to preserve the raw healing power of Sri Lanka's finest harvest.</p>
            </div>
            <Link href="/about" className="inline-flex items-center gap-2 text-primary font-bold border-b-2 border-accent pb-1 hover:gap-4 transition-all group">
              Read Our Full Story <ArrowRight size={18} className="text-accent group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative rounded-3xl overflow-hidden glass-card p-4 aspect-[4/5] md:aspect-square"
          >
            <div className="relative h-full w-full rounded-2xl overflow-hidden">
              <Image 
                src="/aloe_farm_hero_1776647052615.png" 
                alt="Our Field" 
                fill 
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </Section>

      {/* 5. Why Choose Nature Farming */}
      <Section 
        subtitle="The Natural Advantage" 
        title="Why Nature Farming?" 
        centered
        bgVariant="earth"
      >
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Farmer-First Model', desc: 'Direct support, training, and fixed-rate purchases ensure our growers thrive.', icon: Users },
            { title: '100% Natural', desc: 'Zero harmful chemicals. Only the purest Aloe extracts for your skin.', icon: Leaf },
            { title: 'Quality Assured', desc: 'Rigorous testing from soil to final packaging ensures peak efficacy.', icon: ShieldCheck },
            { title: 'Direct Payments', desc: 'Transparent and immediate payment system for every harvest delivered.', icon: TrendingUp },
            { title: 'Branch Support', icon: MapPin, desc: 'Assigned branches across island providing local assistance.' },
            { title: 'Sri Lanka Grown', icon: Flag, desc: 'Proudly cultivating and manufacturing in the heart of Ceylon.' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="glass-card p-8 flex flex-col items-center text-center group"
            >
              <div className="mb-6 p-4 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                <item.icon size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">{item.title}</h3>
              <p className="text-sm text-dark/60 leading-relaxed italic">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* 6. Products Showcase (Segmented) */}
      <Section title="Premium Natural Creations" subtitle="The Harvest" bgVariant="warm" id="products">
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-2xl font-serif text-primary">Handcrafted Wellness</h3>
            <div className="h-px flex-1 bg-primary/10" />
            <Link href="/products" className="text-sm font-bold text-accent hover:underline">View All</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {handcraftedProducts.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-2xl font-serif text-primary">The Source: Raw Aloe Vera</h3>
            <div className="h-px flex-1 bg-primary/10" />
            <span className="text-[10px] font-bold text-gold bg-dark px-3 py-1 rounded-full uppercase tracking-[0.2em]">Farmer Exclusive</span>
          </div>
          <div className="grid md:grid-cols-3 gap-8 opacity-80">
            {rawMaterials.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </Section>

      {/* 8. How It Works (Timeline) */}
      <Section title="How We Grow Together" subtitle="The Journey" bgVariant="dark">
        <div className="relative mt-20 max-w-4xl mx-auto">
          <div className="absolute top-0 bottom-0 left-[21px] md:left-1/2 w-px bg-white/10" />
          {[
            { step: '01', title: 'Register Interest', desc: 'Fill out our online inquiry form or visit your nearest branch.' },
            { step: '02', title: 'Field Visit', desc: 'An expert visitor evaluates your land and provides technical advice.' },
            { step: '03', title: 'Start Cultivation', desc: 'Begin Aloe Vera farming with our premium plants and guidance.' },
            { step: '04', title: 'The Harvest', desc: 'When mature, we buy your entire Aloe Vera harvest directly.' },
            { step: '05', title: 'Direct Payment', desc: 'Secure and direct payments made to you for the delivered yield.' }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className={`flex items-start mb-20 relative ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            >
              <div className="flex-none bg-accent text-primary w-12 h-12 rounded-full flex items-center justify-center font-bold relative z-10 shadow-[0_0_20px_rgba(82,183,136,0.3)]">
                {item.step}
              </div>
              <div className={`flex-1 pt-2 ${i % 2 === 0 ? 'pl-8 md:pl-16' : 'pl-8 pr-16 md:pl-0 md:pr-16 md:text-right'}`}>
                <h4 className="text-xl font-bold mb-2 text-warm">{item.title}</h4>
                <p className="text-warm/60 text-sm italic">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* 12. Final CTA Banner */}
      <section className="py-24 bg-earth/20 relative overflow-hidden border-t border-primary/5">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif text-primary mb-8 leading-tight tracking-tighter">
              Ready to Start Your <br/><span className="text-accent italic font-light">Nature-Led Journey?</span>
            </h2>
            <p className="max-w-xl mx-auto text-dark/60 mb-12 italic text-lg">Whether you are a customer seeking natural wellness or a farmer looking for the right partner, Nature Farming is here for you.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="https://wa.me/94700000000" target="_blank" className="btn-premium btn-premium-primary">
                 <ShoppingBag size={20} /> Chat on WhatsApp
              </Link>
              <Link href="/contact" className="btn-premium btn-premium-outline">
                Find Your Nearest Branch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
