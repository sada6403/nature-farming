'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Package, 
  MapPin, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import styles from './dashboard.module.css';

export default function DashboardHome() {
  const [stats, setStats] = useState([
    { label: 'Total Requests', value: '0', change: '...', trending: 'neutral', icon: Users },
    { label: 'Active Products', value: '0', change: '...', trending: 'neutral', icon: Package },
    { label: 'Total Branches', value: '0', change: '0%', trending: 'neutral', icon: MapPin },
    { label: 'Pending Inquiries', value: '0', change: '...', trending: 'neutral', icon: Clock },
  ]);

  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // 1. Total Requests (Inquiries)
        const { count: totalRequests } = await supabase
          .from('inquiries')
          .select('*', { count: 'exact', head: true });

        // 2. Active Products
        const { count: activeProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true);

        // 3. Total Branches
        const { count: totalBranches } = await supabase
          .from('branches')
          .select('*', { count: 'exact', head: true });

        // 4. Pending Inquiries
        const { count: pendingInquiries } = await supabase
          .from('inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new');

        // 5. Recent Inquiries
        const { data: recentData } = await supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setStats([
          { label: 'Total Requests', value: (totalRequests || 0).toString(), change: '', trending: 'neutral', icon: Users },
          { label: 'Active Products', value: (activeProducts || 0).toString(), change: '', trending: 'neutral', icon: Package },
          { label: 'Total Branches', value: (totalBranches || 0).toString(), change: '', trending: 'neutral', icon: MapPin },
          { label: 'Pending Inquiries', value: (pendingInquiries || 0).toString(), change: '', trending: 'neutral', icon: Clock },
        ]);

        if (recentData) {
          setRecentInquiries(recentData.map(iq => ({
            id: iq.id,
            name: iq.full_name,
            type: iq.type === 'farmer_interest' ? 'Farmer Registration' : 'Contact Inquiry',
            status: iq.status.charAt(0).toUpperCase() + iq.status.slice(1),
            time: new Date(iq.created_at).toLocaleDateString()
          })));
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className={styles.homeContainer}>
      <div className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <div key={idx} className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.iconBox}>
                <stat.icon size={24} />
              </div>
              <span className={`${styles.trending} ${styles[stat.trending]}`}>
                {stat.change}
                {stat.change && (stat.trending === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />)}
              </span>
            </div>
            <div className={styles.statInfo}>
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.mainPanel}>
          <div className={styles.panelHeader}>
            <h3>Recent Inquiries</h3>
            <button className={styles.textBtn}>View All</button>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{textAlign: 'center', padding: '2rem'}}>Loading recent inquiries...</td></tr>
                ) : recentInquiries.length === 0 ? (
                  <tr><td colSpan={5} style={{textAlign: 'center', padding: '2rem'}}>No inquiries found.</td></tr>
                ) : recentInquiries.map((inquiry) => (
                  <tr key={inquiry.id}>
                    <td>{inquiry.name}</td>
                    <td>{inquiry.type}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[inquiry.status.toLowerCase()]}`}>
                        {inquiry.status}
                      </span>
                    </td>
                    <td>{inquiry.time}</td>
                    <td>
                      <button className={styles.actionBtn}>Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.sidePanel}>
          <div className={styles.panelHeader}>
            <h3>System Status</h3>
          </div>
          <div className={styles.statusList}>
            <div className={styles.statusItem}>
              <CheckCircle2 size={18} color="#2e4f2e" />
              <div>
                <p className={styles.statusTitle}>Supabase Connection</p>
                <p className={styles.statusDesc}>Operational</p>
              </div>
            </div>
            <div className={styles.statusItem}>
              <CheckCircle2 size={18} color="#2e4f2e" />
              <div>
                <p className={styles.statusTitle}>Auth Service</p>
                <p className={styles.statusDesc}>Operational</p>
              </div>
            </div>
            <div className={styles.statusItem}>
              <CheckCircle2 size={18} color="#2e4f2e" />
              <div>
                <p className={styles.statusTitle}>Storage Bucket</p>
                <p className={styles.statusDesc}>85% Capacity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
