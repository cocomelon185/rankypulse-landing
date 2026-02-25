import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { Fraunces, DM_Sans, DM_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";
import { AnalyticsClient } from "@/components/AnalyticsClient";

// Self-hosted, preloaded fonts — eliminates external CDN request and layout shift
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-dm-sans",
  preload: true,
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-dm-mono",
  preload: false, // secondary font — don't block LCP
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-inter-tight",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rankypulse.com"),
  title: "RankyPulse — SEO Audit & Fix Tool",
  description:
    "Get a complete SEO audit with step-by-step fix guides. See exactly how many visits you could be gaining — fix in minutes, not months.",
  openGraph: {
    title: "RankyPulse SEO Audit",
    description:
      "Fix your SEO in minutes. Step-by-step guides with traffic impact estimates.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "RankyPulse — SEO Audit & Fix Tool" }],
    siteName: "RankyPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RankyPulse SEO Audit",
    description:
      "Fix your SEO in minutes. Step-by-step guides with traffic impact estimates.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} ${dmMono.variable} ${interTight.variable}`}
    >
      <head>
        {GA_ID ? (
          <>
            <Script
              src={"https://www.googletagmanager.com/gtag/js?id=" + GA_ID}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: false });
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body>
        {children}
        <Toaster position="bottom-center" richColors closeButton />
        <Suspense fallback={null}>
          <AnalyticsClient />
        </Suspense>
      </body>
    </html>
  );
}
