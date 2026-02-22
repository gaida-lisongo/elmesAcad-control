import { ServicePay } from "../base";
import type {
  DepositArgsWonyaPay,
  WithdrawArgsWonyaPay,
  PayResult,
} from "../types";

export class WonyaPayService extends ServicePay {
  private apiInEndpoint = process.env.WONYAPAY_IN_API_URL!;
  private apiOutEndpoint = process.env.WONYAPAY_OUT_API_URL!;
  private apiCheckEndpoint = process.env.WONYAPAY_CHECK!;
  private caisseId = process.env.WONYAPAY_CAISSE_ID!;
  private token = process.env.WONYAPAY_TOKEN!;
  private callbackUrl = process.env.WONYAPAY_CALLBACK_URL!;

  constructor() {
    super();
    const required = [
      this.apiInEndpoint,
      this.apiOutEndpoint,
      this.apiCheckEndpoint,
      this.caisseId,
      this.token,
      this.callbackUrl,
    ];
    if (required.some((v) => !v)) throw new Error("WonyaPay env vars missing");
  }

  private generateRefTransa() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 14);
    return `A${timestamp}${random.substring(0, 12)}`.substring(0, 20);
  }

  async deposit(args: DepositArgsWonyaPay): Promise<PayResult> {
    const refTransa = this.generateRefTransa();
    const payload = {
      RefPartenaire: this.caisseId,
      callbackUrl: this.callbackUrl,
      MobileMoney: args.phone,
      Devise: args.currency,
      Montant: args.amount,
      Motif: args.motif,
      RefTransa: refTransa,
    };

    const res = await fetch(this.apiInEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`WonyaPay deposit failed: HTTP ${res.status}`);
    const json = await res.json();

    return {
      success: json?.status === 201,
      message: json?.message ?? "WonyaPay deposit",
      data: { documentId: json?.documentId, refTransa },
    };
  }

  async check(args: { orderNumber: string }): Promise<PayResult> {
    const res = await fetch(this.apiCheckEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ RefTransa: args.orderNumber }),
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`WonyaPay check failed: HTTP ${res.status}`);
    const json = await res.json();

    return {
      success: !!json?.success,
      message: "WonyaPay check",
      data: json,
    };
  }

  async withdraw(args: WithdrawArgsWonyaPay): Promise<PayResult> {
    const payload = {
      RefPartenaire: this.caisseId,
      MobileMoney: args.phone,
      Devise: args.currency,
      Montant: args.amount,
      NomBeneficiaire: args.userName,
      Motif: args.motif,
      RefTransa: this.generateRefTransa(),
    };

    const res = await fetch(this.apiOutEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`WonyaPay withdraw failed: HTTP ${res.status}: ${text}`);
    }

    const json = await res.json();
    return {
      success: json?.data?.status === "Acceptée",
      message: json?.message ?? "WonyaPay withdraw",
      data: json?.data,
    };
  }
}
