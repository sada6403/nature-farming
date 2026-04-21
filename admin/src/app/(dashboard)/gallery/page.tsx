'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/image-utils';
import styles from './Gallery.module.css';

export default function GalleryManager() {
  const [images, setImages] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  
  const [formData, setFormData] = useState({
    id: null as string | null,
    title: '',
    image_url: '',
    category: 'farms'
  });

  const categories = ['farms', 'production', 'products', 'farmers', 'other'];

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setImages(data);
    setLoading(false);
  };

  const handleEdit = (image: any) => {
    setFormData({
      id: image.id,
      title: image.title || '',
      image_url: image.image_url,
      category: image.category || 'farms'
    });
    setPreviewUrl(image.image_url);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('gallery')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      console.log('Starting save process...');
      let finalImageUrl = formData.image_url;

      // 1. Upload file if selected
      if (selectedFile) {
        console.log('Optimizing and uploading file...');
        setOptimizing(true);
        const compressedBlob = await compressImage(selectedFile, 1280, 0.7);
        const optimizedFile = new File([compressedBlob], selectedFile.name, { type: 'image/jpeg' });
        finalImageUrl = await uploadImage(optimizedFile);
        console.log('File uploaded successfully. URL:', finalImageUrl);
        setOptimizing(false);
      } else if (!formData.id && !selectedFile) {
        throw new Error('Please select an image file');
      }

      const payload = {
        title: formData.title || 'Untitled',
        image_url: finalImageUrl,
        category: formData.category || 'other',
      };

      console.log('Inserting/Updating metadata in database:', payload);
      
      let result;
      if (formData.id) {
        result = await supabase.from('gallery').update(payload).eq('id', formData.id).select();
      } else {
        result = await supabase.from('gallery').insert([payload]).select();
      }

      if (result.error) {
        console.error('Database Operation Error:', result.error);
        throw new Error(`Database Error: ${result.error.message}`);
      }

      console.log('Database result:', result.data);

      if (result.data && result.data.length > 0) {
        if (formData.id) {
          setImages(images.map(img => img.id === formData.id ? result.data![0] : img));
        } else {
          setImages([result.data[0], ...images]);
        }
        setIsModalOpen(false);
        resetForm();
        alert('Image saved successfully!');
      } else {
        throw new Error('Success received from database but no record returned. Please refresh.');
      }
    } catch (err: any) {
      console.error('Full Error Object:', err);
      alert('Failed: ' + (err.message || 'Unknown error occurred.'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: any) => {
    try {
      // 1. Extract filename from URL to delete from storage
      // Handling potential query parameters in URL
      const fullFileName = image.image_url.split('/').pop();
      const fileName = fullFileName?.split('?')[0];
      
      // 2. Delete from Storage
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('gallery')
          .remove([fileName]);
        
        if (storageError) console.error('Storage cleanup warning:', storageError);
      }

      // 3. Delete from Database
      const { error } = await supabase.from('gallery').delete().eq('id', image.id);
      
      if (!error) {
        setImages(images.filter(img => img.id !== image.id));
        setDeletingId(null);
      } else {
        throw error;
      }
    } catch (err: any) {
      alert('Error deleting image: ' + err.message);
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({ id: null, title: '', image_url: '', category: 'farms' });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Gallery Management</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }}/> 
          Add New Image
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading images...</div>
      ) : (
        <div className={styles.grid}>
          {images.map((image) => (
            <div key={image.id} className={styles.imageCard}>
              <div className={styles.imageWrapper}>
                <img src={image.image_url} alt={image.title} className={styles.thumbnail} />
                  <div className={styles.cardActions}>
                    {deletingId === image.id ? (
                      <div className={styles.inlineConfirm}>
                        <button className={styles.confirmYes} onClick={(e) => { e.stopPropagation(); handleDelete(image); }}>Confirm Delete?</button>
                        <button className={styles.confirmNo} onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}>Cancel</button>
                      </div>
                    ) : (
                      <>
                        <button className={styles.actionBtn} onClick={() => handleEdit(image)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className={`${styles.actionBtn} ${styles.delete}`} onClick={(e) => { e.stopPropagation(); setDeletingId(image.id); }} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
              </div>
              <div className={styles.cardContent}>
                <h3>{image.title || 'Untitled'}</h3>
                <span className={styles.categoryBadge}>{image.category}</span>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: '#64748b' }}>
              <ImageIcon size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>No images in gallery. Click "Add New Image" to get started.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{formData.id ? 'Edit ImageDetails' : 'Add New Gallery Image'}</h2>
              <button className={styles.btnCancel} style={{padding: '5px'}} onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className={styles.formGroup}>
                <label>Select Image File</label>
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
                  <p className={styles.previewLabel}>Image Preview</p>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Image Title (Optional)</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. Organic Aloe Harvest"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Category</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  required
                >
                  {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)} disabled={uploading}>Cancel</button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={uploading}
                  style={{ padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: uploading ? 0.7 : 1 }}
                >
                  {optimizing ? 'Optimizing Image...' : (uploading ? 'Uploading...' : (formData.id ? 'Save Changes' : 'Add to Gallery'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
