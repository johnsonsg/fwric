import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession as nextGetServerSession } from "next-auth/next";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET ?? (process.env.NODE_ENV === 'development' ? 'dev-secret-change-me' : undefined),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const email = parsed.data.email.trim().toLowerCase();
        const configuredEmail = (process.env.ADMIN_EMAIL ?? (process.env.NODE_ENV === 'development' ? 'admin@example.com' : '')).trim().toLowerCase();
        const configuredPassword = process.env.ADMIN_PASSWORD ?? (process.env.NODE_ENV === 'development' ? 'change-me-123' : '');
        if (!configuredEmail || !configuredPassword) return null;

        if (email === configuredEmail && parsed.data.password === configuredPassword) {
          return {
            id: "admin-1",
            email,
            name: "Site Admin",
            role: "admin",
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? "admin";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = typeof token.role === "string" ? token.role : "admin";
      }

      return session;
    },
  },
};

export const auth = () => nextGetServerSession(authOptions);
export default NextAuth(authOptions);
