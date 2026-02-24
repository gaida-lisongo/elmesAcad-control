import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Admin, Client } from "@/utils/models";

const Schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Minimum 8 caractères."),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );

  await connectDB();
  const user =
    (await Admin.findById(session.user.id)) ??
    (await Client.findById(session.user.id));

  if (!user)
    return NextResponse.json(
      { error: "Utilisateur introuvable." },
      { status: 404 },
    );

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.motDePasse,
  );
  if (!valid)
    return NextResponse.json(
      { error: "Mot de passe actuel incorrect." },
      { status: 400 },
    );

  user.motDePasse = await bcrypt.hash(parsed.data.newPassword, 12);
  await user.save();

  return NextResponse.json({ ok: true });
}
