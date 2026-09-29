'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Tv, ExternalLink } from 'lucide-react';
import { adminApi, getImageUrl } from '@/lib/api';
import { compressImage } from '@/lib/image-utils';
import styles from './Banners.module.css';

export default function BannersManager() {
  const [banners, setBanners] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    id: null as string | null,
    title: '',
    image_url: '',
    link: '',
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBanners();
      if (data) setBanners(data);
    } catch (err: any) {
      console.error('Fetch banners error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner: any) => {
    setFormData({
      id: banner.id,
      title: banner.title || '',
      image_url: banner.image_url,
      link: banner.link || '',
      is_active: banner.is_active,
      display_order: banner.display_order || 0
    });
    setPreviewUrl(getImageUrl(banner.image_url));
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let finalImageUrl = formData.image_url;

      if (selectedFile) {
        setOptimizing(true);
        const compressedBlob = await compressImage(selectedFile, 1920, 0.7);
        const optimizedFile = new File([compressedBlob], selectedFile.name, { type: 'image/jpeg' });
        setOptimizing(false);

        const uploadRes = await adminApi.uploadImage(optimizedFile);
        finalImageUrl = uploadRes.relativeUrl || uploadRes.url;
      } else if (!formData.id && !selectedFile) {
        throw new Error('Please select an image file');
      }

      const payload = {
        title: formData.title || '',
        image_url: finalImageUrl,
        link: formData.link || '',
        is_active: formData.is_active,
        display_order: formData.display_order
      };

      if (formData.id) {
        const updated = await adminApi.updateBanner(formData.id, payload);
        setBanners(banners.map(b => b.id === formData.id ? updated : b));
      } else {
        const created = await adminApi.createBanner(payload);
        setBanners([...banners, created]);
      }

      setIsModalOpen(false);
      resetForm();
      alert('Banner saved successfully!');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setUploading(false);
      setOptimizing(false);
    }
  };

  const handleDelete = async (banner: any) => {
    try {
      await adminApi.deleteBanner(banner.id);
      
      const fileName = banner.image_url?.split('/').pop()?.split('?')[0];
      if (fileName && banner.image_url.includes('/uploads/')) {
        adminApi.deleteUploadedFile(fileName).catch(() => {});
      }

      setBanners(banners.filter(b => b.id !== banner.id));
      setDeletingId(null);
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    }
  };

  const toggleStatus = async (banner: any) => {
    const newStatus = !banner.is_active;
    try {
      await adminApi.updateBanner(banner.id, { is_active: newStatus });
      setBanners(banners.map(b => b.id === banner.id ? { ...b, is_active: newStatus } : b));
    } catch (err: any) {
      alert('Error toggling status: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({ id: null, title: '', image_url: '', link: '', is_active: true, display_order: 0 });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Product Screen Banners</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }}/> 
          Add New Banner
        </button>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <p className="text-sm text-blue-700 font-medium">
          Note: Banners are displayed in a looping carousel at the top of the Product page on the website.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading banners...</div>
      ) : (
        <div className={styles.grid}>
          {banners.map((banner) => (
            <div key={banner.id} className={styles.bannerCard}>
              <div className={styles.imageWrapper}>
                <img src={getImageUrl(banner.image_url)} alt={banner.title} className={styles.thumbnail} />
                <div className={styles.cardActions}>
                  <button className={styles.actionBtn} onClick={() => handleEdit(banner)} title="Edit">
                    <Edit2 size={16} />
                  </button>
                  {deletingId === banner.id ? (
                    <button className={`${styles.actionBtn} ${styles.confirmYes}`} onClick={() => handleDelete(banner)}>
                      Confirm
                    </button>
                  ) : (
                    <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => setDeletingId(banner.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.cardContent}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0 }}>{banner.title || 'Untitled Banner'}</h3>
                  <button 
                    onClick={() => toggleStatus(banner)}
                    className={`${styles.statusBadge} ${banner.is_active ? styles.active : styles.inactive}`}
                    title="Toggle Visibility"
                  >
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
                {banner.link && (
                  <p className="text-xs text-blue-500 flex items-center gap-1 italic">
                    <ExternalLink size={12} /> {banner.link}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">Order: {banner.display_order}</p>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: '#64748b' }}>
              <Tv size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>No banners found. Add one to show on the website.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{formData.id ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button className={styles.btnCancel} style={{padding: '5px'}} onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className={styles.formGroup}>
                <label>Banner Image File</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
              </div>

              {previewUrl && (
                <div className={styles.previewContainer}>
                  <img src={previewUrl} alt="Preview" className={styles.uploadPreview} />
                  <p className="text-xs text-gray-500 mt-1 italic">Image Preview</p>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Title (Optional)</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. New Harvest Season"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Click Action Link (Optional)</label>
                <input 
                  type="text" 
                  value={formData.link} 
                  onChange={e => setFormData({...formData, link: e.target.value})} 
                  placeholder="e.g. /products or https://wa.me/..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>Display Order</label>
                  <input 
                    type="number" 
                    value={formData.display_order} 
                    onChange={e => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className={styles.formGroup} style={{ flex: 1, display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.is_active} 
                      onChange={e => setFormData({...formData, is_active: e.target.checked})}
                      style={{ width: 'auto' }}
                    />
                    Is Active?
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.btnSave} disabled={uploading}>
                  {optimizing ? 'Optimizing...' : (uploading ? 'Uploading...' : 'Save Banner')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
