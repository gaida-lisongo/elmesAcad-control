"use server";

import { connectDB } from "@/lib/db";
import { Client, Account, Package } from "@/utils/models";
import mongoose from "mongoose";

/**
 * Récupère tous les packages
 */
export async function getPackages(): Promise<any[]> {
  try {
    await connectDB();
    const packages = await Package.find({})
      .select("_id titre prix")
      .lean()
      .sort({ createdAt: -1 });

    return JSON.parse(JSON.stringify(packages));
  } catch (error) {
    console.error("Erreur lors de la récupération des packages:", error);
    return [];
  }
}

/**
 * Récupère tous les accounts avec client et package populés
 */
export async function getAccounts(): Promise<any[]> {
  try {
    await connectDB();
    const accounts = await Account.find({})
      .populate(
        "clientId",
        "nomComplet email photoUrl logo uuid apiKey apiSecret isActive createdAt",
      )
      .populate("packageId", "_id titre prix")
      .lean()
      .sort({ createdAt: -1 });

    return JSON.parse(JSON.stringify(accounts));
  } catch (error) {
    console.error("Erreur lors de la récupération des accounts:", error);
    return [];
  }
}

/**
 * Met à jour le logo d'un client
 */
export async function updateClientLogo(
  clientId: string,
  fileBase64: string,
): Promise<{
  success: boolean;
  message: string;
  logoUrl?: string;
}> {
  try {
    const { cloudinaryService } =
      await import("@/utils/storage/CloudinaryService");
    await connectDB();

    // Convertir base64 en buffer
    const buffer = Buffer.from(fileBase64, "base64");

    // Upload vers Cloudinary
    const uploadResult = await cloudinaryService.uploadBuffer(buffer, {
      folder: "clients-logos",
      overwrite: true,
    });

    const logoUrl = uploadResult.secure_url;

    // Mettre à jour le client avec la nouvelle URL du logo
    const clientId_ObjectId = new mongoose.Types.ObjectId(clientId);

    const result = await Client.findByIdAndUpdate(
      clientId_ObjectId,
      { logo: logoUrl },
      { new: true },
    );

    if (!result) {
      return {
        success: false,
        message: "Client non trouvé",
      };
    }

    return {
      success: true,
      message: "Logo mis à jour avec succès",
      logoUrl,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du logo:", error);
    return {
      success: false,
      message: "Erreur lors de la mise à jour du logo",
    };
  }
}

/**
 * Supprime un client de manière sécurisée (isActive: false)
 */
export async function deleteClient(clientId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await connectDB();

    const clientId_ObjectId = new mongoose.Types.ObjectId(clientId);

    const result = await Client.findByIdAndUpdate(
      clientId_ObjectId,
      { isActive: false },
      { new: true },
    );

    if (!result) {
      return {
        success: false,
        message: "Client non trouvé",
      };
    }

    return {
      success: true,
      message: "Client désactivé avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la suppression du client:", error);
    return {
      success: false,
      message: "Erreur lors de la suppression du client",
    };
  }
}

/**
 * Réactive un client
 */
export async function reactivateClient(clientId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await connectDB();

    const clientId_ObjectId = new mongoose.Types.ObjectId(clientId);

    const result = await Client.findByIdAndUpdate(
      clientId_ObjectId,
      { isActive: true },
      { new: true },
    );

    if (!result) {
      return {
        success: false,
        message: "Client non trouvé",
      };
    }

    return {
      success: true,
      message: "Client réactivé avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la réactivation du client:", error);
    return {
      success: false,
      message: "Erreur lors de la réactivation du client",
    };
  }
}

/**
 * Met à jour la quotité d'un client
 */
export async function updateClientQuotite(
  accountId: string,
  newQuotite: number,
): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    await connectDB();

    if (newQuotite < 0 || newQuotite > 1) {
      return {
        success: false,
        message: "La quotité doit être entre 0 et 1",
      };
    }

    const accountId_ObjectId = new mongoose.Types.ObjectId(accountId);

    const result = await Account.findByIdAndUpdate(
      accountId_ObjectId,
      { quotite: newQuotite },
      { new: true },
    ).lean();

    if (!result) {
      return {
        success: false,
        message: "Account non trouvé",
      };
    }

    return {
      success: true,
      message: "Quotité mise à jour avec succès",
      data: JSON.parse(JSON.stringify(result)),
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la quotité:", error);
    return {
      success: false,
      message: "Erreur lors de la mise à jour de la quotité",
    };
  }
}

/**
 * Récupère les détails complètes d'un client
 */
export async function getClientDetails(clientId: string): Promise<any | null> {
  try {
    await connectDB();

    const clientId_ObjectId = new mongoose.Types.ObjectId(clientId);

    const client = await Client.findById(clientId_ObjectId)
      .select(
        "nomComplet email photoUrl logo uuid apiKey apiSecret isActive createdAt",
      )
      .lean();

    if (!client) {
      return null;
    }

    const account = await Account.findOne({
      clientId: clientId_ObjectId,
    })
      .select("_id quotite solde")
      .lean();

    const result = {
      ...client,
      _id: client._id.toString(),
      account: account
        ? {
            _id: account._id.toString(),
            quotite: account.quotite,
            solde: account.solde,
          }
        : null,
      createdAt: new Date(client.createdAt).toLocaleDateString("fr-FR"),
    };

    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("Erreur lors de la récupération du client:", error);
    return null;
  }
}

/**
 * Met à jour l'email d'un client
 */
export async function updateClientEmail(
  clientId: string,
  newEmail: string,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await connectDB();

    if (!newEmail || !newEmail.includes("@")) {
      return {
        success: false,
        message: "Email invalide",
      };
    }

    const clientId_ObjectId = new mongoose.Types.ObjectId(clientId);

    const result = await Client.findByIdAndUpdate(
      clientId_ObjectId,
      { email: newEmail },
      { new: true },
    );

    if (!result) {
      return {
        success: false,
        message: "Client non trouvé",
      };
    }

    return {
      success: true,
      message: "Email mis à jour avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'email:", error);
    return {
      success: false,
      message: "Erreur lors de la mise à jour de l'email",
    };
  }
}

/**
 * Met à jour le solde du compte d'un client
 */
export async function updateAccountSolde(
  accountId: string,
  newSolde: number,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await connectDB();

    if (newSolde < 0) {
      return {
        success: false,
        message: "Le solde ne peut pas être négatif",
      };
    }

    const accountId_ObjectId = new mongoose.Types.ObjectId(accountId);

    const result = await Account.findByIdAndUpdate(
      accountId_ObjectId,
      { solde: newSolde },
      { new: true },
    );

    if (!result) {
      return {
        success: false,
        message: "Account non trouvé",
      };
    }

    return {
      success: true,
      message: "Solde mis à jour avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du solde:", error);
    return {
      success: false,
      message: "Erreur lors de la mise à jour du solde",
    };
  }
}
