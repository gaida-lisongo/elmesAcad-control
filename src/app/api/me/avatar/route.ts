import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Admin, Client } from "@/utils/models";
import { cloudinaryService } from "@/utils/storage/CloudinaryService";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0)
    return NextResponse.json(
      { error: "Aucun fichier fourni." },
      { status: 400 },
    );

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type))
    return NextResponse.json(
      { error: "Format non supporté (jpg, png, webp, gif)." },
      { status: 400 },
    );

  const result = await cloudinaryService.uploadFile(
    file,
    "ent-control-plane/avatars",
  );

  await connectDB();
  const isAdmin = session.user.role === "admin";
  if (isAdmin) {
    const updated = await (Admin as any)
      .findByIdAndUpdate(
        session.user.id,
        { photoUrl: result.secure_url },
        { new: true },
      )
      .select("-motDePasse -resetToken -resetTokenExpiry")
      .lean();
    return NextResponse.json({ user: updated, url: result.secure_url });
  } else {
    const updated = await (Client as any)
      .findByIdAndUpdate(
        session.user.id,
        { photoUrl: result.secure_url },
        { new: true },
      )
      .select("-motDePasse -resetToken -resetTokenExpiry")
      .lean();
    return NextResponse.json({ user: updated, url: result.secure_url });
  }
}
