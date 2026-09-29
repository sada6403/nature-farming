'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Eye, EyeOff, Upload, Loader2 } from 'lucide-react';
import { adminApi, getImageUrl } from '@/lib/api';
import styles from './Products.module.css';

export default function ProductsManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null as string | null,
    name: '',
    slug: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_published: true,
    is_featured: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        adminApi.getCategories(),
        adminApi.getProducts()
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
    } catch (err: any) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: any) => {
    setFormData({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price ? product.price.toString() : '',
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      is_published: product.is_published,
      is_featured: product.is_featured
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(file);
      if (res && res.relativeUrl) {
        setFormData(prev => ({ ...prev, image_url: res.relativeUrl }));
      }
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: formData.description,
      price: formData.price ? parseFloat(formData.price) : 0,
      category_id: formData.category_id || null,
      image_url: formData.image_url,
      is_published: formData.is_published,
      is_featured: formData.is_featured,
    };

    try {
      if (formData.id) {
        const updated = await adminApi.updateProduct(formData.id, payload);
        setProducts(products.map(p => p.id === formData.id ? updated : p));
      } else {
        const created = await adminApi.createProduct(payload);
        setProducts([created, ...products]);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      alert('Error saving product: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({ id: null, name: '', slug: '', description: '', price: '', category_id: '', image_url: '', is_published: true, is_featured: false });
  };

  const handleDeletePermanent = async (id: string) => {
    try {
      await adminApi.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      setDeletingId(null);
    } catch (err: any) {
      alert('Error deleting product: ' + err.message);
      setDeletingId(null);
    }
  };

  const togglePublishStatus = async (product: any) => {
    const newStatus = !product.is_published;
    try {
      await adminApi.updateProduct(product.id, { is_published: newStatus });
      setProducts(products.map(p => p.id === product.id ? { ...p, is_published: newStatus } : p));
    } catch (err: any) {
      alert('Error changing status: ' + err.message);
    }
  };

  const filteredProducts = products.filter(p => showInactive || p.is_published);
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Products Management</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className={`${styles.filterBtn} ${showInactive ? styles.activeFilter : ''}`} 
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? 'Showing All' : 'Showing Published Only'}
          </button>
          <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }}/> 
            Add Product
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price (LKR)</th>
              <th>Visibility</th>
              <th className={styles.thAction}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{textAlign:'center', padding: '2rem'}}>Loading...</td></tr> : filteredProducts.map(product => (
              <tr key={product.id} className={!product.is_published ? styles.inactiveRow : ''}>
                <td>
                  <div style={{ fontWeight: 600 }}>{product.name}</div>
                  {product.is_featured && <span style={{ fontSize: '0.7rem', color: '#b5d045', fontWeight: 700 }}>★ FEATURED</span>}
                </td>
                <td>{product.product_categories?.name || 'Uncategorized'}</td>
                <td>Rs. {product.price}</td>
                <td>
                  <span className={`${styles.status} ${product.is_published ? styles.active : styles.inactive}`}>
                    {product.is_published ? 'Published' : 'Hidden'}
                  </span>
                </td>
                <td className={styles.tdAction}>
                  <div className={styles.actions}>
                    {deletingId === product.id ? (
                      <div className={styles.inlineConfirm}>
                        <button className={styles.confirmYes} onClick={(e) => { e.stopPropagation(); handleDeletePermanent(product.id); }}>Yes, Delete</button>
                        <button className={styles.confirmNo} onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}>No</button>
                      </div>
                    ) : (
                      <>
                        <button className={styles.iconBtn} onClick={() => handleEdit(product)} title="Edit Product">
                          <Edit2 size={18} />
                        </button>
                        
                        <button 
                          className={`${styles.iconBtn} ${product.is_published ? styles.active : styles.inactive}`} 
                          onClick={() => togglePublishStatus(product)}
                          title={product.is_published ? 'Hide from Public' : 'Make Public'}
                        >
                          {product.is_published ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>

                        <button 
                          className={`${styles.iconBtn} ${styles.delete}`} 
                          onClick={(e) => { e.stopPropagation(); setDeletingId(product.id); }}
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
              <h2>{formData.id ? 'Edit Product' : 'Launch New Product'}</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className={styles.grid}>
                <div className={styles.formGroup}>
                  <label>Product Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required>
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div className={styles.grid}>
                <div className={styles.formGroup}>
                  <label>Price (LKR)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Image Upload or URL</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      value={formData.image_url} 
                      onChange={e => setFormData({...formData, image_url: e.target.value})} 
                      placeholder="e.g. /aloe_soap.png or upload" 
                      style={{ flex: 1 }}
                    />
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem', 
                      padding: '0.6rem 0.8rem', 
                      backgroundColor: '#2e4f2e', 
                      color: 'white', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}>
                      {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      <span>Upload</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className={styles.checkboxGroup} style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.is_published} onChange={e => setFormData({...formData, is_published: e.target.checked})} />
                  Published (Publicly Visible)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} />
                  Featured (Hero Display)
                </label>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  {formData.id ? 'Update Product' : 'Launch Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
