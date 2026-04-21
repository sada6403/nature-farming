import React from 'react';

export default function PrivacyPage() {
  return (
    <div style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-family-serif)', fontSize: '3rem', marginBottom: '2rem', color: 'var(--color-primary)' }}>Privacy Policy</h1>
      <p style={{ marginBottom: '1.5rem', lineHeight: '1.8' }}>
        At Nature Farming, we value your privacy. This policy explains how we collect and use your data when you visit our website or join our farmer network.
      </p>
      <h2 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem' }}>Information We Collect</h2>
      <p>We collect information you provide directly to us through contact forms, farmer applications, and inquiry submissions.</p>
      <h2 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem' }}>How We Use It</h2>
      <p>Your data is used solely to respond to your requests, manage our farmer network, and improve our services. We do not sell your personal data to third parties.</p>
    </div>
  );
}
