import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Module } from "@/utils/models";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const GET = async () => {
  try {
    await connectDB();
    const modules = await Module.find().sort({ createdAt: -1 }).lean();

    const ServicesData = (modules || []).map((mod: any) => ({
      icon: mod.icon || "solar:notebook-bookmark-linear",
      title: mod.nom,
      slug: mod.slug || slugify(mod.nom),
      image: mod.imageUrl || "/images/ServiceDetail/EdTechAppImage.png",
      description: mod.description,
      detail: mod.probleme || mod.description,
      features: (mod.features || []).map((item: string) => ({
        title: item,
        description: "",
      })),
    }));

    return NextResponse.json({ ServicesData });
  } catch (error) {
    console.error("Erreur API service:", error);
    return NextResponse.json({ ServicesData: [] }, { status: 200 });
  }
};
