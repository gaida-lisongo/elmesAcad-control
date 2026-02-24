"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Hero } from "@/utils/models";
import { cloudinaryService } from "@/utils/storage/CloudinaryService";

// ─── Helper to convert Mongoose objects to plain objects ────────────────────
function toPlainObject(obj: any) {
  if (!obj) return null;
  return JSON.parse(JSON.stringify(obj));
}

// ─── Validation Schemas ───────────────────────────────────────────────────────

const HeroUpdateSchema = z.object({
  promesse: z
    .string()
    .min(5, "La promesse doit contenir au moins 5 caractères.")
    .optional(),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères.")
    .optional(),
});

// ─── READ: Get Hero ────────────────────────────────────────────────────────────

export async function getHero() {
  try {
    await connectDB();

    // Récupérer la première (et seule) instance de Hero
    const hero = await Hero.findOne().lean();

    return {
      success: true,
      data: toPlainObject(hero),
    };
  } catch (error: any) {
    console.error("Erreur lors de la récupération de Hero:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des données.",
    };
  }
}

// ─── CREATE OR UPDATE: Créer ou mettre à jour Hero (Admin only) ────────────────

export async function createOrUpdateHero(data: {
  promesse?: string;
  description?: string;
  imageFile?: File | null;
}) {
  try {
    // Vérifier l'authentification et le rôle
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Non authentifié." };
    }

    if (session.user.role !== "admin") {
      return {
        success: false,
        error: "Accès refusé. Seuls les admins peuvent modifier la Hero.",
      };
    }

    // Valider les données
    const parsed = HeroUpdateSchema.safeParse({
      promesse: data.promesse,
      description: data.description,
    });

    if (!parsed.success) {
      const fieldError = Object.values(parsed.error.flatten().fieldErrors)[0];
      return {
        success: false,
        error: fieldError?.[0] || "Erreur de validation.",
      };
    }

    await connectDB();

    // Récupérer la Hero existante (s'il n'y en a qu'une)
    const existingHero = await Hero.findOne();

    let updateData: any = {
      ...(data.promesse && { promesse: data.promesse }),
      ...(data.description && { description: data.description }),
    };

    // Gérer l'upload d'image via Cloudinary
    if (data.imageFile) {
      try {
        const buffer = Buffer.from(await data.imageFile.arrayBuffer());
        const uploadResult = await cloudinaryService.uploadBuffer(buffer, {
          folder: "saascandy/hero",
          publicId: existingHero?._id?.toString() || "hero-main",
          overwrite: true,
        });

        updateData.imageUrl = uploadResult.secure_url;

        // Si une ancienne image existait, essayer de la supprimer
        if (existingHero?.imageUrl) {
          try {
            const oldPublicId = existingHero._id?.toString() || "hero-main";
            await cloudinaryService.deleteByPublicId(oldPublicId);
          } catch (deleteError) {
            // Log l'erreur mais continue
            console.warn(
              "Impossible de supprimer l'ancienne image:",
              deleteError,
            );
          }
        }
      } catch (uploadError: any) {
        console.error("Erreur upload Cloudinary:", uploadError);
        return {
          success: false,
          error: "Erreur lors de l'upload de l'image.",
        };
      }
    }

    let savedHero;

    if (existingHero) {
      // Mise à jour de la Hero existante
      Object.assign(existingHero, updateData);
      savedHero = await existingHero.save();
    } else {
      // Création d'une nouvelle Hero avec les valeurs par défaut
      const newHero = new Hero({
        promesse: data.promesse || "Build Innovative Apps For Your Business",
        description:
          data.description ||
          "Build smarter, move faster, and grow stronger with custom apps designed to support your business every step of the way.",
        imageUrl: updateData.imageUrl || "/images/hero/right-image.png",
      });
      savedHero = await newHero.save();
    }

    return {
      success: true,
      message: existingHero
        ? "Hero mise à jour avec succès."
        : "Hero créée avec succès.",
      data: toPlainObject(savedHero),
    };
  } catch (error: any) {
    console.error("Erreur lors de la création/mise à jour de Hero:", error);
    return {
      success: false,
      error: "Erreur lors de la sauvegarde.",
    };
  }
}

// ─── DELETE & RECREATE: Helper pour réinitialiser la Hero ─────────────────────

export async function resetHero() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return { success: false, error: "Accès refusé." };
    }

    await connectDB();

    // Supprimer la Hero existante
    await Hero.deleteMany({});

    return {
      success: true,
      message: "Hero réinitialisée.",
    };
  } catch (error: any) {
    console.error("Erreur lors de la réinitialisation de Hero:", error);
    return {
      success: false,
      error: "Erreur lors de la réinitialisation.",
    };
  }
}
