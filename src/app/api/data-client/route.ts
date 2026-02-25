import { NextRequest, NextResponse } from "next/server";
import { Client } from "@/utils/models/User";
import { Account } from "@/utils/models/Transaction";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { apiKey, apiSecret } = await req.json();

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Missing apiKey or apiSecret" },
        { status: 400 },
      );
    }

    const client = await Client.findOne({ apiKey, apiSecret });

    if (!client || !client.isActive) {
      return NextResponse.json(
        { error: "Invalid credentials or inactive client" },
        { status: 401 },
      );
    }

    const account = await Account.findOne({ clientId: client._id })
      .populate("clientId", "nomComplet email logo uuid isActive")
      .populate("packageId", "titre prix description")
      .lean();

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      account,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to retrieve data" },
      { status: 500 },
    );
  }
}
