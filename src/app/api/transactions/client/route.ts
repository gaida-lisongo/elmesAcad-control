import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CommandeProduct } from "@/utils/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface ICommandeProduct {
  _id: string;
  category: string;
  student: string;
  classe: string;
  amount: number;
  orderNumber: string;
  phone: string;
  status: "pending" | "completed" | "failed";
  reference: string;
  description: string;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * GET /api/transactions/client
 * Récupère les commandes de produits du client authentifié
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

    // Récupérer toutes les commandes du client
    const commandes = await CommandeProduct.find({
      clientId: session.user.id,
    })
      .lean()
      .sort({ createdAt: -1 });

    // Group by category for statistics
    const categories = Array.from(
      new Set(commandes.map((c: any) => c.category)),
    ) as string[];

    const stats = {
      totalCommandes: commandes.length,
      totalRevenu: commandes.reduce((sum: number, c: any) => sum + c.amount, 0),
      categories: categories.map((cat) => ({
        name: cat,
        count: commandes.filter((c: any) => c.category === cat).length,
        revenue: commandes
          .filter((c: any) => c.category === cat)
          .reduce((sum: number, c: any) => sum + c.amount, 0),
      })),
      byStatus: {
        pending: commandes.filter((c: any) => c.status === "pending").length,
        completed: commandes.filter((c: any) => c.status === "completed")
          .length,
        failed: commandes.filter((c: any) => c.status === "failed").length,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: JSON.parse(JSON.stringify(commandes)),
        stats,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ Erreur GET /api/transactions/client:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la récupération des commandes",
      },
      { status: 500 },
    );
  }
}
