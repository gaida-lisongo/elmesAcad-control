"use server";

import { connectDB } from "@/lib/db";
import {
  CommandeProduct,
  Account,
  Withdraw,
  WithdrawAdmin,
  Admin,
  Client,
} from "@/utils/models";
import mongoose from "mongoose";

export interface DashboardData {
  totalRevenue: number;
  totalSpent: number;
  balance: number;
  quotite: number;
  transactions: any[];
  withdrawals: any[];
  clients: any[];
  activities: any[];
  revenuePercent: string;
  spentPercent: string;
}

/**
 * Récupère les données du dashboard selon le rôle de l'utilisateur
 */
export async function getDashboardData(
  userId: string,
  role: "admin" | "client",
): Promise<DashboardData> {
  try {
    await connectDB();

    const userId_ObjectId = new mongoose.Types.ObjectId(userId);
    let quotite = 0;
    let completedTransactionsTotal = 0;
    let withdrawalsTotal = 0;
    let transactions: any[] = [];
    let withdrawals: any[] = [];

    // ─── POUR CLIENT ───────────────────────────────────────────────────────
    if (role === "client") {
      // 1. Récupérer les CommandeProduct du client
      const commandeProducts = await CommandeProduct.find({
        clientId: userId_ObjectId,
      })
        .lean()
        .sort({ createdAt: -1 });

      transactions = commandeProducts;

      // 2. Calculer le total des transactions complètes
      completedTransactionsTotal = commandeProducts
        .filter((t: any) => t.status === "completed")
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      // 3. Récupérer la quotite depuis Account
      const account = await Account.findOne({
        clientId: userId_ObjectId,
      }).lean();

      quotite = Number(account?.quotite ?? 0);

      // 4. Calculer le montant perçu
      const amountPerceived = completedTransactionsTotal * quotite;

      // 5. Récupérer les Withdraw (dépenses du client)
      const withdraws = await Withdraw.find({
        accountId: account?._id,
      })
        .lean()
        .sort({ createdAt: -1 });

      withdrawals = withdraws;

      // 6. Calculer le total des dépenses (completed)
      withdrawalsTotal = withdraws
        .filter((w: any) => w.status === "completed")
        .reduce((sum: number, w: any) => sum + w.amount, 0);

      // 7. Calculer le solde
      const balance = amountPerceived - withdrawalsTotal;

      return {
        totalRevenue: amountPerceived,
        totalSpent: withdrawalsTotal,
        balance,
        quotite,
        transactions,
        withdrawals,
        clients: [],
        activities: generateActivityFeed(transactions, withdrawals),
        revenuePercent:
          commandeProducts.length > 0
            ? (
                (commandeProducts.filter((t: any) => t.status === "completed")
                  .length /
                  commandeProducts.length) *
                100
              ).toFixed(1)
            : "0",
        spentPercent: "0",
      };
    }

    // ─── POUR ADMIN ───────────────────────────────────────────────────────
    if (role === "admin") {
      // 1. Récupérer toutes les CommandeProduct
      const commandeProducts = await CommandeProduct.find({})
        .lean()
        .sort({ createdAt: -1 });

      transactions = commandeProducts;

      // 2. Calculer le total des transactions complètes
      completedTransactionsTotal = commandeProducts
        .filter((t: any) => t.status === "completed")
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      // 3. Récupérer la quotite depuis User (Admin)
      const admin = await Admin.findById(userId_ObjectId).lean();
      quotite = Number(admin?.quotite ?? 0);

      // 4. Calculer le montant perçu
      const amountPerceived = completedTransactionsTotal * quotite;

      // 5. Récupérer les WithdrawAdmin (dépenses de l'admin)
      const withdrawsAdmin = await WithdrawAdmin.find({
        adminId: userId_ObjectId,
      })
        .lean()
        .sort({ createdAt: -1 });

      withdrawals = withdrawsAdmin;

      // 6. Calculer le total des dépenses (completed)
      withdrawalsTotal = withdrawsAdmin
        .filter((w: any) => w.status === "completed")
        .reduce((sum: number, w: any) => sum + w.amount, 0);

      // 7. Calculer le solde
      const balance = amountPerceived - withdrawalsTotal;

      // 8. Récupérer les clients actifs
      const clients = await Client.find({ isActive: true })
        .select("nomComplet email uuid isActive createdAt")
        .lean()
        .limit(5)
        .sort({ createdAt: -1 });

      return {
        totalRevenue: amountPerceived,
        totalSpent: withdrawalsTotal,
        balance,
        quotite,
        transactions,
        withdrawals,
        clients,
        activities: generateActivityFeed(transactions, withdrawals),
        revenuePercent:
          commandeProducts.length > 0
            ? (
                (commandeProducts.filter((t: any) => t.status === "completed")
                  .length /
                  commandeProducts.length) *
                100
              ).toFixed(1)
            : "0",
        spentPercent:
          withdrawsAdmin.length > 0
            ? (
                (withdrawsAdmin.filter((w: any) => w.status === "completed")
                  .length /
                  withdrawsAdmin.length) *
                100
              ).toFixed(1)
            : "0",
      };
    }

    return {
      totalRevenue: 0,
      totalSpent: 0,
      balance: 0,
      quotite: 0,
      transactions: [],
      withdrawals: [],
      clients: [],
      activities: [],
      revenuePercent: "0",
      spentPercent: "0",
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données du dashboard:",
      error,
    );
    return {
      totalRevenue: 0,
      totalSpent: 0,
      balance: 0,
      quotite: 0,
      transactions: [],
      withdrawals: [],
      clients: [],
      activities: [],
      revenuePercent: "0",
      spentPercent: "0",
    };
  }
}

/**
 * Génère un feed d'activité à partir des transactions et des retraits
 */
function generateActivityFeed(transactions: any[], withdrawals: any[]) {
  const activitiesList: any[] = [];

  // Ajouter les transactions complètes récentes
  transactions
    .filter((t) => t.status === "completed")
    .slice(0, 3)
    .forEach((t) => {
      activitiesList.push({
        id: `transaction-${t._id}`,
        icon: "heroicons:banknotes-20-solid",
        color: "text-success bg-success/10",
        text: `Paiement reçu: ${t.amount} - ${t.reference}`,
        time: formatTimeAgo(t.createdAt),
      });
    });

  // Ajouter les retraits complétés récents
  withdrawals
    .filter((w) => w.status === "completed")
    .slice(0, 2)
    .forEach((w) => {
      activitiesList.push({
        id: `withdrawal-${w._id}`,
        icon: "heroicons:arrow-down-tray-20-solid",
        color: "text-primary bg-primary/10",
        text: `Retrait: ${w.amount} - ${w.reference}`,
        time: formatTimeAgo(w.createdAt),
      });
    });

  // Ajouter les transactions échouées
  transactions
    .filter((t) => t.status === "failed")
    .slice(0, 2)
    .forEach((t) => {
      activitiesList.push({
        id: `failed-${t._id}`,
        icon: "heroicons:exclamation-triangle-20-solid",
        color: "text-red-500 bg-red-500/10",
        text: `Transaction échouée: ${t.reference}`,
        time: formatTimeAgo(t.createdAt),
      });
    });

  return activitiesList.slice(0, 5);
}

/**
 * Formate le temps écoulé en texte lisible
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return "À l'instant";
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)}j`;

  return new Date(date).toLocaleDateString("fr-FR");
}

/**
 * Crée une nouvelle dépense (Withdraw pour client, WithdrawAdmin pour admin)
 */
export async function createWithdrawal(
  userId: string,
  role: "admin" | "client",
  amount: number,
  phone: string,
  reference: string,
  description: string,
): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    await connectDB();

    const userId_ObjectId = new mongoose.Types.ObjectId(userId);

    // Vérifier que le solde est suffisant
    const dashboardData = await getDashboardData(userId, role);

    if (dashboardData.balance < amount) {
      return {
        success: false,
        message: "Solde insuffisant pour effectuer ce retrait",
      };
    }

    if (role === "client") {
      // Récupérer l'account du client
      const account = await Account.findOne({
        clientId: userId_ObjectId,
      });

      if (!account) {
        return {
          success: false,
          message: "Account non trouvé",
        };
      }

      // Créer le Withdraw
      const orderNumber = `WD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const withdraw = await Withdraw.create({
        accountId: account._id,
        amount,
        phone,
        orderNumber,
        reference,
        description,
        status: "pending",
      });

      return {
        success: true,
        message: "Retrait créé avec succès",
        data: withdraw,
      };
    }

    if (role === "admin") {
      // Créer le WithdrawAdmin
      const orderNumber = `WDA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const withdrawAdmin = await WithdrawAdmin.create({
        adminId: userId_ObjectId,
        amount,
        phone,
        orderNumber,
        reference,
        description,
        status: "pending",
      });

      return {
        success: true,
        message: "Retrait admin créé avec succès",
        data: withdrawAdmin,
      };
    }

    return {
      success: false,
      message: "Rôle utilisateur invalide",
    };
  } catch (error) {
    console.error("Erreur lors de la création du retrait:", error);
    return {
      success: false,
      message: "Erreur lors de la création du retrait",
    };
  }
}
