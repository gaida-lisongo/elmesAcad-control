import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Admin, Client } from "@/utils/models";
import crypto from "crypto";

// Fonction pour vérifier les deux types de hash
async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  try {
    // Essayer d'abord bcrypt
    const isBcrypt = await bcrypt.compare(plainPassword, hashedPassword);
    if (isBcrypt) return true;
  } catch {
    // Si bcrypt échoue, c'est peut-être un SHA256
  }

  // Essayer SHA256 (ancien format)
  const sha256Hash = crypto
    .createHash("sha256")
    .update(plainPassword)
    .digest("hex");
  return sha256Hash === hashedPassword;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        accountType: { label: "Account Type", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();

        const accountType = (credentials?.accountType as string) || "client";

        // ── Admin Workflow ─────────────────────────────────────────────────────
        if (accountType === "admin") {
          const admin = await Admin.findOne({
            email: credentials.email,
          }).lean();
          if (!admin) return null;

          const valid = await verifyPassword(
            credentials.password,
            admin.motDePasse,
          );
          if (!valid) return null;

          return {
            id: (admin._id as { toString(): string }).toString(),
            email: admin.email,
            name: admin.nomComplet,
            photoUrl: admin.photoUrl,
            role: "admin" as const,
          };
        }

        // ── Client Workflow ────────────────────────────────────────────────────
        if (accountType === "client") {
          const client = await Client.findOne({
            email: credentials.email,
          }).lean();
          if (!client) return null;
          if (!client.isActive) return null; // inactive clients cannot sign in

          const valid = await verifyPassword(
            credentials.password,
            client.motDePasse,
          );
          if (!valid) return null;

          return {
            id: (client._id as { toString(): string }).toString(),
            email: client.email,
            name: client.nomComplet,
            photoUrl: client.photoUrl,
            role: "client" as const,
          };
        }

        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in `user` is populated; on subsequent requests only token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.photoUrl = (user as any).photoUrl;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        (session.user as any).photoUrl = token.photoUrl;
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
