import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rankypulse.com"),
  title: "RankyPulse | Instant SEO Audit & Fix List",
  description:
    "Run a free SEO audit in ~30 seconds. Get prioritized issues, clear fixes, and a score you can track over time.",
  openGraph: {
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "RankyPulse — Instant SEO Audit" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
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
                gtag('config', '${GA_ID}', { send_page_view: true });
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
