import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

// Augment NextAuth types so session.user.id is typed
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
  }
}

const isProd = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  useSecureCookies: isProd,
  cookies: {
    sessionToken: {
      name: isProd
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: isProd,
      },
    },
  },
  callbacks: {
    async jwt({ token }) {
      // token.sub is the Google user ID — pass it through
      return token;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const siteUrl = process.env.NEXTAUTH_URL ?? baseUrl ?? "https://rankypulse.com";
      if (url.startsWith("/")) {
        const base = siteUrl.replace(/\/$/, "");
        return `${base}${url}`;
      }
      try {
        const parsed = new URL(url);
        const siteOrigin = new URL(siteUrl).origin;
        if (parsed.origin === siteOrigin) return url;
      } catch {
        // ignore
      }
      return siteUrl;
    },
    async signIn() {
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
