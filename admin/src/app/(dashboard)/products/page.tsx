'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './Products.module.css';

export default function ProductsManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
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

  // Removed dropdown click-outside logic

  const fetchData = async () => {
    setLoading(true);
    const [catRes, prodRes] = await Promise.all([
      supabase.from('product_categories').select('*'),
      supabase.from('products').select('*, product_categories(name)')
    ]);
    
    if (catRes.data) setCategories(catRes.data);
    if (prodRes.data) setProducts(prodRes.data);
    setLoading(false);
  };

  const handleEdit = (product: any) => {
    setFormData({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price.toString(),
      category_id: product.category_id,
      image_url: product.image_url || '',
      is_published: product.is_published,
      is_featured: product.is_featured
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-'),
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: formData.category_id,
      image_url: formData.image_url,
      is_published: formData.is_published,
      is_featured: formData.is_featured,
      updated_at: new Date().toISOString()
    };

    let result;
    if (formData.id) {
      result = await supabase.from('products').update(payload).eq('id', formData.id).select('*, product_categories(name)');
    } else {
      result = await supabase.from('products').insert([payload]).select('*, product_categories(name)');
    }
    
    if (!result.error && result.data) {
      if (formData.id) {
        setProducts(products.map(p => p.id === formData.id ? result.data![0] : p));
      } else {
        setProducts([...products, result.data[0]]);
      }
      setIsModalOpen(false);
      resetForm();
    } else {
      alert('Error saving product: ' + (result.error?.message || 'Unknown error'));
    }
  };

  const resetForm = () => {
    setFormData({ id: null, name: '', slug: '', description: '', price: '', category_id: '', image_url: '', is_published: true, is_featured: false });
  };

  const handleDeletePermanent = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
      setDeletingId(null);
    } catch (err: any) {
      alert('Database Error: ' + err.message + '\n\nNote: Permanent delete fails if this product is linked to other data.');
      setDeletingId(null);
    }
  };

  const togglePublishStatus = async (product: any) => {
    const newStatus = !product.is_published;
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_published: newStatus })
        .eq('id', product.id);
        
      if (error) throw error;
      
      setProducts(products.map(p => p.id === product.id ? { ...p, is_published: newStatus } : p));
      setOpenActionId(null);
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
            {loading ? <tr><td colSpan={5} style={{textAlign:'center'}}>Loading...</td></tr> : filteredProducts.map(product => (
              <tr key={product.id} className={!product.is_published ? styles.inactiveRow : ''}>
                <td>
                  <div style={{ fontWeight: 600 }}>{product.name}</div>
                  {product.is_featured && <span style={{ fontSize: '0.7rem', color: '#b5d045', fontWeight: 700 }}>★ FEATURED</span>}
                </td>
                <td>{product.product_categories?.name}</td>
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
                  <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Image URL</label>
                  <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="e.g. /aloe-soap.png" />
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
