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
}

export const mailService = MailService.getInstance();
