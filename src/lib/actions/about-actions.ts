"use server";

import { connectDB } from "@/lib/db";
import { WhyUs, Matricule, Admin } from "@/utils/models";

// WhyUs Actions
export async function getWhyUs() {
  try {
    await connectDB();
    const items = await WhyUs.find().sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(items)) };
  } catch (error) {
    console.error("Erreur getWhyUs:", error);
    return { success: false, data: [] };
  }
}

export async function createWhyUs(titre: string, description: string) {
  try {
    await connectDB();
    const newItem = await WhyUs.create({ titre, description });
    return { success: true, data: JSON.parse(JSON.stringify(newItem)) };
  } catch (error) {
    console.error("Erreur createWhyUs:", error);
    return { success: false, message: "Erreur lors de la création" };
  }
}

export async function deleteWhyUs(id: string) {
  try {
    await connectDB();
    await WhyUs.findByIdAndDelete(id);
    return { success: true };
  } catch (error) {
    console.error("Erreur deleteWhyUs:", error);
    return { success: false, message: "Erreur lors de la suppression" };
  }
}

// Matricule Actions
export async function getMatricules() {
  try {
    await connectDB();
    const items = await Matricule.find().sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(items)) };
  } catch (error) {
    console.error("Erreur getMatricules:", error);
    return { success: false, data: [] };
  }
}

export async function createMatricule(designation: string, value: string) {
  try {
    await connectDB();
    const newItem = await Matricule.create({ designation, value });
    return { success: true, data: JSON.parse(JSON.stringify(newItem)) };
  } catch (error) {
    console.error("Erreur createMatricule:", error);
    return { success: false, message: "Erreur lors de la création" };
  }
}

export async function deleteMatricule(id: string) {
  try {
    await connectDB();
    await Matricule.findByIdAndDelete(id);
    return { success: true };
  } catch (error) {
    console.error("Erreur deleteMatricule:", error);
    return { success: false, message: "Erreur lors de la suppression" };
  }
}

// Teams Actions (Admins)
export async function getAdmins() {
  try {
    await connectDB();
    const admins = await Admin.find({ role: "admin" })
      .select("nomComplet email photoUrl createdAt")
      .lean();
    return { success: true, data: JSON.parse(JSON.stringify(admins)) };
  } catch (error) {
    console.error("Erreur getAdmins:", error);
    return { success: false, data: [] };
  }
}
