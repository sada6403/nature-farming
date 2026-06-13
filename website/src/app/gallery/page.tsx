import type { Metadata } from "next";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery | Our Farms & Products",
  description:
    "Explore Nature Farming's photo gallery — our lush Aloe Vera farms in Kurunegala, natural product range, and Sri Lankan farming community in action.",
  keywords: [
    "Aloe Vera farm photos Sri Lanka",
    "Nature Farming gallery",
    "Aloe Vera plantation Sri Lanka",
    "organic farm images",
  ],
  openGraph: {
    title: "Gallery | Nature Farming Sri Lanka",
    description: "See our Aloe Vera farms, natural products, and farming community across Sri Lanka.",
    url: "https://naturefarming.lk/gallery",
  },
  alternates: { canonical: "https://naturefarming.lk/gallery" },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
