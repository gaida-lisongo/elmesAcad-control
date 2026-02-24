import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Admin, Client } from "@/utils/models";
import { mailService } from "@/utils/mail/MailService";
import crypto from "crypto";

const Schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Adresse email invalide." },
        { status: 422 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    await connectDB();

    // Check if user exists (admin or client)
    const admin = await Admin.findOne({ email });
    const client = !admin ? await Client.findOne({ email }) : null;

    if (!admin && !client) {
      // Return 200 to avoid user enumeration
      return NextResponse.json({ ok: true });
    }

    const user = (admin ?? client)!;
    const nomComplet = user.nomComplet;

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1h
    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const baseUrl =
      process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
      `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const resetUrl = `${baseUrl}/reinitialiser-mot-de-passe?token=${token}&email=${encodeURIComponent(email)}`;

    try {
      await mailService.sendMail({
        to: email,
        subject: "Récupération de votre compte",
        text: `Bonjour ${nomComplet},\n\nCliquez sur le lien suivant pour réinitialiser votre mot de passe :\n${resetUrl}\n\nCe lien est valable 1 heure.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`,
        html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto">
          <h2 style="color:#ee7b11">Récupération de compte</h2>
          <p>Bonjour <strong>${nomComplet}</strong>,</p>
          <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe&nbsp;:</p>
          <a href="${resetUrl}"
             style="display:inline-block;margin:16px 0;padding:12px 24px;background:#ee7b11;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
            Réinitialiser mon mot de passe
          </a>
          <p style="color:#888;font-size:13px">Ce lien expire dans 1&nbsp;heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
        </div>
      `,
      });
    } catch (mailErr) {
      // Si l'envoi échoue, on log le lien en console (fallback dev)
      // et on retourne quand même 200 pour ne pas bloquer l'utilisateur
      console.error("[forgot-password] mail error:", mailErr);
      console.info(`[forgot-password] reset URL (fallback): ${resetUrl}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[forgot-password]", err);
    return NextResponse.json(
      { error: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 },
    );
  }
}
