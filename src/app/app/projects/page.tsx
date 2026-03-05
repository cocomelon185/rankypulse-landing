import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ProjectsClient } from "@/components/app-pages/ProjectsClient";

export const metadata: Metadata = {
    title: "Projects — RankyPulse",
    description: "Manage your SEO projects and websites.",
    robots: { index: false, follow: false },
};

export default async function ProjectsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/projects");
    return <ProjectsClient />;
}
