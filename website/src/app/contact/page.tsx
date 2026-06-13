import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | Get in Touch with Nature Farming",
  description:
    "Contact Nature Farming for product enquiries, farmer registration, or branch information. Reach us via phone, email, or WhatsApp. Based in Kurunegala, Sri Lanka.",
  keywords: [
    "contact Nature Farming",
    "Nature Farming phone number",
    "Aloe Vera company contact Sri Lanka",
    "Nature Farming Kurunegala",
    "farmer inquiry Sri Lanka",
  ],
  openGraph: {
    title: "Contact Nature Farming | Sri Lanka",
    description:
      "Get in touch with Nature Farming for products, farmer partnerships, or branch enquiries. We're here to help.",
    url: "https://naturefarming.lk/contact",
  },
  alternates: { canonical: "https://naturefarming.lk/contact" },
};

export default function ContactPage() {
  return <ContactClient />;
}
