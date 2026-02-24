import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/utils/payment/factory";

/**
 * POST /api/flexpay
 * Initie un dépôt/paiement via FlexPay (MOBILE ou CARD)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { amount, phone, reference, type = "MOBILE" } = body;

    if (!amount || !reference) {
      return NextResponse.json(
        { success: false, error: "amount et reference requis" },
        { status: 400 },
      );
    }

    if (type === "MOBILE" && !phone) {
      return NextResponse.json(
        { success: false, error: "phone requis pour paiement MOBILE" },
        { status: 400 },
      );
    }

    console.log(`📤 FlexPay Deposit (${type}):`, { amount, phone, reference });

    const flexPay = getPaymentProvider("flexpay");

    const result = await flexPay.deposit({
      amount,
      currency: "USD",
      phone: phone || "",
      reference,
    });

    if (result.success) {
      console.log("✅ Dépôt FlexPay réussi:", result.data);
      return NextResponse.json(
        {
          success: true,
          message: result.message,
          data: result.data,
        },
        { status: 200 },
      );
    } else {
      console.error("❌ Dépôt FlexPay échoué:", result.message);
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 402 },
      );
    }
  } catch (error: any) {
    console.error("❌ Erreur POST /api/flexpay:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors du dépôt",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/flexpay?orderNumber=XXX
 * Vérifie le statut d'une transaction FlexPay
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "orderNumber requis" },
        { status: 400 },
      );
    }

    console.log("🔍 FlexPay Check:", { orderNumber });

    const flexPay = getPaymentProvider("flexpay");

    const result = await flexPay.check({ orderNumber });

    if (result.success) {
      console.log("✅ Statut FlexPay:", result.data);
      return NextResponse.json(
        {
          success: true,
          message: result.message,
          data: result.data,
        },
        { status: 200 },
      );
    } else {
      console.error("❌ Vérification FlexPay échouée:", result.message);
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 402 },
      );
    }
  } catch (error: any) {
    console.error("❌ Erreur GET /api/flexpay:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la vérification",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/flexpay
 * Initie un retrait/payout via FlexPay
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const { amount, phone, reference } = body;

    if (!amount || !phone || !reference) {
      return NextResponse.json(
        { success: false, error: "amount, phone et reference requis" },
        { status: 400 },
      );
    }

    console.log("📥 FlexPay Withdraw:", { amount, phone, reference });

    const flexPay = getPaymentProvider("flexpay");

    const result = await flexPay.withdraw({
      amount,
      currency: "USD",
      phone,
      reference,
    });

    if (result.success) {
      console.log("✅ Retrait FlexPay réussi:", result.data);
      return NextResponse.json(
        {
          success: true,
          message: result.message,
          data: result.data,
        },
        { status: 200 },
      );
    } else {
      console.error("❌ Retrait FlexPay échoué:", result.message);
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 402 },
      );
    }
  } catch (error: any) {
    console.error("❌ Erreur PATCH /api/flexpay:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors du retrait",
      },
      { status: 500 },
    );
  }
}
