import type { Metadata } from "next";
import FarmerJoinClient from "./FarmerJoinClient";

export const metadata: Metadata = {
  title: "Join as a Farmer | Aloe Vera Cultivation Partnership",
  description:
    "Join Nature Farming's farmer network and start earning from Aloe Vera cultivation. We provide plants, training, and guaranteed buyback. 5,000+ farmers already earning across Sri Lanka.",
  keywords: [
    "join Aloe Vera farming Sri Lanka",
    "farmer network Sri Lanka",
    "Aloe Vera farming income",
    "guaranteed buyback farming",
    "agriculture partnership Sri Lanka",
    "Aloe Vera business Sri Lanka",
    "earn from farming Sri Lanka",
  ],
  openGraph: {
    title: "Become an Aloe Vera Farmer | Nature Farming Sri Lanka",
    description:
      "Start your Aloe Vera farming journey with Nature Farming. We provide support, training, and guaranteed purchase of your harvest. Join 5,000+ successful farmers.",
    url: "https://naturefarming.lk/farmer-join",
  },
  alternates: { canonical: "https://naturefarming.lk/farmer-join" },
};

export default function FarmerJoinPage() {
  return <FarmerJoinClient />;
}
