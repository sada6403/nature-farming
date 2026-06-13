import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Nature Farming | Sri Lanka's #1 Aloe Vera Cultivation & Natural Products",
  description:
    "Nature Farming — Sri Lanka's leading Aloe Vera cultivation company since 2018. Premium natural soaps, wellness products, and 5,000+ empowered farmers across the island. Pure Nature. Trusted Roots.",
  keywords: [
    "Nature Farming Sri Lanka",
    "Aloe Vera Sri Lanka",
    "Aloe Vera cultivation Sri Lanka",
    "natural aloe vera products",
    "organic farming Sri Lanka",
    "farmer network Sri Lanka",
    "Kurunegala Aloe Vera",
    "aloe vera soap Sri Lanka buy",
    "nature farming lk",
    "naturefarming.lk",
    "Sri Lanka agriculture company",
    "aloe vera wellness products",
  ],
  openGraph: {
    title: "Nature Farming | Pure Nature. Trusted Roots.",
    description:
      "Sri Lanka's leading Aloe Vera cultivation company — premium natural products and 5,000+ empowered farmers island-wide.",
    url: "https://naturefarming.lk",
    images: [
      {
        url: "/aloe_farm_hero_1776647052615.png",
        width: 1200,
        height: 630,
        alt: "Nature Farming Sri Lanka - Aloe Vera Fields",
      },
    ],
  },
  alternates: { canonical: "https://naturefarming.lk" },
};

export default function HomePage() {
  return <HomeClient />;
}
