import type { Metadata } from "next";
import ProductsClient from "./ProductsClient";

export const metadata: Metadata = {
  title: "Natural Products",
  description:
    "Shop Nature Farming's premium Aloe Vera products — 100% natural soaps, wellness items, and raw Aloe Vera leaves. Crafted in Sri Lanka from the finest organic harvest.",
  keywords: [
    "Aloe Vera soap Sri Lanka",
    "natural products buy Sri Lanka",
    "organic Aloe Vera products",
    "Aloe Vera leaves price Sri Lanka",
    "natural soap Sri Lanka",
    "wellness products Sri Lanka",
    "buy Aloe Vera Sri Lanka",
  ],
  openGraph: {
    title: "Natural Products | Nature Farming Sri Lanka",
    description:
      "Explore our range of 100% natural Aloe Vera products — soaps, wellness items, and raw leaves. Pure Sri Lankan quality.",
    url: "https://naturefarming.lk/products",
  },
  alternates: { canonical: "https://naturefarming.lk/products" },
};

export default function ProductsPage() {
  return <ProductsClient />;
}
