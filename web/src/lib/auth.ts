import NextAuth from "next-auth";
import { Prisma } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import { db } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return false;
      if (!user.email) return false;

      // Check if this is the initial super admin
      const initialAdminEmail = process.env.INITIAL_SUPER_ADMIN_EMAIL;
      if (initialAdminEmail && user.email === initialAdminEmail) {
        await db.user.upsert({
          where: { email: user.email },
          update: { isSuperAdmin: true },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
            isSuperAdmin: true,
          },
        });
      }

      return true;
    },
    async jwt({ token, trigger }: { token: import("next-auth/jwt").JWT; user?: import("next-auth").User; trigger?: string }) {
      if (trigger === "signIn" || trigger === "signUp") {
        const dbUser = await db.user.findUnique({
          where: { email: token.email! },
          select: {
            id: true,
            isSuperAdmin: true,
            isActive: true,
            hasCompletedOnboarding: true,
          },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.isSuperAdmin = dbUser.isSuperAdmin;
          token.isActive = dbUser.isActive;
          token.hasCompletedOnboarding = dbUser.hasCompletedOnboarding;
        }
      }
      if (trigger === "update") {
        // Refresh user data on explicit update
        const dbUser = await db.user.findUnique({
          where: { email: token.email! },
          select: {
            id: true,
            isSuperAdmin: true,
            isActive: true,
            hasCompletedOnboarding: true,
          },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.isSuperAdmin = dbUser.isSuperAdmin;
          token.isActive = dbUser.isActive;
          token.hasCompletedOnboarding = dbUser.hasCompletedOnboarding;
        }
      }
      return token;
    },
    async session({ session, token }: { session: import("next-auth").Session; token: import("next-auth/jwt").JWT }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.isSuperAdmin = (token.isSuperAdmin as boolean) ?? false;
        session.user.isActive = (token.isActive as boolean) ?? true;
        session.user.hasCompletedOnboarding = (token.hasCompletedOnboarding as boolean) ?? false;
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      const token = "token" in message ? message.token : null;
      if (token?.sub) {
        await db.auditLog.create({
          data: {
            userId: token.sub,
            action: "LOGOUT",
            resource: "session",
            details: Prisma.DbNull,
          },
        });
      }
    },
  },
});
