import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RankyPulse | Fix Your SEO in Minutes — Not Weeks",
  description:
    "RankyPulse audits your site, shows exactly what to fix, and predicts how your score improves. Copy-ready SEO fixes, AI competitor insights, discoverability score tracking.",
  openGraph: {
    title: "RankyPulse | Fix Your SEO in Minutes",
    description: "AI-powered SEO audits with actionable fixes and score tracking.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sora.variable} antialiased`}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
