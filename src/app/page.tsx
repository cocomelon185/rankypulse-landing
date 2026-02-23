import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
  };
}

export { default } from "./(marketing)/page";
