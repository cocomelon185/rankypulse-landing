import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ContentClient } from "@/components/app-pages/ContentClient";
export const metadata = { title: "Content Ideas — RankyPulse", robots: { index: false } };
export default async function ContentPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/content");
    return <ContentClient />;
}
