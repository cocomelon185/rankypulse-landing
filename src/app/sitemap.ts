import type { MetadataRoute } from "next";
import { getAllAuditLandings } from "@/lib/pseo/auditPages";

const BASE = "https://rankypulse.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const auditPages = getAllAuditLandings();
  const auditRoutes = auditPages.map((p) => ({
    url: `${BASE}/audit/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const baseRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/audit`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/auth/signin`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  return [...baseRoutes, ...auditRoutes];
}
