"use server";

import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Client, CommandePackage } from "@/utils/models";
import { mailService } from "@/utils/mail/MailService";
import { cloudinaryService } from "@/utils/storage/CloudinaryService";
import crypto from "crypto";
import mongoose from "mongoose";

// ─── Helper ───────────────────────────────────────────────────────────────
function toPlainObject(obj: any) {
  if (!obj) return null;
  return JSON.parse(JSON.stringify(obj));
}

function generatePassword(): string {
  return crypto.randomBytes(12).toString("hex");
}

function generateUUID(): string {
  return crypto.randomUUID();
}

function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Hachage simple (en production, utiliser bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const ClientCreationSchema = z.object({
  nomComplet: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  email: z.string().email("Email invalide."),
  logo: z.string().optional(),
  logoFile: z.instanceof(File).optional(),
});

const CommandeSchema = z.object({
  packageId: z.string().min(1, "Package ID requis."),
  userId: z.string().min(1, "User ID requis."),
  amount: z.number().positive("Le montant doit être positif."),
  phone: z.string().min(9, "Téléphone invalide."),
  email: z.string().email("Email invalide."),
});

// ─── CREATE: Client (Prospect) ────────────────────────────────────────────

export async function createClientProspect(data: {
  nomComplet: string;
  email: string;
  logoFile?: File | null;
}): Promise<any> {
  try {
    const parsed = ClientCreationSchema.safeParse({
      nomComplet: data.nomComplet,
      email: data.email,
      logoFile: data.logoFile,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((e: any) => e.message).join(", "),
      };
    }

    await connectDB();

    // Vérifier si l'email existe déjà
    const existing = await Client.findOne({ email: data.email });
    if (existing) {
      return {
        success: false,
        error: "Cet email est déjà utilisé.",
      };
    }

    let logoUrl = "/images/logo/default-logo.png";

    // Upload logo si fourni
    if (data.logoFile) {
      try {
        const buffer = Buffer.from(await data.logoFile.arrayBuffer());
        const uploadResult = await cloudinaryService.uploadBuffer(buffer, {
          folder: "saascandy/clients",
          publicId: `logo_${Date.now()}`,
        });
        logoUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Erreur upload logo:", uploadError);
      }
    }

    // Générer les credentials
    const password = generatePassword();
    const uuid = generateUUID();
    const apiKey = generateApiKey();
    const apiSecret = generateApiKey();
    const hashedPassword = hashPassword(password);

    // Créer le client
    const newClient = await Client.create({
      nomComplet: data.nomComplet,
      email: data.email,
      logo: logoUrl,
      uuid,
      apiKey,
      apiSecret,
      motDePasse: hashedPassword,
      role: "client",
      isActive: false, // Activer après paiement
    });

    return {
      success: true,
      data: {
        _id: newClient._id.toString(),
        email: newClient.email,
        nomComplet: newClient.nomComplet,
        password, // À envoyer en email à l'étape finale
      },
    };
  } catch (error: any) {
    console.error("Erreur création client prospect:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la création du client.",
    };
  }
}

// ─── CREATE: Commande Package ────────────────────────────────────────────

export async function createCommandePackage(data: {
  packageId: string;
  userId: string;
  amount: number;
  phone: string;
  email: string;
  reference: string;
}) {
  try {
    const parsed = CommandeSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((e: any) => e.message).join(", "),
      };
    }

    await connectDB();

    // Valider les IDs
    if (
      !mongoose.Types.ObjectId.isValid(data.packageId) ||
      !mongoose.Types.ObjectId.isValid(data.userId)
    ) {
      return {
        success: false,
        error: "IDs invalides.",
      };
    }

    // Créer la commande
    const commande = await CommandePackage.create({
      packageId: new mongoose.Types.ObjectId(data.packageId),
      userId: new mongoose.Types.ObjectId(data.userId),
      amount: data.amount,
      phone: data.phone,
      email: data.email,
      reference: data.reference,
      description: `Commande package #{data.reference}`,
      status: "pending",
      orderNumber: `ORD_${Date.now()}`,
    });

    return {
      success: true,
      data: toPlainObject(commande),
    };
  } catch (error: any) {
    console.error("Erreur création commande:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la création de la commande.",
    };
  }
}

// ─── UPDATE: Activate client after payment ────────────────────────────────

export async function activateClientAfterPayment(
  userId: string,
  password: string,
) {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return {
        success: false,
        error: "User ID invalide.",
      };
    }

    await connectDB();

    const client = await Client.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true },
    ).lean();

    if (!client) {
      return {
        success: false,
        error: "Client introuvable.",
      };
    }

    // Envoyer l'email de confirmation avec les credentials
    await mailService.sendWelcomeEmail({
      email: client.email as string,
      nomComplet: client.nomComplet as string,
      password,
      apiKey: client.apiKey as string,
    });

    return {
      success: true,
      data: toPlainObject(client),
    };
  } catch (error: any) {
    console.error("Erreur activation client:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de l'activation.",
    };
  }
}

// ─── UPDATE: Mark commande as completed ───────────────────────────────────

export async function updateCommandeStatus(
  commandeId: string,
  status: "completed" | "failed",
) {
  try {
    if (!mongoose.Types.ObjectId.isValid(commandeId)) {
      return {
        success: false,
        error: "Commande ID invalide.",
      };
    }

    await connectDB();

    const commande = await CommandePackage.findByIdAndUpdate(
      commandeId,
      { status },
      { returnDocument: "after" },
    ).lean();

    if (!commande) {
      return {
        success: false,
        error: "Commande introuvable.",
      };
    }

    return {
      success: true,
      data: toPlainObject(commande),
    };
  } catch (error: any) {
    console.error("Erreur mise à jour commande:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la mise à jour.",
    };
  }
}

// ─── UPDATE: Update Commande with FlexPay OrderNumber ─────────────────────
export async function updateCommandeOrderNumber(
  commandeId: string,
  flexPayOrderNumber: string,
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    if (!mongoose.Types.ObjectId.isValid(commandeId)) {
      return {
        success: false,
        error: "Commande ID invalide.",
      };
    }

    await connectDB();

    const commande = await CommandePackage.findByIdAndUpdate(
      commandeId,
      {
        orderNumber: flexPayOrderNumber,
        reference: `MOBILE_${Date.now()}`,
      },
      { returnDocument: "after" },
    ).lean();

    if (!commande) {
      return {
        success: false,
        error: "Commande introuvable.",
      };
    }

    console.log("✅ Commande mise à jour avec orderNumber FlexPay:", flexPayOrderNumber);

    return {
      success: true,
      data: toPlainObject(commande),
    };
  } catch (error: any) {
    console.error("Erreur mise à jour orderNumber:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la mise à jour.",
    };
  }
}
