import type { Metadata } from "next";
import BranchesClient from "./BranchesClient";

export const metadata: Metadata = {
  title: "Our Branches | Find Your Nearest Nature Farming Centre",
  description:
    "Find Nature Farming branches near you across Sri Lanka. We have 12+ active branches providing farmer support, product sales, and local assistance island-wide.",
  keywords: [
    "Nature Farming branches Sri Lanka",
    "Aloe Vera company branches",
    "Nature Farming locations",
    "farming centre Sri Lanka",
    "agricultural support centres Sri Lanka",
  ],
  openGraph: {
    title: "Branches | Nature Farming Sri Lanka",
    description:
      "Find your nearest Nature Farming branch. 12+ locations across Sri Lanka providing local farmer support and product sales.",
    url: "https://naturefarming.lk/branches",
  },
  alternates: { canonical: "https://naturefarming.lk/branches" },
};

export default function BranchesPage() {
  return <BranchesClient />;
}
