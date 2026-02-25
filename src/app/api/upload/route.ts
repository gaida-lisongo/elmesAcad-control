import { NextRequest, NextResponse } from "next/server";
import { Client } from "@/utils/models/User";
import { megaService } from "@/utils/storage/MegaService";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const apiKey = formData.get("apiKey") as string;
    const apiSecret = formData.get("apiSecret") as string;

    if (!file || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Missing file, apiKey or apiSecret" },
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

    const uploadedFile = await megaService.uploadFile(file);
    const fileUrl = await megaService.getLink(uploadedFile);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      size: file.size,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 },
    );
  }
}
