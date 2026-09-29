'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { adminApi } from '@/lib/api';
import styles from './Branches.module.css';

export default function BranchesManager() {
  const [branches, setBranches] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    district: '', 
    address: '', 
    phone: '',
    manager_name: '',
    email: '',
    map_url: ''
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBranches();
      if (data) setBranches(data);
    } catch (err: any) {
      console.error('Fetch branches error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        const updated = await adminApi.updateBranch(editingBranch.id, formData);
        setBranches(branches.map(b => b.id === editingBranch.id ? { ...b, ...formData } : b));
        closeModal();
      } else {
        const created = await adminApi.createBranch(formData);
        setBranches([...branches, created]);
        closeModal();
      }
    } catch (err: any) {
      alert('Error saving branch: ' + err.message);
    }
  };

  const openModal = (branch: any = null) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name || '',
        district: branch.district || '',
        address: branch.address || '',
        phone: branch.phone || '',
        manager_name: branch.manager_name || '',
        email: branch.email || '',
        map_url: branch.map_url || ''
      });
    } else {
      setEditingBranch(null);
      setFormData({ name: '', district: '', address: '', phone: '', manager_name: '', email: '', map_url: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
    setFormData({ name: '', district: '', address: '', phone: '', manager_name: '', email: '', map_url: '' });
  };

  const handleDeletePermanent = async (id: string) => {
    try {
      await adminApi.deleteBranch(id);
      setBranches(branches.filter(b => b.id !== id));
      setDeletingId(null);
    } catch (err: any) {
      alert('Error deleting branch: ' + err.message);
      setDeletingId(null);
    }
  };

  const toggleStatus = async (branch: any) => {
    const newStatus = !branch.is_active;
    try {
      await adminApi.updateBranch(branch.id, { is_active: newStatus });
      setBranches(branches.map(b => b.id === branch.id ? { ...b, is_active: newStatus } : b));
    } catch (err: any) {
      alert('Error changing status: ' + err.message);
    }
  };

  const filteredBranches = branches.filter(b => showInactive || b.is_active);
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Branch Management</h1>
        <div className={styles.headerActions}>
          <button 
            className={`${styles.filterBtn} ${showInactive ? styles.activeFilter : ''}`} 
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? 'Showing All' : 'Showing Active Only'}
          </button>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <Plus size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }}/> 
            Add Branch
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table>
          <thead>
            <tr>
              <th>Branch Name</th>
              <th>District</th>
              <th>Phone</th>
              <th className={styles.thAction}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={4} style={{textAlign:'center', padding: '2rem'}}>Loading...</td></tr> : filteredBranches.map(branch => (
              <tr key={branch.id} className={!branch.is_active ? styles.inactiveRow : ''}>
                <td>
                  {branch.name}
                  {!branch.is_active && <span className={styles.inactiveBadge}>Inactive</span>}
                </td>
                <td>{branch.district}</td>
                <td>{branch.phone}</td>
                 <td className={styles.tdAction}>
                  <div className={styles.actions}>
                    {deletingId === branch.id ? (
                      <div className={styles.inlineConfirm}>
                        <button className={styles.confirmYes} onClick={(e) => { e.stopPropagation(); handleDeletePermanent(branch.id); }}>Yes, Delete</button>
                        <button className={styles.confirmNo} onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}>No</button>
                      </div>
                    ) : (
                      <>
                        <button className={styles.iconBtn} onClick={() => openModal(branch)} title="Edit Branch">
                          <Edit2 size={18} />
                        </button>
                        
                        <button 
                          className={`${styles.iconBtn} ${branch.is_active ? styles.active : styles.inactive}`} 
                          onClick={() => toggleStatus(branch)}
                          title={branch.is_active ? 'Deactivate Branch' : 'Activate Branch'}
                        >
                          {branch.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>

                        <button 
                          className={`${styles.iconBtn} ${styles.delete}`} 
                          onClick={(e) => { e.stopPropagation(); setDeletingId(branch.id); }}
                          title="Permanent Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</h2>
              <button className={styles.closeBtn} onClick={closeModal}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="grid md:grid-cols-2 gap-4">
                <div className={styles.formGroup}>
                  <label>Branch Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className={styles.formGroup}>
                  <label>District</label>
                  <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className={styles.formGroup}>
                  <label>Manager Name</label>
                  <input type="text" value={formData.manager_name} onChange={e => setFormData({...formData, manager_name: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Manager Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className={styles.formGroup}>
                  <label>Phone</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Google Maps URL</label>
                  <input type="url" value={formData.map_url} onChange={e => setFormData({...formData, map_url: e.target.value})} placeholder="https://goo.gl/maps/..." />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Address</label>
                <textarea rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required></textarea>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  {editingBranch ? 'Update Branch' : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
