import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { Inter, DM_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";
import { AnalyticsClient } from "@/components/AnalyticsClient";

// Inter — industry standard for professional SaaS dashboards (SEMrush, Linear, Vercel, Ahrefs)
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-dm-mono",
  preload: false, // secondary font — don't block LCP
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rankypulse.com"),
  title: {
    default: "RankyPulse — SEO Audit & Fix Tool",
    template: "%s | RankyPulse",
  },
  description:
    "Get a complete SEO audit with step-by-step fix guides. See exactly how many visits you could be gaining — fix in minutes, not months.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
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
      className={`${inter.variable} ${dmMono.variable}`}
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
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://rankypulse.com/#website",
                  "url": "https://rankypulse.com/",
                  "name": "RankyPulse",
                  "description": "Get a complete SEO audit with step-by-step fix guides.",
                  "potentialAction": [
                    {
                      "@type": "SearchAction",
                      "target": "https://rankypulse.com/audit/results?url={search_term_string}",
                      "query-input": "required name=search_term_string"
                    }
                  ]
                },
                {
                  "@type": "Organization",
                  "@id": "https://rankypulse.com/#organization",
                  "name": "RankyPulse",
                  "url": "https://rankypulse.com/",
                  "logo": {
                    "@type": "ImageObject",
                    "inLanguage": "en-US",
                    "@id": "https://rankypulse.com/#/schema/logo/image/",
                    "url": "https://rankypulse.com/favicon.svg",
                    "contentUrl": "https://rankypulse.com/favicon.svg",
                    "width": 512,
                    "height": 512,
                    "caption": "RankyPulse"
                  },
                  "image": {
                    "@id": "https://rankypulse.com/#/schema/logo/image/"
                  }
                }
              ]
            }),
          }}
        ></script>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {children}
            <Toaster position="bottom-center" richColors closeButton />
            <Suspense fallback={null}>
              <AnalyticsClient />
            </Suspense>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
