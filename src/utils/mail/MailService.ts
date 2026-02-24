import nodemailer from "nodemailer";

class MailService {
  private static instance: MailService;
  private transporter: nodemailer.Transporter | null = null;

  private constructor() {}

  static getInstance() {
    if (!MailService.instance) {
      MailService.instance = new MailService();
    }
    return MailService.instance;
  }

  /**
   * Création du transporteur SMTP (singleton)
   */
  private getTransporter(): nodemailer.Transporter {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
      throw new Error("Missing SMTP environment variables");
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true = SSL implicite (port 465), false = STARTTLS (port 587)
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    return this.transporter;
  }

  /**
   * Envoi simple d'email
   */
  async sendMail(params: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }) {
    const { to, subject, text, html } = params;

    const transporter = this.getTransporter();

    try {
      const info = await transporter.sendMail({
        from: `"ESURSI-APP" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      });
      return info;
    } catch (err) {
      // Reset le transporter pour que la prochaine tentative recrée la connexion
      this.transporter = null;
      throw err;
    }
  }

  /**
   * Envoi + action post-success
   */
  async composeMail(params: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    onSuccess?: () => Promise<void>;
  }) {
    const { to, subject, text, html, onSuccess } = params;

    const result = await this.sendMail({ to, subject, text, html });

    if (onSuccess) {
      await onSuccess();
    }

    return result;
  }

  /**
   * Envoi email bienvenue avec credentials
   */
  async sendWelcomeEmail(params: {
    email: string;
    nomComplet: string;
    password: string;
    apiKey: string;
  }) {
    const { email, nomComplet, password, apiKey } = params;

    const subject = "Bienvenue sur SaasCandy - Vos accès";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333;">Bienvenue, ${nomComplet}!</h2>
        <p style="color: #666; line-height: 1.6;">Votre commande a été confirmée et votre compte a été activé sur <strong>SaasCandy</strong>.</p>
        
        <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Vos identifiants d'accès:</h3>
          <p style="color: #666;">
            <strong>Email:</strong> ${email}<br>
            <strong>Mot de passe:</strong> ${password}
          </p>
          <p style="color: #f39c12; font-weight: bold;">⚠️ Conservez ces identifiants en sécurité</p>
        </div>

        <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Clé API:</h3>
          <p style="color: #666; word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
            ${apiKey}
          </p>
        </div>

        <p style="color: #666; line-height: 1.6;">
          Pour commencer, connectez-vous à votre espace client avec les identifiants fournis ci-dessus.
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
          Si vous avez des questions, n'hésitez pas à nous contacter.
        </p>

        <p style="color: #999; font-size: 12px;">
          <strong>SaasCandy Support</strong>
        </p>
      </div>
    `;

    return this.sendMail({
      to: email,
      subject,
      text: `Bienvenue ${nomComplet}! Email: ${email}, Mot de passe: ${password}, API Key: ${apiKey}`,
      html: htmlContent,
    });
  }
}

const mailService = MailService.getInstance();

export { mailService, MailService };
