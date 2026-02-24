"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/horizon";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { track } from "@/lib/analytics";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE_LENGTH = 10;

type SubmitState = "idle" | "sending" | "success" | "error";

export default function ContactClientPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const validate = (): boolean => {
    if (!email.trim()) {
      setErrorMsg("Email is required.");
      return false;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return false;
    }
    if (!message.trim()) {
      setErrorMsg("Message is required.");
      return false;
    }
    if (message.trim().length < MIN_MESSAGE_LENGTH) {
      setErrorMsg("Message must be at least 10 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!validate()) return;
    setState("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim(),
          subject: subject.trim() || undefined,
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setState("error");
        setErrorMsg(data?.error || "Something went wrong—email us at support@rankypulse.com");
        return;
      }

      setState("success");
      track("contact_submit", {
        has_subject: !!subject.trim(),
        message_length: message.trim().length,
      });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setState("error");
      setErrorMsg("Something went wrong—email us at support@rankypulse.com");
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <PageLayout>
        <PageHeader
          icon={<Mail className="h-7 w-7" />}
          title="Contact"
          subtitle="Have a question or feedback? Send a message — we usually reply within 1 business day."
        />

        <div className="mx-auto max-w-xl">
          <Card extra="p-6 md:p-8 overflow-hidden" default={true}>
            {state === "success" ? (
              <div className="rounded-xl border-l-4 border-[#4318ff] bg-[#eff6ff] p-4">
                <p className="font-semibold text-[#4318ff]">Message sent</p>
                <p className="mt-1 text-sm text-gray-600">
                  We&apos;ll get back to you soon.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setState("idle")}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Name (optional)
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="h-11 w-full rounded-xl border-2 border-gray-200 px-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-[#4318ff] focus:outline-none focus:ring-4 focus:ring-[#4318ff]/20"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-11 w-full rounded-xl border-2 border-gray-200 px-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-[#4318ff] focus:outline-none focus:ring-4 focus:ring-[#4318ff]/20"
                  />
                </div>
                <div>
                  <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Subject (optional)
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief subject"
                    className="h-11 w-full rounded-xl border-2 border-gray-200 px-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-[#4318ff] focus:outline-none focus:ring-4 focus:ring-[#4318ff]/20"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Your message..."
                    required
                    rows={5}
                    minLength={MIN_MESSAGE_LENGTH}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-[#4318ff] focus:outline-none focus:ring-4 focus:ring-[#4318ff]/20"
                  />
                  {message.length > 0 && message.length < MIN_MESSAGE_LENGTH && (
                    <p className="mt-1 text-xs text-amber-600">
                      At least {MIN_MESSAGE_LENGTH} characters required.
                    </p>
                  )}
                </div>
                {errorMsg && (
                  <div className="rounded-xl border-l-4 border-red-400 bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-700">{errorMsg}</p>
                  </div>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={state === "sending"}
                >
                  {state === "sending" ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send message"
                  )}
                </Button>
              </form>
            )}
          </Card>

          <p className="mt-6 text-center text-sm text-gray-600">
            Prefer email?{" "}
            <a
              href="mailto:support@rankypulse.com"
              className="font-medium text-[#4318ff] transition-colors hover:underline"
            >
              support@rankypulse.com
            </a>
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/"
              className="text-sm text-gray-500 transition-colors hover:text-[#4318ff]"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </PageLayout>
      <Footer />
    </div>
  );
}
