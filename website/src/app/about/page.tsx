'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Leaf, Sprout, Heart, Target, ArrowRight, ShieldCheck, Users, Globe } from 'lucide-react';
import Section from '@/components/Section';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function AboutPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('company_settings').select('*').eq('id', 1).single();
      if (data) setSettings(data);
    }
    fetchSettings();
  }, []);

  const values = [
    {
      icon: Sprout,
      title: 'Farmer First',
      description: 'We believe in empowering local farmers with fair pricing, technical training, and sustainable guaranteed buybacks.'
    },
    {
      icon: Leaf,
      title: '100% Natural',
      description: 'Our products are free from harmful chemicals, prioritizing the raw, healing power of cold-pressed Aloe Vera.'
    },
    {
      icon: Target,
      title: 'Quality Assured',
      description: 'From soil testing to the final seal, every step is monitored to meet international quality standards.'
    },
    {
      icon: Heart,
      title: 'Community Grown',
      description: 'Built by Sri Lankans, for the world. We grow together with the 5,000+ families in our network.'
    }
  ];

  return (
    <div className="pt-24 md:pt-32">
      {/* Premium Header */}
      <section className="bg-primary py-32 md:py-40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/c0424c44-7c51-4718-b18a-e1adc199aef2.jpg"
            alt="Real Farmers in Nature Farming Field"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary to-primary" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
             <span className="inline-block px-6 py-2 rounded-full border border-white/20 text-accent font-bold text-sm uppercase tracking-[0.3em] mb-8 bg-white/5 backdrop-blur-sm">
              Our Legacy
            </span>
            <h1 className="text-6xl md:text-8xl font-serif text-white mb-6">Our Story</h1>
            <p className="max-w-2xl mx-auto text-light/70 text-lg md:text-xl font-luxury italic">
              Rooted in the fertile soil of Sri Lanka, committed to restoring the balance between nature and human wellness.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Vision Section */}
      <Section subtitle="The Journey" title="Cultivating Wellness, Empowering Communities" bgVariant="warm">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <p className="text-2xl text-dark/70 leading-relaxed font-luxury italic">
              Nature Farming (Pvt) Ltd was established on March 29, 2023, with a vision to revolutionize Sri Lankan agriculture through the healing power of 100% natural Aloe Vera.
            </p>
            <div className="space-y-6 text-dark/80 leading-loose">
              <p>Registered under the Companies Act No. 7 of 2007 (PV 00274199), we are committed to absolute transparency and corporate integrity. What started as an ambitious regional initiative has now blossomed into a powerful network of over 5,000 registered farmers across the Northern and Eastern provinces.</p>
              <p>Our process is built on trust. We provide the guidance, they provide the care, and together we produce the finest natural Aloe Vera in the region. Every leaf is purchased directly from our farmers at guaranteed rates, ensuring economic stability and regional growth.</p>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-6 rounded-2xl bg-white shadow-xl border border-primary/5 flex flex-col justify-center">
                <ShieldCheck className="text-accent mb-3" size={24} />
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Legally Registered</h4>
                <p className="text-xl font-serif text-primary">PV 00274199</p>
              </div>
              <div className="p-6 rounded-2xl bg-white shadow-xl border border-primary/5 flex flex-col justify-center">
                <Globe className="text-accent mb-3" size={24} />
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Founded In</h4>
                <p className="text-xl font-serif text-primary">March 2023</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
               whileHover={{ y: -10 }}
               className="rounded-3xl overflow-hidden glass-card p-2 h-80"
            >
              <div className="relative h-full w-full rounded-2xl overflow-hidden">
                <Image src="/aloe_farm_hero_1776647052615.png" alt="Our Farm" fill className="object-cover" />
              </div>
            </motion.div>
            <motion.div 
               whileHover={{ y: 10 }}
               className="rounded-3xl overflow-hidden glass-card p-2 h-80 mt-12"
            >
              <div className="relative h-full w-full rounded-2xl overflow-hidden">
                <Image src="/aloe_soap_product_1776647089967.png" alt="Pure Product" fill className="object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* Values Section */}
      <Section subtitle="The Natural Advantage" title="Our Core Values" centered bgVariant="earth">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="glass-card p-8 group flex flex-col items-center text-center"
            >
              <div className="mb-6 p-4 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                <value.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">{value.title}</h3>
              <p className="text-sm text-dark/60 leading-relaxed italic">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Sustainability Section */}
      <Section bgVariant="dark" title="Growing for the Future" subtitle="Sustainability">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { icon: ShieldCheck, title: 'Zero Waste', desc: 'Every part of the Aloe plant is utilized, from medicinal gel to organic fertilizer.' },
            { icon: Users, title: 'Fair Trade', desc: 'Direct-to-bank payments and fixed pricing shield our farmers from middle-men.' },
            { icon: Globe, title: 'Global Reach', desc: 'Taking Sri Lanka’s natural heritage to international wellness markets.' }
          ].map((item, i) => (
            <div key={i} className="space-y-4 border-l border-white/10 pl-8">
              <item.icon size={28} className="text-accent" />
              <h4 className="text-xl font-bold text-warm">{item.title}</h4>
              <p className="text-sm text-warm/60 italic leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-6xl font-serif text-primary mb-8 underline-accent">Become Part of Our Story</h2>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <Link href="/farmer-join" className="btn-premium btn-premium-primary">
                Explore Farmer Opportunities <ArrowRight size={20} />
              </Link>
              <Link href="/products" className="btn-premium btn-premium-outline">
                Shop Our Collection
              </Link>
            </div>
        </div>
      </section>
    </div>
  );
}
