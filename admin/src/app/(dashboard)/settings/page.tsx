'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './Settings.module.css';

export default function SettingsManager() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    whatsappNumber: '',
    headOfficeAddress: '',
    facebookLink: '',
    instagramLink: '',
    youtubeLink: '',
    homePageHeroText: '',
    aboutUsMission: ''
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('company_settings').select('*').eq('id', 1).single();
    if (data) {
      setFormData({
        companyName: data.company_name || '',
        contactEmail: data.primary_email || '',
        contactPhone: data.primary_phone || '',
        whatsappNumber: data.whatsapp_number || '',
        headOfficeAddress: data.head_office_address || '',
        facebookLink: data.facebook_link || '',
        instagramLink: data.instagram_link || '',
        youtubeLink: data.youtube_link || '',
        homePageHeroText: data.tagline || '',
        aboutUsMission: data.mission || ''
      });
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase.from('company_settings').upsert({
      id: 1,
      company_name: formData.companyName,
      primary_email: formData.contactEmail,
      primary_phone: formData.contactPhone,
      whatsapp_number: formData.whatsappNumber,
      head_office_address: formData.headOfficeAddress,
      facebook_link: formData.facebookLink,
      instagram_link: formData.instagramLink,
      youtube_link: formData.youtubeLink,
      tagline: formData.homePageHeroText,
      mission: formData.aboutUsMission,
      updated_at: new Date().toISOString()
    });

    setSaving(false);
    if (!error) {
      alert('Settings saved successfully!');
    } else {
      alert('Error saving settings: ' + error.message);
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading settings...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>System Settings & CMS</h1>
      </div>

      <form onSubmit={handleSave}>
        <div className={styles.card}>
          <h2>Global Company Information</h2>
          <div className={styles.formGroup}>
            <label>Company Name</label>
            <input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} required/>
          </div>
          <div className={styles.formGroup}>
            <label>Contact Email</label>
            <input type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} required/>
          </div>
          <div className={styles.formGroup}>
            <label>Contact Phone</label>
            <input type="tel" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} required/>
          </div>
          <div className={styles.formGroup}>
            <label>WhatsApp Number</label>
            <input type="tel" value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} />
          </div>
          <div className={styles.formGroup}>
            <label>Head Office Address</label>
            <textarea rows={2} value={formData.headOfficeAddress} onChange={e => setFormData({...formData, headOfficeAddress: e.target.value})} required></textarea>
          </div>
        </div>

        <div className={styles.card} style={{ marginTop: '2rem' }}>
          <h2>Social Media Links</h2>
          <div className={styles.formGroup}>
            <label>Facebook URL</label>
            <input value={formData.facebookLink} onChange={e => setFormData({...formData, facebookLink: e.target.value})} placeholder="https://facebook.com/..."/>
          </div>
          <div className={styles.formGroup}>
            <label>Instagram URL</label>
            <input value={formData.instagramLink} onChange={e => setFormData({...formData, instagramLink: e.target.value})} placeholder="https://instagram.com/..."/>
          </div>
          <div className={styles.formGroup}>
            <label>YouTube URL</label>
            <input value={formData.youtubeLink} onChange={e => setFormData({...formData, youtubeLink: e.target.value})} placeholder="https://youtube.com/..."/>
          </div>
        </div>

        <div className={styles.card} style={{ marginTop: '2rem' }}>
          <h2>Page Content (CMS)</h2>
          <div className={styles.formGroup}>
            <label>Home Page Tagline</label>
            <input value={formData.homePageHeroText} onChange={e => setFormData({...formData, homePageHeroText: e.target.value})} required/>
          </div>
          <div className={styles.formGroup}>
            <label>About Us - Mission Statement</label>
            <textarea rows={3} value={formData.aboutUsMission} onChange={e => setFormData({...formData, aboutUsMission: e.target.value})} required></textarea>
          </div>
          
          <div className={styles.actions}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
