'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Section from '@/components/Section';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User, Phone, MapPin, MessageSquare, CheckCircle2, ArrowRight, ShieldCheck, Leaf, TrendingUp, Users } from 'lucide-react';
import StatCounter from '@/components/ui/StatCounter';

export default function JoinPage() {
  const [settings, setSettings] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    assigned_branch_id: '',
    experience: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchInitialData() {
      const { data: settingsData } = await supabase.from('company_settings').select('*').eq('id', 1).single();
      if (settingsData) setSettings(settingsData);

      const { data: branchesData } = await supabase.from('branches').select('id, name').eq('is_active', true).order('name');
      if (branchesData) setBranches(branchesData);
    }
    fetchInitialData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'farmer_interest',
          full_name: formData.name,
          phone: formData.phone,
          district: formData.location,
          assigned_branch_id: formData.assigned_branch_id || null,
          message: formData.experience,
          website: formData.website,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || 'Unable to submit application');
      }
      
      setSuccess(true);
      setFormData({ name: '', phone: '', location: '', assigned_branch_id: '', experience: '', website: '' });
    } catch (err) {
      console.error('Error submitting application:', err);
      alert('There was an error submitting your application. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Submit Interest', desc: 'Complete the form with your basic details.', icon: MessageSquare },
    { title: 'Field Evaluation', desc: 'Our experts visit to assess soil and land suitability.', icon: MapPin },
    { title: 'Planting & Training', desc: 'Get premium Aloe plants and technical guidance.', icon: Leaf },
    { title: 'Guaranteed Buyback', desc: 'Harvest and receive instant payments from us.', icon: TrendingUp }
  ];

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
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-6">Partner With Us</h1>
            <p className="max-w-2xl mx-auto text-light/70 text-lg md:text-xl font-luxury italic">
              Empowering farmers across Sri Lanka with sustainable Aloe Vera cultivation and guaranteed global market access.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-white border-y border-primary/10 relative z-10 -mt-10 mx-auto max-w-5xl rounded-2xl shadow-glass">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 py-8">
          <StatCounter end={settings?.total_farmers || 5000} label="Active Farmers" suffix="+" icon={Users} />
          <StatCounter end={settings?.districts_count || 12} label="District Centers" icon={MapPin} />
          <StatCounter end={100} label="Buyback Guarantee" suffix="%" icon={ShieldCheck} />
        </div>
      </div>

      {/* How it works & Form Section */}
      <Section bgVariant="warm">
        <div className={cn(
          success ? "max-w-2xl mx-auto" : "grid lg:grid-cols-2 gap-16 items-start"
        )}>
          {!success && (
            <div className="space-y-12">
            <div>
              <h2 className="text-4xl font-serif text-primary mb-8">Four Steps to Success</h2>
              <div className="space-y-8">
                {steps.map((step, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-6 group"
                  >
                    <div className="flex-none w-14 h-14 rounded-2xl bg-white shadow-glass flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <step.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-primary mb-2">{step.title}</h4>
                      <p className="text-dark/60 leading-relaxed italic">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 border-dashed">
              <h4 className="font-bold text-accent mb-4 flex items-center gap-2">
                <ShieldCheck size={20} /> Guaranteed Market
              </h4>
              <p className="text-sm text-dark/70 leading-relaxed italic">
                Every Aloe Vera leaf produced under our guidance is purchased by Nature Farming at pre-agreed market rates, ensuring a stable income for your family.
              </p>
            </div>
          </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full opacity-50" />
            <div className="relative glass-card p-8 md:p-12">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-3xl font-serif text-primary mb-4">Application Received!</h3>
                  <p className="text-dark/60 mb-8 italic">Thank you for your interest. Our agricultural officers will contact you within 48 hours for a field visit.</p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="btn-premium btn-premium-primary mx-auto"
                  >
                    Send Another Inquiry
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="mb-10">
                    <h3 className="text-3xl font-serif text-primary mb-2">Farmer Registration</h3>
                    <p className="text-dark/50 italic">Please fill out the details below to start your journey.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={e => setFormData({...formData, website: e.target.value})}
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="hidden"
                    />
                    <div className="relative">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-accent transition-colors" size={20} />
                        <input 
                          required 
                          type="text" 
                          placeholder="Your full name"
                          className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-primary/10 focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all placeholder:text-dark/40"
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="relative">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block ml-1">Phone Number</label>
                        <div className="relative group">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-accent transition-colors" size={20} />
                          <input 
                            required 
                            type="tel" 
                            placeholder="07X XXX XXXX"
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-primary/10 focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all placeholder:text-dark/40"
                            value={formData.phone} 
                            onChange={e => setFormData({...formData, phone: e.target.value})} 
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block ml-1">Branch / Area</label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-accent transition-colors" size={20} />
                          <select 
                            required 
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-primary/10 focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all appearance-none cursor-pointer"
                            value={formData.assigned_branch_id} 
                            onChange={e => {
                              const b = branches.find(x => x.id === e.target.value);
                              setFormData({...formData, assigned_branch_id: e.target.value, location: b ? b.name : ''});
                            }} 
                          >
                            <option value="">Select your area</option>
                            {branches.map(branch => (
                              <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary/30">
                            <ArrowRight className="rotate-90" size={16} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block ml-1">Cultivation Experience (Optional)</label>
                      <div className="relative group">
                        <MessageSquare className="absolute left-4 top-4 text-primary/30 group-focus-within:text-accent transition-colors" size={20} />
                        <textarea 
                          rows={4} 
                          placeholder="Tell us about your current farm or experience..."
                          className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-primary/10 focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all placeholder:text-dark/40 resize-none"
                          value={formData.experience} 
                          onChange={e => setFormData({...formData, experience: e.target.value})}
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="btn-premium btn-premium-primary w-full justify-center group"
                    >
                      {loading ? 'Processing Application...' : (
                        <span className="flex items-center gap-2">Submit Application <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} /></span>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
