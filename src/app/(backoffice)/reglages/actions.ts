"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Admin } from "@/utils/models";
import { AUTORISATIONS, type Autorisation, type AdminDTO } from "./types";

// ─── Zod schemas ──────────────────────────────────────────────────────────────
const CreateSchema = z.object({
  nomComplet: z.string().min(2, "Minimum 2 caractères."),
  email: z.string().email("Email invalide."),
  motDePasse: z
    .string()
    .min(8, "Minimum 8 caractères.")
    .max(72, "Maximum 72 caractères."),
});

const UpdateSchema = z.object({
  nomComplet: z.string().min(2, "Minimum 2 caractères."),
  email: z.string().email("Email invalide."),
});

type FieldErrors = Partial<Record<string, string[]>>;
interface ActionResult {
  error?: string;
  fieldErrors?: FieldErrors;
}

// ─── GET all admins ───────────────────────────────────────────────────────────
export async function getAdmins(): Promise<{
  data?: AdminDTO[];
  error?: string;
}> {
  try {
    await connectDB();
    const docs = await Admin.find({ role: "admin" })
      .sort({ createdAt: -1 })
      .lean();

    return {
      data: docs.map((a) => ({
        id: (a._id as any).toString(),
        nomComplet: a.nomComplet,
        email: a.email,
        autorisations: (a.autorisations ?? []) as Autorisation[],
        quotite: (a as any).quotite ?? 0,
        createdAt: (a.createdAt as any)?.toISOString?.() ?? "",
      })),
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ─── CREATE admin ─────────────────────────────────────────────────────────────
export async function createAdmin(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    nomComplet: formData.get("nomComplet"),
    email: formData.get("email"),
    motDePasse: formData.get("motDePasse"),
  };

  const parsed = CreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await connectDB();
    const exists = await Admin.findOne({ email: parsed.data.email });
    if (exists)
      return { fieldErrors: { email: ["Cet email est déjà utilisé."] } };

    const hashed = await bcrypt.hash(parsed.data.motDePasse, 12);
    await Admin.create({
      nomComplet: parsed.data.nomComplet,
      email: parsed.data.email,
      motDePasse: hashed,
      role: "admin",
      autorisations: [],
    });

    revalidatePath("/reglages");
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

// ─── UPDATE admin (info only, no password, no photo) ─────────────────────────
export async function updateAdmin(
  id: string,
  data: { nomComplet: string; email: string },
): Promise<ActionResult> {
  const parsed = UpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await connectDB();
    const conflict = await Admin.findOne({
      email: parsed.data.email,
      _id: { $ne: id },
    });
    if (conflict)
      return { fieldErrors: { email: ["Cet email est déjà utilisé."] } };

    await Admin.findByIdAndUpdate(id, {
      nomComplet: parsed.data.nomComplet,
      email: parsed.data.email,
    });

    revalidatePath("/reglages");
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

// ─── DELETE admin ─────────────────────────────────────────────────────────────
export async function deleteAdmin(id: string): Promise<ActionResult> {
  try {
    await connectDB();
    await Admin.findByIdAndDelete(id);
    revalidatePath("/reglages");
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

// ─── UPDATE autorisations ─────────────────────────────────────────────────────
export async function updateAutorisations(
  id: string,
  autorisations: Autorisation[],
): Promise<ActionResult> {
  const invalid = autorisations.filter(
    (a) => !(AUTORISATIONS as readonly string[]).includes(a),
  );
  if (invalid.length)
    return { error: `Autorisations invalides : ${invalid.join(", ")}` };

  try {
    await connectDB();
    await Admin.findByIdAndUpdate(id, { autorisations });
    revalidatePath("/reglages");
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

// ─── UPDATE quotité ───────────────────────────────────────────────────────────
export async function updateQuotite(
  id: string,
  quotite: number,
): Promise<ActionResult> {
  if (typeof quotite !== "number" || quotite < 0)
    return { error: "Quotité invalide." };
  try {
    await connectDB();
    await Admin.findByIdAndUpdate(id, { quotite });
    revalidatePath("/reglages");
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}
