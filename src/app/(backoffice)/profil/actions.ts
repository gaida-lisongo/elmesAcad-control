"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Admin, Client } from "@/utils/models";
import { cloudinaryService } from "@/utils/storage/CloudinaryService";

// ─── Helper to convert Mongoose objects to plain objects ────────────────────
function toPlainObject(obj: any) {
  if (!obj) return null;
  return JSON.parse(JSON.stringify(obj));
}

// ─── Validation Schemas ───────────────────────────────────────────────────────

const UpdateProfileSchema = z.object({
  nomComplet: z.string().min(2, "Minimum 2 caractères.").optional(),
  email: z.string().email("Email invalide.").optional(),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis."),
  newPassword: z.string().min(8, "Minimum 8 caractères."),
});

// ─── Update Profile ───────────────────────────────────────────────────────────

export async function updateProfile(data: {
  nomComplet?: string;
  email?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Non authentifié." };
    }

    // Validate input
    const parsed = UpdateProfileSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstErrorKey = Object.keys(
        fieldErrors,
      )[0] as keyof typeof fieldErrors;
      return {
        success: false,
        error: fieldErrors[firstErrorKey]?.[0] || "Erreur de validation.",
      };
    }

    // Only proceed if at least one field is provided
    if (!parsed.data.nomComplet && !parsed.data.email) {
      return {
        success: false,
        error: "Au moins un champ à mettre à jour.",
      };
    }

    await connectDB();
    const isAdmin = session.user.role === "admin";

    // Check email conflict only if email is being updated
    if (parsed.data.email) {
      const Model: any = isAdmin ? Admin : Client;
      const conflict = await Model.findOne({
        email: parsed.data.email,
        _id: { $ne: session.user.id },
      });
      if (conflict) {
        return { success: false, error: "Cet email est déjà utilisé." };
      }
    }

    const updateData: any = {};
    if (parsed.data.nomComplet) updateData.nomComplet = parsed.data.nomComplet;
    if (parsed.data.email) updateData.email = parsed.data.email;

    const Model: any = isAdmin ? Admin : Client;
    const updated = await Model.findByIdAndUpdate(session.user.id, updateData, {
      new: true,
    })
      .select("-motDePasse -resetToken -resetTokenExpiry")
      .lean();

    console.log("Updated user in DB:", updated);

    return { success: true, user: toPlainObject(updated) };
  } catch (error: any) {
    console.error("updateProfile error:", error);
    return {
      success: false,
      error: error?.message || "Erreur lors de la mise à jour.",
    };
  }
}

// ─── Update Avatar ────────────────────────────────────────────────────────────

export async function updateAvatar(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    console.log("Session in updateAvatar:", session);

    if (!session?.user?.id) {
      return { success: false, error: "Non authentifié." };
    }

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: "Aucun fichier fourni." };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Format non supporté (jpg, png, webp, gif).",
      };
    }

    const result = await cloudinaryService.uploadFile(
      file,
      "ent-control-plane/avatars",
    );

    await connectDB();
    const isAdmin = session.user.role === "admin";

    const Model: any = isAdmin ? Admin : Client;
    const updated = await Model.findByIdAndUpdate(
      session.user.id,
      { photoUrl: result.secure_url },
      { new: true },
    )
      .select("-motDePasse -resetToken -resetTokenExpiry")
      .lean();

    console.log("Updated user in DB:", updated);

    return {
      success: true,
      user: toPlainObject(updated),
      url: result.secure_url,
    };
  } catch (error: any) {
    console.error("updateAvatar error:", error);
    return {
      success: false,
      error: error?.message || "Erreur lors de l'upload.",
    };
  }
}

// ─── Change Password ──────────────────────────────────────────────────────────

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Non authentifié." };
    }

    // Validate input
    const parsed = ChangePasswordSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstErrorKey = Object.keys(
        fieldErrors,
      )[0] as keyof typeof fieldErrors;
      return {
        success: false,
        error: fieldErrors[firstErrorKey]?.[0] || "Erreur de validation.",
      };
    }

    await connectDB();
    const isAdmin = session.user.role === "admin";

    const Model: any = isAdmin ? Admin : Client;
    const user = await Model.findById(session.user.id);
    if (!user) {
      return { success: false, error: "Utilisateur introuvable." };
    }

    // Verify current password
    const valid = await bcrypt.compare(
      parsed.data.currentPassword,
      user.motDePasse,
    );
    if (!valid) {
      return {
        success: false,
        error: "Mot de passe actuel incorrect.",
      };
    }

    // Hash and save new password
    user.motDePasse = await bcrypt.hash(parsed.data.newPassword, 12);
    await user.save();

    return { success: true };
  } catch (error: any) {
    console.error("changePassword error:", error);
    return {
      success: false,
      error: error?.message || "Erreur lors de la mise à jour.",
    };
  }
}
