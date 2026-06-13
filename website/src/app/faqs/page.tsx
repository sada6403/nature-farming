import type { Metadata } from "next";
import FaqsClient from "./FaqsClient";

const faqs = [
  {
    q: "How can I join as a farmer?",
    a: "You can click on the 'Join as a Farmer' button in the navbar or footer, fill out the form, and our team will contact you for a field visit.",
  },
  {
    q: "Are your products 100% natural?",
    a: "Yes, all our products are handcrafted using pure organic Aloe Vera harvested from our own Sri Lankan farms without any harmful chemicals.",
  },
  {
    q: "Where are your branches located?",
    a: "We currently operate across multiple districts in Sri Lanka. You can find the full list of branch locations on our Branches page.",
  },
  {
    q: "Do you offer bulk delivery for industrial use?",
    a: "Yes, we provide bulk raw aloe leaves and gel for industrial purposes. Please contact us through the contact form for bulk pricing.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export const metadata: Metadata = {
  title: "FAQs | Common Questions About Nature Farming",
  description:
    "Find answers to frequently asked questions about Nature Farming — our Aloe Vera products, farmer registration process, payment system, and branch locations in Sri Lanka.",
  keywords: [
    "Nature Farming FAQ",
    "Aloe Vera farming questions Sri Lanka",
    "how to join farmer network",
    "Aloe Vera product FAQ",
  ],
  openGraph: {
    title: "FAQs | Nature Farming Sri Lanka",
    description: "Answers to your questions about Nature Farming products and farmer partnerships.",
    url: "https://naturefarming.lk/faqs",
  },
  alternates: { canonical: "https://naturefarming.lk/faqs" },
};

export default function FaqsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqsClient />
    </>
  );
}
