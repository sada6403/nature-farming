'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Search, Map } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Section from '@/components/Section';
import { motion } from 'framer-motion';

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    const { data } = await supabase.from('branches').select('*').eq('is_active', true).order('name');
    if (data) setBranches(data);
    setLoading(false);
  };

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-24 md:pt-32">
      {/* Premium Header */}
      <section className="bg-primary py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/50 via-transparent to-transparent" />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-6">Our Presence</h1>
            <p className="max-w-2xl mx-auto text-light/70 text-lg md:text-xl font-luxury italic">
              Experience the pure healing power of nature through our growing presence across the Northern and Eastern agricultural regions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="container mx-auto px-6 -mt-10 relative z-20">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl flex items-center p-2 shadow-2xl border border-primary/5">
          <Search className="ml-4 text-primary/60" size={24} />
          <input 
            type="text" 
            placeholder="Search by district or branch name..." 
            className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-primary font-medium placeholder:text-primary/70"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Section bgVariant="warm">
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="text-center py-20">
            <Map className="mx-auto text-primary/10 mb-4" size={64} />
            <h3 className="text-2xl font-serif text-primary">No branches found</h3>
            <p className="text-dark/40 italic">Try searching for a different region.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBranches.map((branch, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-8 flex flex-col group h-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-serif text-primary">{branch.name}</h3>
                  <div className="p-2 rounded-lg bg-primary/5 text-accent">
                    <MapPin size={24} />
                  </div>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div className="flex items-start gap-4">
                    <Map className="text-primary/30 mt-1" size={18} />
                    <p className="text-sm text-dark/70 leading-relaxed italic">{branch.address}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Clock className="text-primary/30" size={18} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">{branch.district} Region</p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-primary/5">
                  <button className="text-xs font-bold text-primary/40 uppercase tracking-[0.2em] group-hover:text-accent transition-colors flex items-center gap-2">
                    Get Directions <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

// Re-defining ArrowRight for the local scope if needed, though it's imported in some files
import { ArrowRight } from 'lucide-react';
