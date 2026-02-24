import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CommandeProduct, Client } from "@/utils/models";
import crypto from "crypto";

/**
 * Helper: Verify API credentials
 * Compares the provided apiKey and apiSecret with the client's stored credentials
 */
async function verifyApiCredentials(
  apiKey: string,
  apiSecret: string,
) {
  const client = await Client.findOne({ apiKey });
  
  if (!client) {
    return { valid: false, error: "Invalid API key", clientId: null };
  }

  // Simple comparison (in production, use proper hash verification)
  if (client.apiSecret !== apiSecret) {
    return { valid: false, error: "Invalid API secret", clientId: null };
  }

  if (!client.isActive) {
    return { valid: false, error: "Client account is inactive", clientId: null };
  }

  return { valid: true, clientId: client._id };
}

/**
 * POST /api/transactions
 * Create a new CommandeProduct (called by client's platform via API)
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    const apiSecret = request.headers.get("x-api-secret");

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: "Missing API credentials (x-api-key, x-api-secret)" },
        { status: 401 },
      );
    }

    // Verify credentials
    const credCheck = await connectDB().then(() => verifyApiCredentials(apiKey, apiSecret));
    
    if (!credCheck.valid) {
      return NextResponse.json(
        { success: false, error: credCheck.error },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Validate required fields
    const { category, student, classe, amount, phone, reference, description } = body;

    if (!category || !student || !classe || amount === undefined || !phone || !reference) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: category, student, classe, amount, phone, reference",
        },
        { status: 400 },
      );
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create new CommandeProduct
    const commande = await CommandeProduct.create({
      category,
      student,
      classe,
      amount,
      orderNumber,
      phone,
      status: "pending",
      reference,
      description: description || "",
      clientId: credCheck.clientId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Commande created successfully",
        data: JSON.parse(JSON.stringify(commande)),
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("❌ Erreur POST /api/transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la création de la commande",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/transactions
 * Update an existing CommandeProduct (called by client's platform via API)
 */
export async function PUT(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    const apiSecret = request.headers.get("x-api-secret");

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: "Missing API credentials (x-api-key, x-api-secret)" },
        { status: 401 },
      );
    }

    // Verify credentials
    const credCheck = await connectDB().then(() => verifyApiCredentials(apiKey, apiSecret));
    
    if (!credCheck.valid) {
      return NextResponse.json(
        { success: false, error: credCheck.error },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Validate required fields
    const { orderNumber, status, reference } = body;

    if (!orderNumber || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: orderNumber, status",
        },
        { status: 400 },
      );
    }

    // Validate status value
    if (!["pending", "completed", "failed"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status. Must be: pending, completed, or failed",
        },
        { status: 400 },
      );
    }

    // Find and update the CommandeProduct
    const commande = await CommandeProduct.findOneAndUpdate(
      {
        orderNumber,
        clientId: credCheck.clientId,
      },
      {
        status,
        reference: reference || undefined,
      },
      { new: true },
    );

    if (!commande) {
      return NextResponse.json(
        { success: false, error: "Commande not found or does not belong to this client" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Commande updated successfully",
        data: JSON.parse(JSON.stringify(commande)),
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ Erreur PUT /api/transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la mise à jour de la commande",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/transactions
 * Retrieve all CommandeProducts for the authenticated client
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    const apiSecret = request.headers.get("x-api-secret");
    const searchParams = request.nextUrl.searchParams;
    const orderNumber = searchParams.get("orderNumber");
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    // If API credentials provided, use them (external access)
    if (apiKey && apiSecret) {
      const credCheck = await connectDB().then(() => verifyApiCredentials(apiKey, apiSecret));
      
      if (!credCheck.valid) {
        return NextResponse.json(
          { success: false, error: credCheck.error },
          { status: 403 },
        );
      }

      // Build query
      let query: any = { clientId: credCheck.clientId };
      if (orderNumber) query.orderNumber = orderNumber;
      if (status) query.status = status;
      if (category) query.category = category;

      const commandes = await CommandeProduct.find(query)
        .lean()
        .sort({ createdAt: -1 });

      return NextResponse.json(
        {
          success: true,
          data: JSON.parse(JSON.stringify(commandes)),
        },
        { status: 200 },
      );
    }

    // No credentials provided
    return NextResponse.json(
      { success: false, error: "Authentication required. Provide x-api-key and x-api-secret headers." },
      { status: 401 },
    );
  } catch (error: any) {
    console.error("❌ Erreur GET /api/transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la récupération des commandes",
      },
      { status: 500 },
    );
  }
}
