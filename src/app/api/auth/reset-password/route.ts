import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Admin, Client } from "@/utils/models";

const Schema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides." },
        { status: 422 },
      );
    }

    const { email, token, password } = parsed.data;
    await connectDB();

    // Debug: chercher d'abord par email seul
    const adminByEmail = await Admin.findOne({ email });
    const clientByEmail = !adminByEmail
      ? await Client.findOne({ email })
      : null;
    const found = adminByEmail ?? clientByEmail;

    console.log(
      "[reset-password] found by email:",
      !!found,
      "| stored token:",
      found?.resetToken?.slice(0, 8),
      "| received token:",
      token.slice(0, 8),
    );

    const user =
      (await Admin.findOne({ email, resetToken: token })) ??
      (await Client.findOne({ email, resetToken: token }));

    if (!user) {
      return NextResponse.json(
        { error: "Lien invalide ou expiré." },
        { status: 400 },
      );
    }

    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Ce lien a expiré. Veuillez faire une nouvelle demande." },
        { status: 400 },
      );
    }

    user.motDePasse = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
