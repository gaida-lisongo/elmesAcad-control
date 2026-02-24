"use server";

import { connectDB } from "@/lib/db";
import { CommandePackage, Account, Client } from "@/utils/models";
import mongoose from "mongoose";

/**
 * Vérifie le statut d'une commande auprès de FlexPay
 * et l'active si le paiement est confirmé
 */
export async function activateCommandeAfterPayment(
  commandeId: string,
  userId: string,
): Promise<{
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}> {
  try {
    if (!mongoose.Types.ObjectId.isValid(commandeId)) {
      return {
        success: false,
        error: "ID de commande invalide",
      };
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return {
        success: false,
        error: "ID utilisateur invalide",
      };
    }

    await connectDB();

    // 1. Récupérer la commande
    const commande = await CommandePackage.findById(commandeId);
    if (!commande) {
      return {
        success: false,
        error: "Commande non trouvée",
      };
    }

    // 2. Mettre à jour le statut de la commande en "completed"
    commande.status = "completed";
    await commande.save();

    console.log("✅ Commande marquée comme complétée:", commandeId);

    // 3. Vérifier si l'utilisateur a déjà un Account
    let account = await Account.findOne({ clientId: userId });

    if (!account) {
      // Créer un nouvel Account avec quotité 0.8
      account = await Account.create({
        clientId: userId,
        packageId: commande.packageId,
        quotite: 0.8,
        solde: 0, // Initialiser le solde à 0
      });
      console.log("✅ Nouveau Account créé:", account._id);
    } else {
      // Mettre à jour l'Account existant avec le nouveau packageId
      account.packageId = commande.packageId;
      await account.save();
      console.log("✅ Account mis à jour:", account._id);
    }

    return {
      success: true,
      message: "Commande activée avec succès",
      data: {
        commandeId,
        accountId: account._id,
        quotite: account.quotite,
      },
    };
  } catch (error: any) {
    console.error("❌ Erreur activation commande:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de l'activation",
    };
  }
}

/**
 * Crée une nouvelle commande avec dépôt FlexPay
 * Étape 1: Sélectionner package
 * Étape 2: Renseigner numéro
 * Étape 3: Créer commande
 */
export async function createNewCommande(
  userId: string,
  packageId: string,
  phoneNumber: string,
  email: string,
): Promise<{
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}> {
  try {
    await connectDB();

    // 1. Récupérer le package pour le prix
    const Package = mongoose.model(
      "Package",
      new mongoose.Schema({ titre: String, prix: Number }),
    );
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return { success: false, error: "Package non trouvé" };
    }

    // 2. Créer la commande avec statut "pending"
    const commande = await CommandePackage.create({
      clientId: userId,
      packageId,
      amount: pkg.prix,
      status: "pending",
      email,
      phone: phoneNumber,
      reference: `CMD-${Date.now()}`,
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });

    return {
      success: true,
      message: "Commande créée",
      data: {
        commandeId: commande._id,
        orderNumber: commande.orderNumber,
        amount: commande.amount,
      },
    };
  } catch (error: any) {
    console.error("❌ Erreur création commande:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la création",
    };
  }
}

/**
 * Obtient les détails du paiement depuis FlexPay
 */
export async function checkPaymentStatus(orderNumber: string): Promise<{
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}> {
  try {
    if (!orderNumber) {
      return {
        success: false,
        error: "N° de commande requis",
      };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/flexpay?orderNumber=${orderNumber}`,
    );

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("❌ Erreur vérification paiement:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la vérification",
    };
  }
}
