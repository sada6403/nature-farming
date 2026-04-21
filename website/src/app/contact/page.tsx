'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, MessageSquare, User, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Section from '@/components/Section';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('company_settings').select('*').eq('id', 1).single();
      if (data) setSettings(data);
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.from('inquiries').insert([{ 
        type: 'contact', 
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message
      }]);
      
      if (error) throw error;
      
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      alert('There was an error sending your message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { 
      title: 'Head Office', 
      desc: settings?.head_office_address || 'Kilinochchi, Sri Lanka', 
      icon: MapPin, 
      sub: settings?.company_name || 'Nature Farming (Pvt) Ltd.' 
    },
    { 
      title: 'Phone', 
      desc: settings?.primary_phone || '+94 77 123 4567', 
      icon: Phone, 
      sub: `WhatsApp: ${settings?.whatsapp_number || '+94 77 123 4567'}` 
    },
    { 
      title: 'Email', 
      desc: settings?.primary_email || 'info@naturalfarming.lk', 
      icon: Mail, 
      sub: 'Response within 24 hours' 
    }
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
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-6">Contact Us</h1>
            <p className="max-w-2xl mx-auto text-light/70 text-lg md:text-xl font-luxury italic">
              Connect with Nature Farming for product inquiries, partnership opportunities, or agricultural guidance.
            </p>
          </motion.div>
        </div>
      </section>

      <Section bgVariant="warm">
        <div className={cn(
          success ? "max-w-2xl mx-auto" : "grid lg:grid-cols-2 gap-16 items-start"
        )}>
          {/* Contact Details */}
          {!success && (
            <div className="space-y-12">
            <div>
              <h2 className="text-4xl font-serif text-primary mb-12">Get in Touch</h2>
              <div className="space-y-8">
                {contactInfo.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-6 group"
                  >
                    <div className="flex-none w-14 h-14 rounded-2xl bg-white shadow-glass flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-primary mb-1">{item.title}</h4>
                      <p className="text-dark font-medium">{item.desc}</p>
                      <p className="text-dark/40 text-sm italic">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="rounded-3xl overflow-hidden glass-card h-80 bg-earth relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62916.438585970876!2d80.3700439!3d9.3707786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3afefd1667798b1b%3A0x6a053c8477038758!2sKilinochchi%2C%20Sri%20Lanka!5e0!3m2!1sen!2sus!4v1625680123456!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy"
                title="Google Maps"
              ></iframe>
            </div>
          </div>
          )}

          {/* Contact Form */}
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
                  <h3 className="text-3xl font-serif text-primary mb-2">Message Sent!</h3>
                  <p className="text-dark/60 mb-8 italic">We have received your message and will get back to you shortly.</p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="btn-premium btn-premium-primary mx-auto"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="mb-10">
                    <h3 className="text-3xl font-serif text-primary mb-2">Send a Message</h3>
                    <p className="text-dark/70 italic">How can we help you today?</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="relative">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block ml-1">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-accent transition-colors" size={20} />
                          <input 
                            required 
                            type="text" 
                            placeholder="Your name"
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-primary/10 focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all placeholder:text-dark/40"
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block ml-1">Email Address</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-accent transition-colors" size={20} />
                          <input 
                            required 
                            type="email" 
                            placeholder="your@email.com"
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-primary/10 focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all placeholder:text-dark/40"
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                          />
                        </div>
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
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block ml-1">Subject</label>
                        <div className="relative group">
                          <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-accent transition-colors" size={20} />
                          <input 
                            required 
                            type="text" 
                            placeholder="Regarding..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-primary/10 focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all placeholder:text-dark/40"
                            value={formData.subject} 
                            onChange={e => setFormData({...formData, subject: e.target.value})} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block ml-1">Message</label>
                      <textarea 
                        required 
                        rows={5} 
                        placeholder="How can we help?"
                        className="w-full px-4 py-4 rounded-xl bg-white border border-primary/10 focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all placeholder:text-dark/40 resize-none"
                        value={formData.message} 
                        onChange={e => setFormData({...formData, message: e.target.value})}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="btn-premium btn-premium-primary w-full justify-center group"
                    >
                      {loading ? 'Sending Message...' : (
                        <span className="flex items-center gap-2">Send Message <Send className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={20} /></span>
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
