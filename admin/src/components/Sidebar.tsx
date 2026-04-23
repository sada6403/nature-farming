'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  MapPin, 
  Inbox, 
  Settings, 
  Image as ImageIcon, 
  LogOut,
  ChevronRight,
  Tv,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Branches', icon: MapPin, path: '/branches' },
    { name: 'Inquiries', icon: Inbox, path: '/inquiries' },
    { name: 'Gallery', icon: ImageIcon, path: '/gallery' },
    { name: 'Banners', icon: Tv, path: '/banners' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <div className="flex items-center">
            <Image src="/nature-farming-official-v2.png" alt="Nature Farming" width={32} height={32} className="object-contain mr-2" />
            <span>Nature Admin</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => onClose()}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
                {isActive && <ChevronRight size={16} className={styles.activeIndicator} />}
              </Link>
            );
          })}
        </nav>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
