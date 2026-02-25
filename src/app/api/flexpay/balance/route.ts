import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/utils/payment/factory";

/**
 * GET /api/flexpay/balance
 * Vérifie le solde disponible pour les retraits FlexPay
 */
export async function GET(request: NextRequest) {
  try {
    const flexPay = getPaymentProvider("flexpay");
    const result = await flexPay.balance();
    console.log("💰 Solde FlexPay:", result);

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        data: result.data,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ Erreur GET /api/flexpay/balance:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la récupération du solde",
      },
      { status: 500 },
    );
  }
}
