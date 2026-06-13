import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Nature Farming's mission to revolutionize Aloe Vera cultivation in Sri Lanka. Founded in 2018 in Kurunegala, we empower 5,000+ farmers with fair pricing and sustainable practices.",
  keywords: [
    "about Nature Farming",
    "Sri Lanka Aloe Vera company",
    "Kurunegala agriculture",
    "organic farming mission Sri Lanka",
    "farmer empowerment Sri Lanka",
  ],
  openGraph: {
    title: "About Nature Farming | Our Story & Mission",
    description:
      "Discover how Nature Farming has revolutionized Aloe Vera cultivation in Sri Lanka since 2018, empowering farmers and delivering pure natural products.",
    url: "https://naturefarming.lk/about",
  },
  alternates: { canonical: "https://naturefarming.lk/about" },
};

export default function AboutPage() {
  return <AboutClient />;
}
