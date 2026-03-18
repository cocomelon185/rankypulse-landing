import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import {
  findUserByEmail,
  findUserByEmailOrUsername,
  verifyPassword,
  createOrUpdateGoogleUser,
  findUserByGoogleId,
} from "./db-users";
import { supabaseAdmin } from "./supabase";

/** True when Google OAuth env vars are set; used to conditionally enable provider and UI */
export const isGoogleAuthConfigured =
  !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

async function getRoleForUserId(userId: string): Promise<string> {
  const { data } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return (data as { role?: string } | null)?.role ?? "user";
}

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    userId?: string;
    role?: string;
    gscAccessToken?: string;
    gscRefreshToken?: string;
    gscTokenExpiry?: number;
  }
}

const isProd = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email or Username",
      credentials: {
        identifier: {
          label: "Email or Username",
          type: "text",
          placeholder: "you@example.com or username",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const user = await findUserByEmailOrUsername(credentials.identifier);
        if (!user || !user.password_hash) return null;
        const valid = await verifyPassword(credentials.password, user.password_hash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    CredentialsProvider({
      id: "magic-link",
      name: "Magic Link",
      credentials: {
        token: { label: "Token", type: "text" },
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (!credentials?.token || !credentials?.email) return null;

        const { data: tokenRow, error } = await supabaseAdmin
          .from("auth_tokens")
          .select("id, email, type, expires_at, used_at")
          .eq("token", credentials.token)
          .eq("type", "magic_link")
          .maybeSingle();

        if (error || !tokenRow) return null;
        if (tokenRow.used_at) return null;
        if (new Date(tokenRow.expires_at) < new Date()) return null;

        // Verify the email in the URL matches the token's email
        const tokenEmail = (tokenRow.email as string).trim().toLowerCase();
        const providedEmail = credentials.email.trim().toLowerCase();
        if (tokenEmail !== providedEmail) return null;

        // Mark token as used (one-time use)
        await supabaseAdmin
          .from("auth_tokens")
          .update({ used_at: new Date().toISOString() })
          .eq("id", tokenRow.id);

        // Find existing user or create one for new email sign-ups
        let user = await findUserByEmail(tokenEmail);
        if (!user) {
          const base = tokenEmail.split("@")[0].replace(/[^a-z0-9]/gi, "") || "user";
          const username = base + "_" + crypto.randomUUID().slice(0, 6);
          const { data, error: createError } = await supabaseAdmin
            .from("users")
            .insert({
              email: tokenEmail,
              username,
              password_hash: null,
              name: null,
              image: null,
              role: "user",
            })
            .select()
            .single();
          if (createError || !data) return null;
          user = data as import("./db-users").DbUser;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    // Google OAuth — only registered when env vars are configured
    ...(isGoogleAuthConfigured
      ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          authorization: {
            params: {
              // Only request basic scopes at sign-in — no GSC scope here.
              // GSC (webmasters.readonly) should be requested separately when
              // the user explicitly connects Search Console in settings.
              // Requesting it here forces a scary "4 services" consent screen
              // on every login and is the root cause of the double-prompt UX.
              scope: "openid email profile",
              access_type: "offline",   // gets refresh_token on first sign-in
              // Remove prompt: "consent" — that forced the full consent screen
              // on EVERY login. Without it, returning users get a single quick
              // "signing back in" confirmation instead of two screens.
              prompt: "select_account", // only ask which account to use
            },
          },
        }),
      ]
      : []),
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
    async jwt({ token, user, account }) {
      if (user && (account?.provider === "credentials" || account?.provider === "magic-link") && user.id) {
        token.userId = user.id;
        token.role = await getRoleForUserId(user.id);
      }

      if ((account?.provider === "google" || (!token.userId && token.sub)) && token.sub) {
        const dbUser = await findUserByGoogleId(token.sub);
        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
        }
      }

      // Persist GSC tokens from the initial Google sign-in
      if (account?.provider === "google") {
        if (account.access_token) token.gscAccessToken = account.access_token;
        if (account.refresh_token) token.gscRefreshToken = account.refresh_token;
        if (account.expires_at) token.gscTokenExpiry = account.expires_at * 1000;
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.userId) {
        session.user.id = token.userId;
        session.user.role = token.role ?? "user";
      }

      // Hardcode admin for developer
      if (session.user?.email === "cocomelon185@gmail.com") {
        session.user.role = "admin";
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Vercel deployment URLs or custom domains.
      // We prioritize baseUrl (which trustHost gets from the request) over NEXTAUTH_URL 
      // because NEXTAUTH_URL might be statically set to production in Vercel envs.
      const siteUrl = baseUrl ?? process.env.NEXTAUTH_URL ?? "https://rankypulse.com";
      const base = siteUrl.replace(/\/$/, "");

      if (url.startsWith("/")) {
        return `${base}${url}`;
      }
      try {
        const parsed = new URL(url);
        const siteOrigin = new URL(siteUrl).origin;
        if (parsed.origin === siteOrigin) return url;
      } catch {
        // ignore
      }
      return `${base}/dashboard`;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await createOrUpdateGoogleUser({
          googleId: account.providerAccountId,
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
        });
      }
      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
