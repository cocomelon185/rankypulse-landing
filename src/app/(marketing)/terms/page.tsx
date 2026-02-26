import type { Metadata } from "next";
import Link from "next/link";
import { AppNavbar } from "@/components/layout/Navbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for RankyPulse — the SEO audit platform. Please read these terms carefully before using our services.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div style={{ background: "#0d0f14", minHeight: "100vh" }}>
      <AppNavbar />
      <div className="pt-16">
        <main className="mx-auto max-w-3xl px-6 py-16">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 font-['DM_Sans'] text-sm text-gray-500 transition-colors hover:text-white"
          >
            <Zap size={16} className="text-indigo-400" />
            RankyPulse
          </Link>
          <h1 className="font-['Fraunces'] text-3xl font-bold text-white md:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-4 font-['DM_Sans'] text-sm text-gray-500">
            Last updated: February 2026
          </p>

          <div className="mt-12 space-y-10 font-['DM_Sans'] text-gray-300">
            <section>
              <h2 className="mb-3 font-semibold text-white">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing or using RankyPulse ("Service"), you agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do not use the
                Service. We reserve the right to modify these terms at any time; continued
                use of the Service after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-white">2. Description of Service</h2>
              <p className="leading-relaxed">
                RankyPulse provides SEO audit and analysis tools, including website crawls,
                issue detection, fix recommendations, and performance reports. The Service
                is offered in free and paid tiers, each with different usage limits as
                specified on our pricing page.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-white">3. Account and Registration</h2>
              <p className="leading-relaxed">
                You may create an account using email or Google sign-in. You are
                responsible for maintaining the confidentiality of your account
                credentials and for all activities under your account. You must provide
                accurate information and notify us of any unauthorized use.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-white">4. Acceptable Use</h2>
              <p className="leading-relaxed">
                You agree not to use the Service to: crawl or audit sites without
                permission where required; overload our systems; circumvent usage limits;
                scrape or harvest data beyond intended use; violate any applicable laws; or
                use the Service for any illegal or harmful purpose.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-white">5. Payment and Subscriptions</h2>
              <p className="leading-relaxed">
                Paid plans are billed monthly. Payments are processed via Stripe (USD) or
                Razorpay (INR). By subscribing, you authorize us to charge your payment
                method. Refunds are handled per our refund policy. You may cancel at any
                time; access continues until the end of the billing period.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-white">6. Intellectual Property</h2>
              <p className="leading-relaxed">
                RankyPulse and its content, branding, and technology are owned by us or our
                licensors. You may not copy, modify, or distribute our materials without
                permission. Audit results and reports generated for you remain your data,
                subject to our right to use anonymized aggregate data to improve the
                Service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-white">7. Disclaimer of Warranties</h2>
              <p className="leading-relaxed">
                The Service is provided "as is" without warranties of any kind. We do not
                guarantee accuracy of audit results, SEO advice, or uptime. Use the Service
                at your own risk.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-white">8. Limitation of Liability</h2>
              <p className="leading-relaxed">
                To the maximum extent permitted by law, RankyPulse shall not be liable for
                any indirect, incidental, special, consequential, or punitive damages, or
                any loss of profits, data, or business opportunities, arising from your
                use of the Service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-white">9. Contact</h2>
              <p className="leading-relaxed">
                For questions about these Terms, contact us at{" "}
                <a
                  href="mailto:support@rankypulse.com"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  support@rankypulse.com
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-16 flex gap-4">
            <Link
              href="/"
              className="rounded-xl border border-white/10 px-6 py-3 font-['DM_Sans'] text-sm font-medium text-gray-400 transition-colors hover:border-white/20 hover:text-white"
            >
              Back to home
            </Link>
            <Link
              href="/privacy"
              className="rounded-xl bg-indigo-500 px-6 py-3 font-['DM_Sans'] text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
            >
              Privacy Policy
            </Link>
          </div>
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
