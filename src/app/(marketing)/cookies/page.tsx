import type { Metadata } from "next";

export const metadata: Metadata = {
    title: { absolute: "Cookie Policy | RankyPulse" },
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
                        <h2 className="text-xl font-semibold text-white mb-2">Contact</h2>
                        <p>
                            Questions? Email us at{" "}
                            <a href="mailto:privacy@rankypulse.com" className="text-orange-400 underline">
                                privacy@rankypulse.com
                            </a>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
