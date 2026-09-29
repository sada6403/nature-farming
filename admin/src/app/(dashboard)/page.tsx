'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { 
  Users, 
  Package, 
  MapPin, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import styles from './dashboard.module.css';

export default function DashboardHome() {
  const [stats, setStats] = useState([
    { label: 'Total Requests', value: '0', change: '', trending: 'neutral', icon: Users },
    { label: 'Active Products', value: '0', change: '', trending: 'neutral', icon: Package },
    { label: 'Total Branches', value: '0', change: '', trending: 'neutral', icon: MapPin },
    { label: 'Pending Inquiries', value: '0', change: '', trending: 'neutral', icon: Clock },
  ]);

  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>({
    database: 'Operational',
    authService: 'Operational',
    storage: 'Operational'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const data = await adminApi.getDashboardStats();
        if (data) {
          setStats([
            { label: 'Total Requests', value: (data.totalRequests || 0).toString(), change: '', trending: 'neutral', icon: Users },
            { label: 'Active Products', value: (data.activeProducts || 0).toString(), change: '', trending: 'neutral', icon: Package },
            { label: 'Total Branches', value: (data.totalBranches || 0).toString(), change: '', trending: 'neutral', icon: MapPin },
            { label: 'Pending Inquiries', value: (data.pendingInquiries || 0).toString(), change: '', trending: 'neutral', icon: Clock },
          ]);

          if (data.recentInquiries) {
            setRecentInquiries(data.recentInquiries);
          }
        }

        // Fetch system status
        try {
          const status = await adminApi.getSystemStatus();
          if (status) setSystemStatus(status);
        } catch {
          // Keep defaults
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
            <Link href="/inquiries" className={styles.textBtn}>View All</Link>
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
                      <span className={`${styles.statusBadge} ${styles[inquiry.status.toLowerCase()] || styles.new}`}>
                        {inquiry.status}
                      </span>
                    </td>
                    <td>{inquiry.time}</td>
                    <td>
                      <Link href="/inquiries" className={styles.actionBtn}>Manage</Link>
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
              {systemStatus.database === 'Operational' ? (
                <CheckCircle2 size={18} color="#2e4f2e" />
              ) : (
                <AlertCircle size={18} color="#dc2626" />
              )}
              <div>
                <p className={styles.statusTitle}>PostgreSQL Database</p>
                <p className={styles.statusDesc}>{systemStatus.database}</p>
              </div>
            </div>
            <div className={styles.statusItem}>
              <CheckCircle2 size={18} color="#2e4f2e" />
              <div>
                <p className={styles.statusTitle}>REST API Backend</p>
                <p className={styles.statusDesc}>Operational (Port 5000)</p>
              </div>
            </div>
            <div className={styles.statusItem}>
              <CheckCircle2 size={18} color="#2e4f2e" />
              <div>
                <p className={styles.statusTitle}>Local Upload Storage</p>
                <p className={styles.statusDesc}>Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
