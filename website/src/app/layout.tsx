import { Plus_Jakarta_Sans, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata = {
  title: "Nature Farming | Pure Nature. Trusted Roots.",
  description: "Sri Lanka's leading Aloe Vera cultivation and premium natural products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body suppressHydrationWarning className={`${jakarta.variable} ${playfair.variable} ${cormorant.variable} font-sans antialiased bg-warm`}>
        <div className="grain-overlay" />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
