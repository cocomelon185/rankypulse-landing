import type { Metadata } from "next";
import Link from "next/link";
import { AppNavbar } from "@/components/layout/Navbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Zap } from "lucide-react";

export const metadata: Metadata = {
  title: { absolute: "RankyPulse Privacy Policy — Your Data & Rights" },
  description:
    "Privacy Policy for RankyPulse — how we collect, use, and protect your data when you use our SEO audit platform.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 font-['DM_Sans'] text-sm text-gray-500">
            Last updated: February 2026
          </p>

          <div className="mt-12 space-y-10 font-['DM_Sans'] text-gray-300">
            <section>
              <h2 className="mb-3 font-semibold text-white">1. Introduction</h2>
              <p className="leading-relaxed">
                RankyPulse ("we," "us," or "our") is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard
                your information when you use our SEO audit platform and related
                services.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-white">2. Information We Collect</h2>
              <p className="mb-3 leading-relaxed">
                We collect information you provide directly, such as:
              </p>
              <ul className="list-inside list-disc space-y-2 text-gray-400">
                <li>Account information: email, username, display name, profile photo (when you sign in with Google or create an email account)</li>
                <li>Domains or URLs you submit for audits</li>
                <li>Payment information (processed by Stripe or Razorpay — we do not store full card details)</li>
                <li>Communications with our support team</li>
              </ul>
              <p className="mt-3 leading-relaxed">
                We also automatically collect: usage data (audits run, features used),
                device and browser information, IP address, and cookies or similar
                technologies for session management and analytics.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-white">3. How We Use Your Information</h2>
              <p className="leading-relaxed">
                We use your information to: provide and improve the Service; process
                payments; send transactional and product-related emails; analyze usage
                and fix issues; enforce our terms; comply with legal obligations; and
                communicate with you about updates or offers (with your consent where
                required).
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-white">4. Payment Processing</h2>
              <p className="leading-relaxed">
                For payments, we use third-party processors:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-2 text-gray-400">
                <li><strong className="text-gray-300">Stripe</strong> — for USD payments. Stripe&apos;s privacy policy applies to payment data they process: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">stripe.com/privacy</a></li>
                <li><strong className="text-gray-300">Razorpay</strong> — for INR payments. Razorpay&apos;s privacy practices are described at: <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">razorpay.com/privacy</a></li>
              </ul>
              <p className="mt-3 leading-relaxed">
                We do not store your full payment card details. For international
                payments and support, you can refer to{" "}
                <a
                  href="https://razorpay.com/docs/payments/payments/international-payments"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Razorpay International Payments
                </a>{" "}
                or contact{" "}
                <a
                  href="https://razorpay.com/support/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Razorpay Support
                </a>{" "}
                for payment-related inquiries.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-white">5. Data Sharing and Disclosure</h2>
              <p className="leading-relaxed">
                We may share data with: service providers (hosting, analytics, email);
                payment processors (Stripe, Razorpay); and where required by law or to
                protect our rights. We do not sell your personal data.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-white">6. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your data for as long as your account is active or as needed to
                provide the Service. Audit results and logs may be retained for
                analytics and support. You may request deletion of your account and
                associated data.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-white">7. Security</h2>
              <p className="leading-relaxed">
                We use industry-standard measures to protect your data, including
                encryption in transit (HTTPS), secure authentication, and access
                controls. However, no method of transmission over the internet is 100%
                secure.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-white">8. Your Rights</h2>
              <p className="leading-relaxed">
                Depending on your location, you may have rights to access, correct,
                delete, or export your data, or object to processing. Contact us at{" "}
                <a
                  href="mailto:support@rankypulse.com"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  support@rankypulse.com
                </a>{" "}
                to exercise these rights.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-white">9. Cookies</h2>
              <p className="leading-relaxed">
                We use cookies and similar technologies for authentication, session
                management, and analytics. You can manage cookie preferences in your
                browser settings.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-white">10. Contact</h2>
              <p className="leading-relaxed">
                For privacy questions or requests, contact us at{" "}
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
              href="/terms"
              className="rounded-xl bg-indigo-500 px-6 py-3 font-['DM_Sans'] text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
            >
              Terms of Service
            </Link>
          </div>
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
