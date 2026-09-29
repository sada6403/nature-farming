'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Camera, Video, Mail, Phone, MapPin, Leaf, Youtube, Facebook, Instagram, Linkedin } from 'lucide-react';
import { api } from '@/lib/api';
import styles from './Footer.module.css';

const Footer = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function fetchSettings() {
      const data = await api.getSettings();
      if (data) setSettings(data);
    }
    fetchSettings();
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand Column */}
          <div className={styles.column}>
            <Link href="/" className={styles.logo}>
              <Image src="/nature-farming-official-v2.png" alt="Nature Farming" width={40} height={40} className="object-contain mr-2 rounded-lg" />
              <span>{settings?.company_name || 'Natural Plantation (Pvt) Ltd'}</span>
            </Link>
            <p className={styles.description}>
              Empowering Sri Lankan agriculture through the healing power of 100% natural Aloe Vera.
            </p>
            <div className={styles.socials}>
              {settings?.facebook_link && (
                <a href={settings.facebook_link} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <Facebook size={18} strokeWidth={1.5} />
                </a>
              )}
              {settings?.instagram_link && (
                <a href={settings.instagram_link} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <Instagram size={18} strokeWidth={1.5} />
                </a>
              )}
              {settings?.linkedin_link && (
                <a href={settings.linkedin_link} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <Linkedin size={18} strokeWidth={1.5} />
                </a>
              )}
              {settings?.youtube_link && (
                <a href={settings.youtube_link} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <Youtube size={18} strokeWidth={1.5} />
                </a>
              )}
              {settings?.whatsapp_number && (
                <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <MessageCircle size={18} strokeWidth={1.5} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.column}>
            <h3>Company</h3>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/products">Our Products</Link></li>
              <li><Link href="/farmer-join">Join as a Farmer</Link></li>
              <li><Link href="/branches">Our Branches</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className={styles.column}>
            <h3>Support</h3>
            <ul>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/faqs">FAQs</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.column}>
            <h3>Contact Us</h3>
            <ul className={styles.contactList}>
              <li>
                <MapPin size={18} className={styles.icon} />
                <span>{settings?.head_office_address || 'Kilinochchi, Sri Lanka'}</span>
              </li>
              <li>
                <Phone size={18} className={styles.icon} />
                <span>{settings?.primary_phone || '+94 77 123 4567'}</span>
              </li>
              <li>
                <Mail size={18} className={styles.icon} />
                <span>{settings?.primary_email || 'info@naturalplantation.lk'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p>© {new Date().getFullYear()} Natural Plantation (Pvt) Ltd. All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-[11px] text-white/40 uppercase tracking-widest font-bold">
            <span className="h-px w-8 bg-white/10 hidden md:block" />
            <span>Reg No: PV 00334432</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
