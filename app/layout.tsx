import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Inter, Space_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PrintYourVibe — Custom Print on Demand",
    template: "%s | PrintYourVibe",
  },
  description:
    "Upload your artwork and see it live on premium garments. UK-printed custom t-shirts, hoodies, sweatshirts and tote bags delivered to your door.",
  keywords: ["custom print", "print on demand", "t-shirt printing", "custom hoodies", "UK printing", "custom apparel"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://printyourvibe.co.uk"),
  openGraph: {
    siteName: "PrintYourVibe",
    type: "website",
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${inter.variable} ${spaceMono.variable}`}
    >
      <body className="bg-dark text-cream font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
