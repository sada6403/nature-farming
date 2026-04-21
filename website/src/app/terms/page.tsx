import React from 'react';

export default function TermsPage() {
  return (
    <div style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-family-serif)', fontSize: '3rem', marginBottom: '2rem', color: 'var(--color-primary)' }}>Terms of Service</h1>
      <p style={{ marginBottom: '1.5rem', lineHeight: '1.8' }}>
        By accessing or using the Nature Farming website, you agree to comply with and be bound by these terms. 
      </p>
      <h2 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem' }}>Intellectual Property</h2>
      <p>All content, including images, logos, and text, is the property of Nature Farming (Pvt) Ltd. (PV 00274199) and protected by copyright laws.</p>
      <h2 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem' }}>Farmer Network</h2>
      <p>Joining our farmer network is subject to field assessment and a formal agreement with Nature Farming (Pvt) Ltd. (PV 00274199).</p>
    </div>
  );
}
