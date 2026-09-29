'use client';

import React, { useState, useEffect } from 'react';
import { api, getImageUrl } from '@/lib/api';
import Section from '@/components/Section';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';
import { Leaf, Box } from 'lucide-react';
import AdCarousel from '@/components/ui/AdCarousel';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchBanners();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const data = await api.getProducts();
    if (data) {
      setProducts(data.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        image: getImageUrl(p.image_url),
        category: p.product_categories?.name,
        isFarmerExclusive: p.product_categories?.name === 'Raw Materials'
      })));
    }
    setLoading(false);
  };

  const fetchBanners = async () => {
    const data = await api.getBanners();
    if (data) {
      setBanners(data.map((b: any) => ({
        ...b,
        image_url: getImageUrl(b.image_url),
      })));
    }
  };

  const rawMaterials = products.filter(p => p.isFarmerExclusive);
  const handcraftedProducts = products.filter(p => !p.isFarmerExclusive);

  return (
    <div className="pt-24 md:pt-32">
      {/* Elegant Header Area */}
      <section className="bg-primary py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/50 via-transparent to-transparent" />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-6">Our Catalog</h1>
            <p className="max-w-2xl mx-auto text-light/70 text-lg md:text-xl font-luxury italic">
              From the raw healing power of fresh harvest to our artisanal wellness creations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Advertisement Carousel */}
      {banners.length > 0 && (
        <div className="pt-16 px-6">
          <AdCarousel banners={banners} />
        </div>
      )}

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Handcrafted Section */}
          {handcraftedProducts.length > 0 && (
            <Section 
              title="Handcrafted Wellness" 
              subtitle="The Creations" 
              bgVariant="warm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {handcraftedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </Section>
          )}

          {/* Raw Materials Section */}
          {rawMaterials.length > 0 && (
            <Section 
              title="Farm Fresh Materials" 
              subtitle="The Source" 
              bgVariant="earth"
            >
              <div className="mb-10 p-6 glass-card border-l-4 border-gold bg-gold/5 flex items-start gap-4">
                <Leaf className="text-gold flex-none" size={24} />
                <div>
                  <h4 className="font-bold text-dark mb-1">Farmer Exclusive Catalog</h4>
                  <p className="text-sm text-dark/70">Raw materials are strictly for our registered farming network. Please contact your local branch for inquiries.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 grayscale-[0.4] hover:grayscale-0 transition-all duration-700">
                {rawMaterials.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </Section>
          )}

          {products.length === 0 && (
            <div className="py-20 text-center">
              <Box className="mx-auto text-primary/20 mb-4" size={64} />
              <h3 className="text-2xl font-serif text-primary">No products found</h3>
              <p className="text-dark/50">Please check back later for our new harvest.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
