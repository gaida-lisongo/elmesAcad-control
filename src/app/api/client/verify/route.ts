import { NextRequest, NextResponse } from "next/server";
import { connectDB as connectToDatabase } from "@/lib/db";
import { Client, Account } from "@/utils/models";

export async function POST(request: NextRequest) {
  try {
    const { uuid } = await request.json();

    if (!uuid) {
      return NextResponse.json(
        { success: false, message: "UUID requis" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const account = await Account.find()
      .populate("packageId")
      .populate("clientId", "nomComplet email logo uuid isActive")
      // .where("clientId.uuid")
      // .equals(uuid)
      // .where("clientId.isActive")
      // .equals(true)
      .lean();

    const client = account.find(
      (acc) => acc.clientId?.uuid === uuid && acc.clientId?.isActive,
    );

    console.log("Résultat de la requête:", client);

    if (!client) {
      return NextResponse.json(
        { success: false, message: "Client non trouvé ou inactif" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        nomComplet: client.clientId.nomComplet,
        email: client.clientId.email,
        logo: client.clientId.logo,
        uuid: client.packageId ? client.packageId.titre : "N/A",
        quotite: client.quotite * 100 + "%",
        clientComplete: client,
      },
    });
  } catch (error) {
    console.error("Erreur vérification client:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 },
    );
  }
}
