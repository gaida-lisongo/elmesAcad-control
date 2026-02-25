"use server";

import { connectDB } from "@/lib/db";
import { FAQPackage } from "@/utils/models";

// FAQ Package Actions
export async function getFAQByPackage(packageId: string) {
  try {
    await connectDB();
    const faq = await FAQPackage.findOne({ packageId }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(faq)) };
  } catch (error) {
    console.error("Erreur getFAQByPackage:", error);
    return { success: false, data: null };
  }
}

export async function createOrUpdateFAQ(
  packageId: string,
  faqItems: { question: string; answer: string }[],
) {
  try {
    await connectDB();
    const existing = await FAQPackage.findOne({ packageId });

    if (existing) {
      existing.faqItems = faqItems;
      await existing.save();
      return { success: true, data: JSON.parse(JSON.stringify(existing)) };
    } else {
      const newFAQ = await FAQPackage.create({ packageId, faqItems });
      return { success: true, data: JSON.parse(JSON.stringify(newFAQ)) };
    }
  } catch (error) {
    console.error("Erreur createOrUpdateFAQ:", error);
    return { success: false, message: "Erreur lors de la sauvegarde" };
  }
}

export async function deleteFAQItem(packageId: string, questionIndex: number) {
  try {
    await connectDB();
    const faq = await FAQPackage.findOne({ packageId });
    if (!faq) {
      return { success: false, message: "FAQ non trouvée" };
    }

    faq.faqItems.splice(questionIndex, 1);
    await faq.save();
    return { success: true };
  } catch (error) {
    console.error("Erreur deleteFAQItem:", error);
    return { success: false, message: "Erreur lors de la suppression" };
  }
}

export async function getClients() {
  try {
    await connectDB();
    const { Client } = await import("@/utils/models/User");
    const clients = await Client.find({ role: "client", isActive: true })
      .select("nomComplet logo")
      .lean();
    return { success: true, data: JSON.parse(JSON.stringify(clients)) };
  } catch (error) {
    console.error("Erreur getClients:", error);
    return { success: false, data: [] };
  }
}
