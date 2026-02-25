"use server";

import { connectDB } from "@/lib/db";
import { Withdraw, Account, Client } from "@/utils/models";
import mongoose from "mongoose";

/**
 * Récupère toutes les withdraws avec populate des relations
 */
export async function getAllWithdraws(
  status?: "pending" | "completed" | "failed",
  limit: number = 50,
): Promise<any[]> {
  try {
    await connectDB();

    const query = status ? { status } : {};

    const withdraws = await Withdraw.find(query)
      .populate({
        path: "accountId",
        populate: [
          {
            path: "clientId",
            select: "nomComplet email photoUrl logo isActive createdAt",
          },
          {
            path: "packageId",
            select: "titre prix",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return JSON.parse(JSON.stringify(withdraws));
  } catch (error) {
    console.error("Erreur lors de la récupération des withdraws:", error);
    return [];
  }
}

/**
 * Récupère les statistiques des withdraws
 */
export async function getWithdrawsStats(): Promise<{
  totalPending: number;
  totalCompleted: number;
  totalAmount: number;
  pendingAmount: number;
}> {
  try {
    await connectDB();

    const [pending, completed, totalAmountResult, pendingAmountResult] =
      await Promise.all([
        Withdraw.countDocuments({ status: "pending" }),
        Withdraw.countDocuments({ status: "completed" }),
        Withdraw.aggregate([
          { $match: {} },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Withdraw.aggregate([
          { $match: { status: "pending" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

    return {
      totalPending: pending,
      totalCompleted: completed,
      totalAmount: totalAmountResult[0]?.total || 0,
      pendingAmount: pendingAmountResult[0]?.total || 0,
    };
  } catch (error) {
    console.error("Erreur lors du calcul des stats:", error);
    return {
      totalPending: 0,
      totalCompleted: 0,
      totalAmount: 0,
      pendingAmount: 0,
    };
  }
}

/**
 * Valide un withdraw (génère facture et envoie email)
 */
export async function validateWithdraw(
  withdrawId: string,
  orderNumber?: string,
  reference?: string,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await connectDB();

    const withdrawId_ObjectId = new mongoose.Types.ObjectId(withdrawId);

    // Récupérer le withdraw avec toutes les infos
    const withdraw = await Withdraw.findById(withdrawId_ObjectId)
      .populate({
        path: "accountId",
        populate: [
          {
            path: "clientId",
            select: "nomComplet email photoUrl logo",
          },
          {
            path: "packageId",
            select: "titre prix",
          },
        ],
      })
      .lean();

    if (!withdraw) {
      return {
        success: false,
        message: "Retrait non trouvé",
      };
    }

    if (withdraw.status === "completed") {
      return {
        success: false,
        message: "Ce retrait a déjà été validé",
      };
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      status: "completed",
    };

    if (orderNumber) updateData.orderNumber = orderNumber;
    if (reference) updateData.reference = reference;

    // Mettre à jour le withdraw
    await Withdraw.findByIdAndUpdate(withdrawId_ObjectId, updateData, {
      new: true,
    });

    // Générer la facture (format texte temporaire)
    const { generateInvoicePdf } = await import("@/utils/pdf/invoiceGenerator");
    const pdfBuffer = await generateInvoicePdf({
      withdraw: withdraw,
      client: (withdraw as any).accountId.clientId,
      package: (withdraw as any).accountId.packageId,
    });

    // Envoyer l'email avec la facture
    const { mailService } = await import("@/utils/mail/MailService");
    await mailService.sendMail({
      to: (withdraw as any).accountId.clientId.email,
      subject: `Confirmation de retrait - ${withdraw.reference}`,
      text: `Bonjour ${(withdraw as any).accountId.clientId.nomComplet},\n\nVotre retrait de ${withdraw.amount}$ a été validé.\n\nVeuillez trouver votre facture en pièce jointe.\n\nCordialement,\nL'équipe ElmesAcad`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333;">Retrait validé</h2>
          <p style="color: #666;">Bonjour <strong>${(withdraw as any).accountId.clientId.nomComplet}</strong>,</p>
          <p style="color: #666; line-height: 1.6;">
            Votre demande de retrait a été validée avec succès.
          </p>
          
          <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Détails du retrait:</h3>
            <p style="color: #666;">
              <strong>Montant:</strong> ${withdraw.amount}$<br>
              <strong>Référence:</strong> ${withdraw.reference}<br>
              <strong>Numéro de téléphone:</strong> ${withdraw.phone}
            </p>
          </div>

          <p style="color: #666; line-height: 1.6;">
            Veuillez trouver votre facture en pièce jointe.
          </p>

          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
            Si vous avez des questions, n'hésitez pas à nous contacter.
          </p>

          <p style="color: #999; font-size: 12px;">
            <strong>ElmesAcad Support</strong>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `facture-${withdraw.reference}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    return {
      success: true,
      message: "Retrait validé et facture envoyée avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la validation du retrait:", error);
    return {
      success: false,
      message: "Erreur lors de la validation du retrait",
    };
  }
}
