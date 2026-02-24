import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Admin, Client } from "@/utils/models";

const UpdateSchema = z
  .object({
    nomComplet: z.string().min(2, "Minimum 2 caractères.").optional(),
    email: z.string().email("Email invalide.").optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "Au moins un champ à mettre à jour.",
  );

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  await connectDB();
  const user =
    (await Admin.findById(session.user.id)
      .select("-motDePasse -resetToken -resetTokenExpiry")
      .lean()) ??
    (await Client.findById(session.user.id)
      .select("-motDePasse -resetToken -resetTokenExpiry")
      .lean());

  if (!user)
    return NextResponse.json(
      { error: "Utilisateur introuvable." },
      { status: 404 },
    );

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log("Session in PATCH /me:", session);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );

  await connectDB();

  const isAdmin = session.user.role === "admin";
  const Model = isAdmin ? (Admin as any) : (Client as any);

  // Check email conflict only if email is being updated
  if (parsed.data.email) {
    const conflict = await Model.findOne({
      email: parsed.data.email,
      _id: { $ne: session.user.id },
    });
    if (conflict)
      return NextResponse.json(
        { error: "Cet email est déjà utilisé." },
        { status: 409 },
      );
  }

  const updateData: any = {};
  if (parsed.data.nomComplet) updateData.nomComplet = parsed.data.nomComplet;
  if (parsed.data.email) updateData.email = parsed.data.email;

  const updated = await Model.findByIdAndUpdate(session.user.id, updateData, {
    new: true,
  })
    .select("-motDePasse -resetToken -resetTokenExpiry")
    .lean();

  return NextResponse.json({ user: updated });
}
