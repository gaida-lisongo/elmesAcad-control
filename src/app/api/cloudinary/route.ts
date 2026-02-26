import { NextRequest, NextResponse } from "next/server";
import { cloudinaryService } from "@/utils/storage/CloudinaryService";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file format (jpg, png, webp, gif)." },
        { status: 400 },
      );
    }

    const result = await cloudinaryService.uploadFile(
      file,
      "ent-control-plane/uploads",
    );

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      fileName: file.name,
      size: file.size,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Upload failed" },
      { status: 500 },
    );
  }
}
