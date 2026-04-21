import React from 'react';
import styles from './FAQs.module.css';

export default function FAQsPage() {
  const faqs = [
    {
      q: "How can I join as a farmer?",
      a: "You can click on the 'Join as a Farmer' button in the navbar or footer, fill out the form, and our team will contact you for a field visit."
    },
    {
      q: "Are your products 100% natural?",
      a: "Yes, all our products are handcrafted using pure organic Aloe Vera harvested from our own Sri Lankan farms without any harmful chemicals."
    },
    {
      q: "Where are your branches located?",
      a: "We currently operate exclusively in the Northern and Eastern provinces of Sri Lanka, with branches in several districts across these regions. You can find the full list on our 'Branches' page."
    },
    {
      q: "Do you offer bulk delivery for industrial use?",
      a: "Yes, we provide bulk raw aloe leaves and gel for industrial purposes. Please contact us through the contact form for bulk pricing."
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Frequently Asked Questions</h1>
        <p>Everything you need to know about Nature Farming and our products.</p>
      </header>
      <main className={styles.main}>
        <div className={styles.faqList}>
          {faqs.map((faq, idx) => (
            <div key={idx} className={styles.faqItem}>
              <h3>{faq.q}</h3>
              <p>{faq.a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
