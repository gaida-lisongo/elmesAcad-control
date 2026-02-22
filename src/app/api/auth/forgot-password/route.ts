import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Admin, Client } from "@/utils/models";
import { mailService } from "@/utils/mail/MailService";

const Schema = z.object({
  email: z.string().email(),
});

function generatePassword(length = 10): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

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

    const user =
      (await Admin.findOne({ email })) ?? (await Client.findOne({ email }));

    if (!user) {
      // Anti-énumération : toujours 200
      return NextResponse.json({ ok: true });
    }

    const newPassword = generatePassword();
    user.motDePasse = await bcrypt.hash(newPassword, 12);
    await user.save();

    try {
      await mailService.sendMail({
        to: email,
        subject: "Récupération de votre compte",
        text: `Bonjour ${user.nomComplet},\n\nVotre nouveau mot de passe temporaire est :\n\n${newPassword}\n\nConnectez-vous et changez-le dès que possible.\n`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:auto">
            <h2 style="color:#ee7b11">Récupération de compte</h2>
            <p>Bonjour <strong>${user.nomComplet}</strong>,</p>
            <p>Votre nouveau mot de passe temporaire est :</p>
            <div style="margin:20px 0;padding:16px 24px;background:#f4f7ff;border-radius:8px;font-size:22px;font-weight:700;letter-spacing:2px;text-align:center">
              ${newPassword}
            </div>
            <p>Connectez-vous avec ce mot de passe et changez-le dès que possible depuis votre profil.</p>
            <p style="color:#888;font-size:13px">Si vous n'êtes pas à l'origine de cette demande, contactez l'administrateur immédiatement.</p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error("[forgot-password] mail error:", mailErr);
      console.info(
        `[forgot-password] nouveau mot de passe (fallback dev): ${newPassword}`,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

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
