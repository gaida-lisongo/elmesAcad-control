import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CommandePackage } from "@/utils/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/commandes
 * Récupère les commandes du client connecté
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      );
    }

    await connectDB();

    // Récupérer toutes les commandes de l'utilisateur
    const commandes = await CommandePackage.find({
      userId: session.user.id,
    })
      .populate({
        path: "packageId",
        select: "titre prix description",
      })
      .lean()
      .sort({ createdAt: -1 });

    const plainCommandes = JSON.parse(JSON.stringify(commandes));

    return NextResponse.json(
      {
        success: true,
        data: plainCommandes,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ Erreur GET /api/commandes:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la récupération des commandes",
      },
      { status: 500 },
    );
  }
}
