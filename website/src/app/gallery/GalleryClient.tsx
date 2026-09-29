'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Filter } from 'lucide-react';
import { api, getImageUrl } from '@/lib/api';
import styles from './Gallery.module.css';

export default function GalleryPage() {
  const [filter, setFilter] = useState('all');
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  const STATIC_IMAGES = [
    { id: 'v1', type: 'video', youtube_id: 'IKsmFFG4aaQ', title: 'Our Plantation Process', category: 'journey' },
    { id: 'v2', type: 'video', youtube_id: 'ohmmNRwHcpk', title: 'Harvesting Aloe Vera', category: 'journey' },
    { id: 's1', image_url: '/WhatsApp Image 2025-10-13 at 11.02.33 AM (1).jpeg', title: 'Home Grown Aloe', category: 'production' },
    { id: 's2', image_url: '/9b9ccd87-044b-4de5-a020-a7b6e7c2475b.jpg', title: 'Vibrant Aloe Field', category: 'farms' },
    { id: 's3', image_url: '/c0424c44-7c51-4718-b18a-e1adc199aef2.jpg', title: 'Our Dedicated Farmers', category: 'farmers' },
    { id: 's4', image_url: '/dd7b5267-2ff2-497d-94c9-7c7d49ad5f03.jpg', title: 'Careful Selection', category: 'farmers' },
    { id: 's5', image_url: '/fee9b7ee-c504-4700-9bf4-ac2ebe105ffe.jpg', title: 'Sustainable Cultivation', category: 'farms' }
  ];

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const data = await api.getGallery();
    if (data) setImages([...STATIC_IMAGES, ...data]);
    else setImages(STATIC_IMAGES);
    setLoading(false);
  };

  const journeyVideos = STATIC_IMAGES.filter(img => img.category === 'journey');
  const filteredImages = filter === 'all' 
    ? images.filter(img => img.category !== 'journey') 
    : images.filter(img => img.category === filter);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" as const }
    }
  } as const;

  const layoutTransition = {
    type: "tween" as const,
    ease: "circOut" as const,
    duration: 0.4
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          Our Gallery
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          A visual journey through our farms, processes, and community.
        </motion.p>
      </header>

      {/* Dedicated Journey Section */}
      <section className="mb-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-3xl md:text-4xl font-serif text-primary">Our Journey</h2>
          <div className="h-px flex-1 bg-primary/10" />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {journeyVideos.map((vid) => (
            <motion.div 
              key={vid.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden glass-card p-3 shadow-2xl group cursor-pointer"
              onClick={() => setSelectedImage(vid)}
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <iframe
                  className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                  src={`https://www.youtube.com/embed/${vid.youtube_id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${vid.youtube_id}&rel=0`}
                  allow="autoplay; encrypted-media"
                  title={vid.title}
                />
                <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-500" />
              </div>
              <div className="mt-4 px-2">
                <h3 className="text-xl font-bold text-primary">{vid.title}</h3>
                <p className="text-sm text-dark/50 italic">Official Documentary</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <main className={styles.main}>
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={styles.filters}
        >
          {['all', 'farms', 'production', 'products', 'farmers', 'other'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '5rem'}}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
            <p className="italic text-primary/60">Loading our harvest memories...</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            layout
            transition={layoutTransition}
            className={styles.grid}
          >
            <AnimatePresence mode="popLayout">
              {filteredImages.map((img) => (
                <motion.div 
                  key={img.id}
                  layout
                  transition={layoutTransition}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className={styles.imageWrapper}
                  onClick={() => setSelectedImage(img)}
                >
                  {img.type === 'video' ? (
                    <div className="relative w-full h-full aspect-[4/5] md:aspect-square">
                      <iframe
                        className="w-full h-full border-0 pointer-events-none"
                        src={`https://www.youtube.com/embed/${img.youtube_id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${img.youtube_id}&rel=0`}
                        allow="autoplay; encrypted-media"
                        title={img.title}
                      />
                    </div>
                  ) : (
                    <img 
                      src={getImageUrl(img.image_url)} 
                      alt={img.title} 
                      className={styles.image} 
                    />
                  )}
                  <div className={styles.overlay}>
                    <h4>{img.title || 'Nature Farming'}</h4>
                    {img.type === 'video' && <span className="text-[10px] uppercase tracking-widest mt-2 bg-accent/20 px-2 py-1 rounded">Video</span>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Premium Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.lightboxOverlay}
            onClick={() => setSelectedImage(null)}
          >
            <button className={styles.closeBtn}>
              <X size={40} strokeWidth={1.5} />
            </button>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={styles.lightboxContent}
              onClick={(e) => e.stopPropagation()}
            >
              {selectedImage.type === 'video' ? (
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
                  <iframe
                    className="w-full h-full border-0"
                    src={`https://www.youtube.com/embed/${selectedImage.youtube_id}?autoplay=1&rel=0`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    title={selectedImage.title}
                  />
                </div>
              ) : (
                <img 
                  src={getImageUrl(selectedImage.image_url)} 
                  alt={selectedImage.title} 
                  className={styles.lightboxImage} 
                />
              )}
              <div className={styles.lightboxInfo}>
                <h3>{selectedImage.title || 'Nature Farming Experience'}</h3>
                <p>{selectedImage.category.charAt(0).toUpperCase() + selectedImage.category.slice(1)} • Sri Lanka</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
