import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomUUID } from "crypto";
import { connectDB } from "@/lib/db";
import { Client } from "@/utils/models";

const RegisterSchema = z.object({
  nomComplet: z.string().min(2, "Minimum 2 caractères."),
  email: z.string().email("Email invalide."),
  motDePasse: z.string().min(6, "Minimum 6 caractères."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    await connectDB();

    const exists = await Client.findOne({ email: parsed.data.email });
    if (exists) {
      return NextResponse.json(
        { errors: { email: ["Cet email est déjà utilisé."] } },
        { status: 409 },
      );
    }

    const hashed = await bcrypt.hash(parsed.data.motDePasse, 12);

    await Client.create({
      nomComplet: parsed.data.nomComplet,
      email: parsed.data.email,
      motDePasse: hashed,
      role: "client",
      logo: "",
      uuid: randomUUID(),
      apiKey: randomUUID(),
      apiSecret: randomUUID(),
      isActive: true,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
