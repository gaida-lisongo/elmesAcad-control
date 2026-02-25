"use server";

import { connectDB } from "@/lib/db";
import { Contact } from "@/utils/models";
import { cloudinaryService } from "@/utils/storage/CloudinaryService";
import { megaService } from "@/utils/storage/MegaService";

export async function getContact() {
  try {
    await connectDB();
    const contact = await Contact.findOne().lean();
    return contact ? JSON.parse(JSON.stringify(contact)) : null;
  } catch (error) {
    console.error("Erreur lors de la récupération du contact:", error);
    return null;
  }
}

export async function updateContact(data: {
  email: string;
  adresse: string;
  photoUrl: string;
  mission: string;
  telephones: {
    service: string;
    mission: string;
    email: string;
    phone: string;
  }[];
}) {
  try {
    await connectDB();

    const contact = await Contact.findOne();

    if (contact) {
      Object.assign(contact, data);
      await contact.save();
    } else {
      await Contact.create(data);
    }

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du contact:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function uploadContactPhoto(fileBase64: string) {
  try {
    const buffer = Buffer.from(fileBase64.split(",")[1], "base64");
    const result = await cloudinaryService.uploadBuffer(buffer, {
      folder: "contact-info",
    });
    return { success: true, photoUrl: result.secure_url };
  } catch (error) {
    console.error("Erreur upload photo:", error);
    return { success: false, error: "Erreur lors de l'upload" };
  }
}

export async function uploadContactFile(file: Buffer, fileName: string) {
  try {
    const result = await megaService.uploadBuffer(fileName, file);
    const link = await megaService.getLink(result);

    return { success: true, fileUrl: link };
  } catch (error) {
    console.error("Erreur upload fichier:", error);
    return { success: false, error: "Erreur lors de l'upload du fichier" };
  }
}

export async function sendContactEmail(data: {
  name: string;
  projectname: string;
  email: string;
  project: string;
  message: string;
  fileUrl?: string;
}) {
  try {
    const { mailService } = await import("@/utils/mail/MailService");

    await mailService.sendMail({
      to: "nathan@elmes-solution.site",
      subject: `Nouveau contact: ${data.projectname}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a8a;">Nouveau message de contact</h2>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nom:</strong> ${data.name}</p>
            <p><strong>Nom du projet:</strong> ${data.projectname}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Type de projet:</strong> ${data.project}</p>
            ${data.fileUrl ? `<p><strong>Fichier joint:</strong> <a href="${data.fileUrl}" target="_blank">Télécharger</a></p>` : ""}
          </div>

          <div style="background-color: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
            <h3 style="color: #1e3a8a;">Message:</h3>
            <p style="white-space: pre-wrap;">${data.message}</p>
          </div>
        </div>
      `,
      text: `
        Nouveau message de contact
        
        Nom: ${data.name}
        Nom du projet: ${data.projectname}
        Email: ${data.email}
        Type de projet: ${data.project}
        ${data.fileUrl ? `Fichier: ${data.fileUrl}` : ""}
        
        Message:
        ${data.message}
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return { success: false, error: "Erreur lors de l'envoi de l'email" };
  }
}
