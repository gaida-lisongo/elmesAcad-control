import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Client } from "@/utils/models";

export async function POST(request: NextRequest) {
  try {
    const { uuid } = await request.json();

    if (!uuid) {
      return NextResponse.json(
        { success: false, message: "UUID requis" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const client = await Client.findOne({ uuid, isActive: true }).select(
      "nomComplet email logo uuid quotite isActive"
    );

    if (!client) {
      return NextResponse.json(
        { success: false, message: "Ce client n'a pas encore un compte actif" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        nomComplet: client.nomComplet,
        email: client.email,
        logo: client.logo,
        uuid: client.uuid,
        quotite: client.quotite,
      },
    });
  } catch (error) {
    console.error("Erreur vérification client:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
