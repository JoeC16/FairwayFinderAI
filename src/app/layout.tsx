import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import { CookieBanner } from "@/components/shared/cookie-banner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "FairwayFit AI — AI-Powered Golf Club Fitting",
    template: "%s | FairwayFit AI",
  },
  description:
    "Get a professional golf club fitting powered by AI. Personalised driver, iron, wedge and shaft recommendations based on your swing data, distances and playing style.",
  keywords: [
    "golf club fitting",
    "AI golf fitting",
    "virtual golf fitting",
    "driver fitting",
    "iron fitting",
    "golf shaft fitting",
    "golf equipment",
    "club fitting tool",
  ],
  authors: [{ name: "FairwayFit AI" }],
  creator: "FairwayFit AI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://fairwayfit.ai"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fairwayfit.ai",
    title: "FairwayFit AI — AI-Powered Golf Club Fitting",
    description: "Get fitted like a Tour player. Powered by AI.",
    siteName: "FairwayFit AI",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FairwayFit AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FairwayFit AI — AI-Powered Golf Club Fitting",
    description: "Get fitted like a Tour player. Powered by AI.",
    images: ["/og-image.png"],
  },
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
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#166534" },
    { media: "(prefers-color-scheme: dark)", color: "#052e16" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
