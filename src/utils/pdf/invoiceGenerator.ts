import { jsPDF } from "jspdf";

interface InvoiceData {
  withdraw: any;
  client: any;
  package: any;
}

/**
 * Génère une facture PDF professionnelle pour un retrait validé
 */
export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const { withdraw, client, package: pkg } = data;

  const currentDate = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const withdrawDate = new Date(withdraw.createdAt).toLocaleDateString(
    "fr-FR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  // Créer un nouveau document PDF
  const doc = new jsPDF();

  // Couleurs
  const primaryColor = "#1e3a8a"; // Bleu foncé
  const secondaryColor = "#64748b"; // Gris
  const accentColor = "#3b82f6"; // Bleu clair

  // === EN-TÊTE ===
  doc.setFillColor(30, 58, 138); // primaryColor
  doc.rect(0, 0, 210, 40, "F");

  // Logo/Nom de l'entreprise
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("SAASCANDY", 20, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Control Plane Services", 20, 28);

  // Titre FACTURE
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURE", 150, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`#${withdraw.reference}`, 150, 28);

  // === INFORMATIONS CLIENT ===
  doc.setTextColor(0, 0, 0);
  let yPos = 55;

  // Section "FACTURÉ À"
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // secondaryColor
  doc.setFont("helvetica", "bold");
  doc.text("FACTURÉ À", 20, yPos);

  yPos += 8;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(client.nomComplet, 20, yPos);

  yPos += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(client.email, 20, yPos);

  yPos += 6;
  doc.text(`Package: ${pkg.titre}`, 20, yPos);

  // Section "DÉTAILS" (à droite)
  yPos = 55;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DÉTAILS", 150, yPos);

  yPos += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Date de retrait: ${withdrawDate}`, 150, yPos);

  yPos += 5;
  doc.text(`Date de validation: ${currentDate}`, 150, yPos);

  yPos += 5;
  doc.text(`Téléphone: ${withdraw.phone}`, 150, yPos);

  // === LIGNE DE SÉPARATION ===
  yPos = 95;
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);

  // === TABLEAU DES SERVICES ===
  yPos += 10;

  // En-tête du tableau
  doc.setFillColor(241, 245, 249); // Gris clair
  doc.rect(20, yPos, 170, 10, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("DESCRIPTION", 25, yPos + 7);
  doc.text("RÉFÉRENCE", 110, yPos + 7);
  doc.text("MONTANT", 165, yPos + 7);

  // Ligne du service
  yPos += 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Retrait validé", 25, yPos);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const description = withdraw.description || "Retrait des fonds disponibles";
  const descLines = doc.splitTextToSize(description, 70);
  doc.text(descLines, 25, yPos + 5);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(withdraw.orderNumber || "-", 110, yPos + 2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`$${withdraw.amount.toFixed(2)}`, 165, yPos + 2);

  // === TOTAL ===
  yPos += 25;
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);

  yPos += 10;
  doc.setFillColor(248, 250, 252);
  doc.rect(120, yPos - 5, 70, 12, "F");

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(1);
  doc.rect(120, yPos - 5, 70, 12, "S");

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text("TOTAL", 125, yPos + 3);

  doc.setFontSize(15);
  doc.text(`$${withdraw.amount.toFixed(2)}`, 165, yPos + 3);

  // === PIED DE PAGE ===
  yPos = 260;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Merci pour votre confiance!", 20, yPos);

  yPos += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Cette facture confirme la validation de votre retrait.", 20, yPos);

  // Contact
  doc.setFontSize(9);
  doc.setTextColor(59, 130, 246); // accentColor
  doc.text("Contact: support@saascandy.com", 150, yPos);

  // Convertir le PDF en Buffer
  const pdfOutput = doc.output("arraybuffer");
  return Buffer.from(pdfOutput);
}
