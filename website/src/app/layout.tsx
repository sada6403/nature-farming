import type { Metadata, Viewport } from "next";
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

const SITE_URL = "https://naturefarming.lk";
const SITE_NAME = "Nature Farming";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nature Farming | Sri Lanka's #1 Aloe Vera Cultivation & Natural Products",
    template: "%s | Nature Farming Sri Lanka",
  },
  description:
    "Nature Farming is Sri Lanka's leading Aloe Vera cultivation company. Premium natural soaps, wellness products, and a thriving farmer network across Kurunegala. Join 5,000+ farmers today.",
  keywords: [
    "Nature Farming",
    "Nature Farming Sri Lanka",
    "naturefarming.lk",
    "Aloe Vera Sri Lanka",
    "Aloe Vera cultivation Sri Lanka",
    "natural products Sri Lanka",
    "organic farming Sri Lanka",
    "Aloe Vera soap Sri Lanka",
    "farmer network Sri Lanka",
    "Kurunegala farming",
    "Sri Lanka agriculture",
    "natural wellness products",
    "aloe vera leaves Sri Lanka",
    "organic aloe vera",
    "NF Plantation Sri Lanka",
  ],
  authors: [{ name: "Nature Farming", url: SITE_URL }],
  creator: "Nature Farming",
  publisher: "Nature Farming",
  category: "Agriculture & Natural Products",
  classification: "Business",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Nature Farming | Pure Nature. Trusted Roots.",
    description:
      "Sri Lanka's leading Aloe Vera cultivation company. Premium natural products, empowering 5,000+ farmers across the island.",
    images: [
      {
        url: "/aloe_farm_hero_1776647052615.png",
        width: 1200,
        height: 630,
        alt: "Nature Farming - Sri Lanka's Premium Aloe Vera Company",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nature Farming Sri Lanka | Aloe Vera & Natural Products",
    description:
      "Empowering Sri Lankan farmers through premium Aloe Vera cultivation. 5,000+ farmers, 10,000+ happy customers.",
    images: ["/aloe_farm_hero_1776647052615.png"],
    creator: "@naturefarming",
  },
  icons: {
    icon: [
      { url: '/nature-farming-official-v2.png', type: 'image/png', sizes: 'any' },
    ],
    shortcut: '/nature-farming-official-v2.png',
    apple: { url: '/nature-farming-official-v2.png', type: 'image/png' },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2D5016",
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "Nature Farming",
  url: SITE_URL,
  description: "Sri Lanka's #1 Aloe Vera Cultivation & Natural Products company",
  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/?s={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Nature Farming",
  alternateName: ["Nature Farming Sri Lanka", "NF Plantation", "naturefarming.lk"],
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/nature-farming-official-v2.png`,
    width: 512,
    height: 512,
  },
  image: `${SITE_URL}/nature-farming-official-v2.png`,
  description: "Sri Lanka's leading Aloe Vera cultivation and natural wellness products company, empowering farmers since 2018.",
  foundingDate: "2018",
  areaServed: "Sri Lanka",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kurunegala",
    addressCountry: "LK",
  },
  sameAs: [SITE_URL],
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": SITE_URL,
  name: "Nature Farming",
  description:
    "Sri Lanka's leading Aloe Vera cultivation and natural wellness products company, empowering farmers across the island.",
  url: SITE_URL,
  telephone: "+94700000000",
  email: "info@naturefarming.lk",
  foundingDate: "2018",
  areaServed: "Sri Lanka",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kurunegala",
    addressCountry: "LK",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 7.4863,
    longitude: 80.3647,
  },
  sameAs: [SITE_URL],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Natural Products",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "Aloe Vera Natural Soap",
          description: "100% natural Aloe Vera soap crafted from Sri Lankan grown plants",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "Raw Aloe Vera Leaves",
          description: "Fresh Aloe Vera leaves from certified Sri Lankan farms",
        },
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body suppressHydrationWarning className={`${jakarta.variable} ${playfair.variable} ${cormorant.variable} font-sans antialiased bg-warm`}>
        <div className="grain-overlay" />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
