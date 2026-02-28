import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Force NextAuth to use the Vercel deployment URL dynamically, 
// preventing CSRF errors when testing on preview domains.
const v_url = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
if (v_url && !v_url.includes("rankypulse.com")) {
    process.env.NEXTAUTH_URL = `https://${v_url}`;
    process.env.NEXT_PUBLIC_APP_URL = `https://${v_url}`;
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
