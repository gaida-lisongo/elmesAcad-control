import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Admin, Client } from "@/utils/models";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();

        // ── Try Admin ─────────────────────────────────────────────────────────
        const admin = await Admin.findOne({ email: credentials.email }).lean();
        if (admin) {
          const valid = await bcrypt.compare(
            credentials.password,
            admin.motDePasse,
          );
          if (!valid) return null;
          return {
            id: (admin._id as { toString(): string }).toString(),
            email: admin.email,
            name: admin.nomComplet,
            role: "admin" as const,
          };
        }

        // ── Try Client ────────────────────────────────────────────────────────
        const client = await Client.findOne({
          email: credentials.email,
        }).lean();
        if (!client) return null;
        if (!client.isActive) return null; // inactive tenants cannot sign in

        const valid = await bcrypt.compare(
          credentials.password,
          client.motDePasse,
        );
        if (!valid) return null;

        return {
          id: (client._id as { toString(): string }).toString(),
          email: client.email,
          name: client.nomComplet,
          role: "client" as const,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in `user` is populated; on subsequent requests only token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
