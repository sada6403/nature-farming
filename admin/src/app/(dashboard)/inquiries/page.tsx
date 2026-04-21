'use client';

import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, Trash2, MessageCircle, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './Inquiries.module.css';

export default function InquiriesManager() {
  const [filter, setFilter] = useState('all');
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    // Fetch branch name and phone for WhatsApp forwarding
    const { data } = await supabase.from('branches').select('id, name, phone');
    if (data) setBranches(data);
  };

  const fetchInquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setInquiries(data);
    }
    setLoading(false);
  };

  const handleBranchChange = async (inquiryId: string, branchId: string) => {
    setUpdatingId(inquiryId);
    const { error } = await supabase
      .from('inquiries')
      .update({ assigned_branch_id: branchId || null })
      .eq('id', inquiryId);

    if (!error) {
      setInquiries(inquiries.map(i => i.id === inquiryId ? { ...i, assigned_branch_id: branchId || null } : i));
    } else {
      alert('Error assigning branch: ' + error.message);
    }
    setUpdatingId(null);
  };

  const forwardToWhatsApp = (inquiry: any) => {
    if (!inquiry.assigned_branch_id) {
      alert('Please assign a branch first');
      return;
    }

    const branch = branches.find(b => b.id === inquiry.assigned_branch_id);
    if (!branch || !branch.phone) {
      alert('Selected branch does not have a contact number');
      return;
    }

    const cleanPhone = branch.phone.replace(/[^0-9]/g, '');
    const location = inquiry.district || inquiry.city || 'Not Specified';
    
    // Attractive WhatsApp Message Template with Emojis and Formatting
    const message = `🌱 *NEW FARMER INQUIRY* 🌱\n\nDear Branch Manager,\n\nWe have received a new registration request for your branch.\n\n👤 *Customer Name:* ${inquiry.full_name}\n📞 *Contact Number:* ${inquiry.phone || 'N/A'}\n📍 *Location:* ${location}\n\nThe customer is interested in joining as a farmer. Please:\n✅ Contact them to initiate the registration.\n✅ Assign a Field Visitor to their location.\n\nThank you,\n*Nature Farming Admin*`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    window.open(waUrl, '_blank');
  };

  const markResolved = async (id: string) => {
    const { error } = await supabase
      .from('inquiries')
      .update({ status: 'resolved' })
      .eq('id', id);
      
    if (!error) {
      setInquiries(inquiries.map(i => i.id === id ? { ...i, status: 'resolved' } : i));
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('inquiries').delete().eq('id', id);
      if (!error) {
        setInquiries(inquiries.filter(i => i.id !== id));
        setDeletingId(null);
      } else {
        throw error;
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
      setDeletingId(null);
    }
  };

  const filteredInquiries = filter === 'all' ? inquiries : inquiries.filter(i => i.type === filter);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Inquiries Inbox</h1>
      </div>

      <div className={styles.filters}>
        <button className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`${styles.filterBtn} ${filter === 'farmer_interest' ? styles.active : ''}`} onClick={() => setFilter('farmer_interest')}>Farmers</button>
        <button className={`${styles.filterBtn} ${filter === 'contact' ? styles.active : ''}`} onClick={() => setFilter('contact')}>General Contact</button>
      </div>

      <div className={styles.tableWrapper}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name & Contact</th>
              <th>Type</th>
              <th>Assigned Branch</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : filteredInquiries.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No inquiries found.</td></tr>
            ) : filteredInquiries.map(inquiry => (
              <tr key={inquiry.id}>
                <td>{new Date(inquiry.created_at).toLocaleDateString()}</td>
                <td>
                  <div>
                    <strong style={{ display: 'block' }}>{inquiry.full_name}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{inquiry.phone || inquiry.email}</span>
                  </div>
                </td>
                <td>
                  <span className={`${styles.badge} ${inquiry.type === 'farmer_interest' ? styles.typeFarmer : styles.typeContact}`}>
                    {inquiry.type === 'farmer_interest' ? 'Farmer' : 'Contact'}
                  </span>
                </td>
                <td>
                  {inquiry.type === 'farmer_interest' ? (
                    <select 
                      className={styles.branchSelector}
                      value={inquiry.assigned_branch_id || ''}
                      onChange={(e) => handleBranchChange(inquiry.id, e.target.value)}
                      disabled={updatingId === inquiry.id}
                    >
                      <option value="">Select Branch...</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>N/A (General)</span>
                  )}
                </td>
                <td>
                  <span style={{ 
                    color: inquiry.status === 'resolved' ? '#22c55e' : '#f59e0b', 
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }}>
                    {inquiry.status.toUpperCase()}
                  </span>
                </td>
                <td className={styles.tdAction} style={{ textAlign: 'right' }}>
                  {deletingId === inquiry.id ? (
                    <div className={styles.inlineConfirm}>
                      <button className={styles.confirmYes} onClick={() => handleDelete(inquiry.id)}>Delete?</button>
                      <button className={styles.confirmNo} onClick={() => setDeletingId(null)}>No</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        className={`${styles.iconBtn} ${styles.view}`} 
                        title="View details" 
                        onClick={() => alert(`Location: ${inquiry.district || inquiry.city}\n\nMessage: ${inquiry.message}`)}
                      >
                        <Eye size={18} />
                      </button>

                      {inquiry.type === 'farmer_interest' && (
                        <button 
                          className={styles.whatsAppBtn}
                          onClick={() => forwardToWhatsApp(inquiry)} 
                          title="Forward Details to Branch Manager via WhatsApp"
                        >
                          <MessageCircle size={18} />
                        </button>
                      )}

                      {inquiry.status !== 'resolved' && (
                        <button 
                          className={`${styles.iconBtn} ${styles.resolve}`}
                          onClick={() => markResolved(inquiry.id)} 
                          title="Mark as resolved"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}

                      <button 
                        className={`${styles.iconBtn} ${styles.delete}`}
                        onClick={() => setDeletingId(inquiry.id)} 
                        title="Delete Inquiry"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
