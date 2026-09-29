'use client';

import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, Trash2, MessageCircle, Mail, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import styles from './Inquiries.module.css';

export default function InquiriesManager() {
  const [filter, setFilter] = useState('all');
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const data = await adminApi.getBranches();
      if (data) setBranches(data);
    } catch (err: any) {
      console.error('Fetch branches error:', err);
    }
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getInquiries();
      if (data) setInquiries(data);
    } catch (err: any) {
      console.error('Fetch inquiries error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchChange = async (inquiryId: string, branchId: string) => {
    setUpdatingId(inquiryId);
    try {
      await adminApi.updateInquiry(inquiryId, { assigned_branch_id: branchId || null });
      setInquiries(inquiries.map(i => i.id === inquiryId ? { ...i, assigned_branch_id: branchId || null } : i));
    } catch (err: any) {
      alert('Error assigning branch: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSendEmail = async (inquiry: any) => {
    if (!inquiry.assigned_branch_id) {
      alert('Please assign a branch first');
      return;
    }

    setSendingEmailId(inquiry.id);
    try {
      const res: any = await adminApi.sendManagerEmail(inquiry.id, inquiry.assigned_branch_id);
      alert(res.message || 'Notification email sent to branch manager!');
      setInquiries(inquiries.map(i => i.id === inquiry.id ? { ...i, status: 'contacted' } : i));
    } catch (err: any) {
      alert('Failed to send manager email: ' + err.message);
    } finally {
      setSendingEmailId(null);
    }
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
    
    const message = `🌱 *NEW FARMER INQUIRY* 🌱\n\nDear Branch Manager,\n\nWe have received a new registration request for your branch.\n\n👤 *Customer Name:* ${inquiry.full_name}\n📞 *Contact Number:* ${inquiry.phone || 'N/A'}\n📍 *Location:* ${location}\n\nThe customer is interested in joining as a farmer. Please:\n✅ Contact them to initiate the registration.\n✅ Assign a Field Visitor to their location.\n\nThank you,\n*Nature Farming Admin*`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    window.open(waUrl, '_blank');
  };

  const markResolved = async (id: string) => {
    try {
      await adminApi.updateInquiry(id, { status: 'closed' });
      setInquiries(inquiries.map(i => i.id === id ? { ...i, status: 'closed' } : i));
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteInquiry(id);
      setInquiries(inquiries.filter(i => i.id !== id));
      setDeletingId(null);
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
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading inquiries...</td></tr>
            ) : filteredInquiries.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No inquiries found.</td></tr>
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
                    color: inquiry.status === 'closed' ? '#22c55e' : (inquiry.status === 'contacted' ? '#3b82f6' : '#f59e0b'), 
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
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button 
                        className={`${styles.iconBtn} ${styles.view}`} 
                        title="View details" 
                        onClick={() => alert(`Location: ${inquiry.district || inquiry.city || 'Not specified'}\n\nMessage: ${inquiry.message || 'None'}\n\nSubject: ${inquiry.subject || 'None'}`)}
                      >
                        <Eye size={18} />
                      </button>

                      {inquiry.type === 'farmer_interest' && (
                        <>
                          <button 
                            className={styles.whatsAppBtn}
                            onClick={() => forwardToWhatsApp(inquiry)} 
                            title="Forward to Manager via WhatsApp"
                          >
                            <MessageCircle size={18} />
                          </button>
                          <button 
                            className={styles.iconBtn}
                            style={{ backgroundColor: '#1e40af', color: 'white', borderRadius: '6px', padding: '6px' }}
                            onClick={() => handleSendEmail(inquiry)}
                            disabled={sendingEmailId === inquiry.id}
                            title="Send Email Alert to Branch Manager"
                          >
                            {sendingEmailId === inquiry.id ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                          </button>
                        </>
                      )}

                      {inquiry.status !== 'closed' && (
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
