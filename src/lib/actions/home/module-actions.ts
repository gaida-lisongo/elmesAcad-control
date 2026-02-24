"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Module } from "@/utils/models";
import { cloudinaryService } from "@/utils/storage/CloudinaryService";

// ─── Helpers ───────────────────────────────────────────────────────────────
function toPlainObject(obj: any) {
  if (!obj) return null;
  return JSON.parse(JSON.stringify(obj));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const ModuleSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères."),
  probleme: z
    .string()
    .min(10, "Le détail doit contenir au moins 10 caractères."),
  objectifs: z.string().optional(),
  imageUrl: z.string().optional(),
  features: z.array(z.string()).optional(),
  slug: z.string().optional(),
});

// ─── READ: Get modules ─────────────────────────────────────────────────────

export async function getModules() {
  try {
    await connectDB();
    const modules = await Module.find().sort({ createdAt: -1 }).lean();
    return { success: true, data: toPlainObject(modules) };
  } catch (error: any) {
    console.error("Erreur lors de la récupération des modules:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des données.",
    };
  }
}

// ─── CREATE: Create module (Admin only) ────────────────────────────────────

export async function createModule(data: {
  nom: string;
  description: string;
  probleme: string;
  objectifs?: string;
  imageFile?: File | null;
  imageUrl?: string;
  features?: string[];
  slug?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Non authentifié." };
    }

    if (session.user.role !== "admin") {
      return { success: false, error: "Accès refusé. Admin uniquement." };
    }

    const parsed = ModuleSchema.safeParse({
      nom: data.nom,
      description: data.description,
      probleme: data.probleme,
      objectifs: data.objectifs,
      imageUrl: data.imageUrl,
      features: data.features,
      slug: data.slug,
    });
    if (!parsed.success) {
      const fieldError = Object.values(parsed.error.flatten().fieldErrors)[0];
      return {
        success: false,
        error: fieldError?.[0] || "Erreur de validation.",
      };
    }

    await connectDB();

    const slug = data.slug ? slugify(data.slug) : slugify(data.nom);
    const existing = await Module.findOne({ nom: data.nom });
    if (existing) {
      return { success: false, error: "Un module avec ce nom existe déjà." };
    }

    let imageUrl = data.imageUrl;

    if (data.imageFile) {
      try {
        const buffer = Buffer.from(await data.imageFile.arrayBuffer());
        const uploadResult = await cloudinaryService.uploadBuffer(buffer, {
          folder: "saascandy/modules",
          publicId: slug,
          overwrite: true,
        });
        imageUrl = uploadResult.secure_url;
      } catch (uploadError: any) {
        console.error("Erreur upload Cloudinary:", uploadError);
        return { success: false, error: "Erreur lors de l'upload de l'image." };
      }
    }

    const newModule = new Module({
      nom: data.nom,
      description: data.description,
      probleme: data.probleme,
      objectifs: data.objectifs,
      imageUrl,
      features: data.features || [],
      slug,
    });

    const savedModule = await newModule.save();
    return { success: true, data: toPlainObject(savedModule) };
  } catch (error: any) {
    console.error("Erreur lors de la création du module:", error);
    return { success: false, error: "Erreur lors de la création." };
  }
}

// ─── UPDATE: Update module (Admin only) ────────────────────────────────────

export async function updateModule(
  id: string,
  data: {
    nom?: string;
    description?: string;
    probleme?: string;
    objectifs?: string;
    imageFile?: File | null;
    imageUrl?: string;
    features?: string[];
    slug?: string;
  },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Non authentifié." };
    }

    if (session.user.role !== "admin") {
      return { success: false, error: "Accès refusé. Admin uniquement." };
    }

    await connectDB();

    const module = await Module.findById(id);
    if (!module) {
      return { success: false, error: "Module introuvable." };
    }

    if (data.nom) module.nom = data.nom;
    if (data.description) module.description = data.description;
    if (data.probleme) module.probleme = data.probleme;
    if (data.objectifs !== undefined) module.objectifs = data.objectifs;
    if (data.imageUrl !== undefined) module.imageUrl = data.imageUrl;
    if (data.features) module.features = data.features;
    if (data.slug) module.slug = slugify(data.slug);

    if (data.imageFile) {
      try {
        const buffer = Buffer.from(await data.imageFile.arrayBuffer());
        const publicId = module.slug
          ? slugify(module.slug)
          : slugify(module.nom);
        const uploadResult = await cloudinaryService.uploadBuffer(buffer, {
          folder: "saascandy/modules",
          publicId,
          overwrite: true,
        });
        module.imageUrl = uploadResult.secure_url;
      } catch (uploadError: any) {
        console.error("Erreur upload Cloudinary:", uploadError);
        return { success: false, error: "Erreur lors de l'upload de l'image." };
      }
    }

    const saved = await module.save();
    return { success: true, data: toPlainObject(saved) };
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du module:", error);
    return { success: false, error: "Erreur lors de la mise à jour." };
  }
}

// ─── DELETE: Delete module (Admin only) ────────────────────────────────────

export async function deleteModule(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Non authentifié." };
    }

    if (session.user.role !== "admin") {
      return { success: false, error: "Accès refusé. Admin uniquement." };
    }

    await connectDB();
    const deleted = await Module.findByIdAndDelete(id);
    if (!deleted) {
      return { success: false, error: "Module introuvable." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erreur lors de la suppression du module:", error);
    return { success: false, error: "Erreur lors de la suppression." };
  }
}
