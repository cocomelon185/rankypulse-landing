import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

// Wrapper to dynamically set NEXTAUTH_URL for Vercel preview/alias domains
// otherwise CSRF tokens will fail when testing.
const wrapper = (req: NextRequest, ctx: any) => {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    if (host && !host.includes("rankypulse.com") && host.includes("vercel.app")) {
        process.env.NEXTAUTH_URL = `https://${host}`;
        process.env.NEXT_PUBLIC_APP_URL = `https://${host}`;
    }
    return NextAuth(authOptions)(req, ctx);
};

export { wrapper as GET, wrapper as POST };
