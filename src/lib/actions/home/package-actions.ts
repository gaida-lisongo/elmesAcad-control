"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Package, Module } from "@/utils/models";
import mongoose from "mongoose";

// ─── Helpers ───────────────────────────────────────────────────────────────
function toPlainObject(obj: any) {
  if (!obj) return null;
  return JSON.parse(JSON.stringify(obj));
}

const PackageSchema = z.object({
  titre: z.string().min(2, "Le titre doit contenir au moins 2 caractères."),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères."),
  benefices: z.array(z.string()).optional(),
  avantages: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  prix: z.number().positive("Le prix doit être positif."),
  packageHeritage: z.string().optional(),
  modules: z.array(z.string()).optional(),
});

// ─── READ: Get packages ─────────────────────────────────────────────────────

export async function getPackages() {
  try {
    await connectDB();
    const packages = await Package.find()
      .sort({ createdAt: -1 })
      .populate("modules")
      .populate("packageHeritage", "titre prix description")
      .lean()
      .exec();
    return { success: true, data: toPlainObject(packages) };
  } catch (error: any) {
    console.error("Erreur lors de la récupération des packages:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des données.",
    };
  }
}

export async function getPackageById(id: string) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "ID du package invalide." };
    }

    await connectDB();
    const pkg = await Package.findById(id)
      .populate("modules")
      .populate("packageHeritage", "titre prix description modules")
      .populate("packageHeritage.modules", "nom description features")
      .lean()
      .exec();
    if (!pkg) {
      return { success: false, error: "Package non trouvé." };
    }
    return { success: true, data: toPlainObject(pkg) };
  } catch (error: any) {
    console.error("Erreur lors de la récupération du package:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du package.",
    };
  }
}

// ─── CREATE: Create package (Admin only) ────────────────────────────────────

export async function createPackage(data: {
  titre: string;
  description: string;
  benefices?: string[];
  avantages?: string[];
  features?: string[];
  prix: number;
  packageHeritage?: string;
  modules?: string[];
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Non authentifié." };
    }

    if (session.user.role !== "admin") {
      return { success: false, error: "Accès refusé. Admin uniquement." };
    }

    const parsed = PackageSchema.safeParse({
      titre: data.titre,
      description: data.description,
      benefices: data.benefices || [],
      avantages: data.avantages || [],
      features: data.features || [],
      prix: data.prix,
      packageHeritage: data.packageHeritage,
      modules: data.modules || [],
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((e: any) => e.message).join(", "),
      };
    }

    await connectDB();

    const packageData: any = {
      titre: data.titre,
      description: data.description,
      benefices: data.benefices || [],
      avantages: data.avantages || [],
      features: data.features || [],
      prix: data.prix,
    };

    // Ajouter le package héritage si fourni
    if (
      data.packageHeritage &&
      mongoose.Types.ObjectId.isValid(data.packageHeritage)
    ) {
      packageData.packageHeritage = new mongoose.Types.ObjectId(
        data.packageHeritage,
      );
    }

    // Ajouter les modules si fournis
    if (data.modules && data.modules.length > 0) {
      packageData.modules = data.modules
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    const newPackage = await Package.create(packageData);

    return {
      success: true,
      data: toPlainObject(newPackage),
    };
  } catch (error: any) {
    console.error("Erreur lors de la création du package:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la création du package.",
    };
  }
}

// ─── UPDATE: Update package (Admin only) ────────────────────────────────────

export async function updatePackage(
  id: string,
  data: {
    titre?: string;
    description?: string;
    benefices?: string[];
    avantages?: string[];
    features?: string[];
    prix?: number;
    packageHeritage?: string;
    modules?: string[];
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "ID du package invalide." };
    }

    await connectDB();

    const updateData: any = {};

    if (data.titre) updateData.titre = data.titre;
    if (data.description) updateData.description = data.description;
    if (data.benefices) updateData.benefices = data.benefices;
    if (data.avantages) updateData.avantages = data.avantages;
    if (data.features) updateData.features = data.features;
    if (data.prix !== undefined) updateData.prix = data.prix;

    if (data.packageHeritage !== undefined) {
      if (
        data.packageHeritage &&
        mongoose.Types.ObjectId.isValid(data.packageHeritage)
      ) {
        updateData.packageHeritage = new mongoose.Types.ObjectId(
          data.packageHeritage,
        );
      } else {
        updateData.packageHeritage = null;
      }
    }

    if (data.modules !== undefined) {
      if (data.modules && data.modules.length > 0) {
        updateData.modules = data.modules
          .filter((moduleId) => mongoose.Types.ObjectId.isValid(moduleId))
          .map((moduleId) => new mongoose.Types.ObjectId(moduleId));
      } else {
        updateData.modules = [];
      }
    }

    const updated = await Package.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("modules")
      .populate("packageHeritage", "titre prix description")
      .lean();

    if (!updated) {
      return { success: false, error: "Package introuvable." };
    }

    return {
      success: true,
      data: toPlainObject(updated),
    };
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du package:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la mise à jour du package.",
    };
  }
}

// ─── DELETE: Delete package (Admin only) ────────────────────────────────────

export async function deletePackage(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Non authentifié." };
    }

    if (session.user.role !== "admin") {
      return { success: false, error: "Accès refusé. Admin uniquement." };
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "ID du package invalide." };
    }

    await connectDB();

    const deleted = await Package.findByIdAndDelete(id);

    if (!deleted) {
      return { success: false, error: "Package introuvable." };
    }

    return {
      success: true,
      message: "Package supprimé avec succès.",
    };
  } catch (error: any) {
    console.error("Erreur lors de la suppression du package:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la suppression du package.",
    };
  }
}
