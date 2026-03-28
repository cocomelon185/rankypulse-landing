import type { Metadata } from "next";
import { SEOContentWrapper } from "@/components/landing/SEOContentWrapper";

export const metadata: Metadata = {
    title: { absolute: "Cookie Policy | How RankyPulse Uses Cookies" },
    description:
        "Learn how RankyPulse uses cookies. We keep it minimal: only essential session cookies and optional analytics.",
    alternates: { canonical: "https://rankypulse.com/cookies" },
};

export default function CookiesPage() {
    return (
        <div className="min-h-screen py-24 px-6" style={{ background: "#0d0f14" }}>
            <div className="mx-auto max-w-3xl">
                <h1 className="text-4xl font-bold text-white mb-4">Cookie Policy</h1>
                <p className="text-gray-400 mb-2">
                    <strong className="text-gray-300">Last updated:</strong> March 2026
                </p>

                <section className="mt-10 space-y-6 text-gray-300 leading-relaxed">
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-2">What cookies we use</h2>
                        <p>
                            RankyPulse uses a minimal set of cookies to keep you signed in and to
                            understand how visitors use the site so we can improve it.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-white mb-2">Essential cookies</h2>
                        <ul className="list-disc list-inside space-y-1 text-gray-400">
                            <li>
                                <strong className="text-gray-300">next-auth.session-token</strong> — keeps you
                                logged in during your session.
                            </li>
                            <li>
                                <strong className="text-gray-300">next-auth.csrf-token</strong> — prevents
                                cross-site request forgery on forms.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-white mb-2">Analytics cookies</h2>
                        <p>
                            We may set an anonymous analytics cookie (e.g. Clarity or Google Analytics)
                            to measure traffic and usage patterns. These cookies do not contain
                            personally identifiable information.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-white mb-2">Your choices</h2>
                        <p>
                            You can disable cookies in your browser settings at any time. Note that
                            disabling essential cookies will prevent you from signing in to RankyPulse.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-white mb-2">Third-party cookies</h2>
                        <p>
                            Some pages may load resources from third-party services such as Google Analytics
                            or Microsoft Clarity. These services may set their own cookies subject to their
                            respective privacy policies. We do not share your personal data with these
                            services beyond standard anonymous usage metrics.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-white mb-2">How long cookies last</h2>
                        <p>
                            Session cookies are deleted when you close your browser. Persistent cookies such
                            as authentication tokens expire after 30 days of inactivity or when you sign out
                            manually. Analytics cookies typically expire after 13 months in line with
                            industry standards set by the IAB and GDPR guidelines.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-white mb-2">Managing your preferences</h2>
                        <p>
                            Most browsers let you view, block, or delete cookies. In Chrome: Settings →
                            Privacy and Security → Cookies. In Firefox: Preferences → Privacy &amp; Security
                            → Cookies and Site Data. Blocking essential cookies will prevent sign-in from
                            working, but all public audit features will continue to function without an account.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-white mb-2">Contact</h2>
                        <p>
                            Questions? Email us at{" "}
                            <a href="mailto:privacy@rankypulse.com" className="text-orange-400 underline">
                                privacy@rankypulse.com
                            </a>
                        </p>
                    </div>
                </section>
                <SEOContentWrapper />
            </div>
        </div>
    );
}
