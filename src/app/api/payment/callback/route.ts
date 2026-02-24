import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CommandePackage } from "@/utils/models";
import { activateClientAfterPayment } from "@/lib/actions/home/checkout-actions";
import mongoose from "mongoose";

/**
 * POST /api/payment/callback
 * Reçoit le callback de FlexPay après un paiement
 * FlexPay envoie les données du paiement pour confirmation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("📨 Callback reçu de FlexPay:", body);

    // Extraire les données du callback
    const { orderNumber, status, reference, transactionId, message } = body;

    // Validation basique
    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "orderNumber manquant" },
        { status: 400 },
      );
    }

    await connectDB();

    // Trouver la commande
    const commande =
      await CommandePackage.findById(orderNumber).populate("userId");

    if (!commande) {
      console.error("❌ Commande non trouvée:", orderNumber);
      return NextResponse.json(
        { success: false, error: "Commande non trouvée" },
        { status: 404 },
      );
    }

    // Vérifier le statut du paiement
    if (status === "0" || status === "SUCCESS" || status === "completed") {
      // ✅ Paiement réussi
      console.log("✅ Paiement confirmé pour:", orderNumber);

      // Mettre à jour la commande
      commande.status = "completed";
      commande.orderNumber = transactionId || orderNumber;
      await commande.save();

      // Activer le client et envoyer l'email
      const user = commande.userId as any;

      // Générer un mot de passe temporaire pour l'email
      // En production, il devrait être stocké lors de la création du client
      const tempPassword = Math.random().toString(36).substring(2, 12);

      if (user && user._id) {
        try {
          await activateClientAfterPayment(user._id.toString(), tempPassword);
        } catch (emailError) {
          console.error("⚠️ Erreur envoi email:", emailError);
          // Ne pas bloquer si l'email échoue
        }
      }

      return NextResponse.json(
        {
          success: true,
          message: "Paiement confirmé et compte activé",
          orderNumber,
          transactionId,
        },
        { status: 200 },
      );
    } else if (status === "1" || status === "FAILED" || status === "failed") {
      // ❌ Paiement échoué
      console.log("❌ Paiement échoué pour:", orderNumber);

      commande.status = "failed";
      await commande.save();

      return NextResponse.json(
        {
          success: false,
          message: "Paiement échoué",
          orderNumber,
          details: message,
        },
        { status: 200 },
      );
    } else if (status === "2" || status === "PENDING" || status === "pending") {
      // ⏳ Paiement en attente
      console.log("⏳ Paiement en attente pour:", orderNumber);

      commande.status = "pending";
      await commande.save();

      return NextResponse.json(
        {
          success: true,
          message: "Paiement en attente de confirmation",
          orderNumber,
        },
        { status: 200 },
      );
    } else {
      // Statut inconnu
      console.warn("⚠️ Statut de paiement inconnu:", status);

      return NextResponse.json(
        {
          success: false,
          message: "Statut de paiement inconnu",
          orderNumber,
          status,
        },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error("❌ Erreur traitement callback:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur interne du serveur",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/payment/callback
 * Simple health check pour tester que l'endpoint est actif
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      message: "Callback endpoint actif",
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
