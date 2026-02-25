import { ServicePay } from "../base";
import type {
  DepositArgsFlexPay,
  WithdrawArgsFlexPay,
  PayResult,
} from "../types";

class FlexPayService extends ServicePay {
  private apiHost = process.env.FLEX_HOST!;
  private apiOutHost = process.env.FLEX_OUT_HOST!;
  private apiCheckOutHost = process.env.FLEX_OUT_CHECK!;
  private apiOutAuth = process.env.FLEX_OUT_AUTH!;
  private checkEndpoint = process.env.FLEX_CHECK!;
  private cardEndpoint = process.env.FLEX_CARD!;
  private token = process.env.FLEX_TOKEN!; // IN token (card/momo)
  private merchant = process.env.FLEX_MERCHANT!;
  private merchantOut = process.env.FLEX_OUT_MERCHANT!;
  private callbackUrl = process.env.FLEX_CALLBACK_URL!;

  // payout token (comme ton code)
  private tokenOut = "";
  private tokenExpiration: number | null = null;

  constructor() {
    super();

    const required = [
      this.apiHost,
      this.apiOutHost,
      this.apiCheckOutHost,
      this.apiOutAuth,
      this.checkEndpoint,
      this.cardEndpoint,
      this.token,
      this.merchant,
      this.merchantOut,
      this.callbackUrl,
    ];

    console.log("FlexPay config:", required);
    if (required.some((v) => !v)) throw new Error("FlexPay env vars missing");
  }

  private isTokenValid() {
    if (!this.tokenOut || !this.tokenExpiration) return false;
    return this.tokenExpiration - Date.now() > 30000;
  }

  private async authenticate() {
    const userName = process.env.FLEX_OUT_USERNAME!;
    const password = process.env.FLEX_OUT_PASSWORD!;
    if (!userName || !password)
      throw new Error("FlexPay payout credentials missing");

    const res = await fetch(this.apiOutAuth, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: userName, password }),
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`FlexPay auth failed: HTTP ${res.status}`);
    const json = await res.json();

    if (json?.code !== "0" || !json?.token) {
      throw new Error(`FlexPay auth failed: ${json?.message ?? "unknown"}`);
    }

    this.tokenOut = String(json.token);
    const expirationSeconds = json.expire_in || 3600;
    this.tokenExpiration = Date.now() + expirationSeconds * 1000;
  }

  private async ensureValidToken() {
    if (!this.isTokenValid()) await this.authenticate();
  }

  async deposit(args: DepositArgsFlexPay): Promise<PayResult> {
    // ton code choisit CARD vs MOMO via prefix reference :contentReference[oaicite:8]{index=8}
    if (args.reference.startsWith("CARD_")) {
      const payload = {
        authorization: this.token,
        merchant: this.merchant,
        reference: args.reference,
        amount: args.amount,
        currency: args.currency,
        language: "FR",
        description: "Paiement par carte via FlexPay",
        callback_url: this.callbackUrl,
        approve_url: this.callbackUrl,
        cancel_url: this.callbackUrl,
        decline_url: this.callbackUrl,
      };

      const res = await fetch(this.cardEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token.split(" ")[1]}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      if (!res.ok)
        throw new Error(`FlexPay card deposit failed: HTTP ${res.status}`);
      const json = await res.json();

      return {
        success: json?.code === "0",
        message: json?.message ?? "FlexPay card deposit",
        data: { orderNumber: json?.orderNumber, url: json?.url },
      };
    }

    // mobile money
    if (!args.phone) throw new Error("FlexPay mobile deposit requires phone");

    let phone = args.phone;
    if (phone.length > 9) phone = phone.slice(-9);
    phone = "243" + phone;

    const payload = {
      merchant: this.merchant,
      type: "1",
      phone,
      reference: args.reference,
      amount: args.amount,
      currency: args.currency,
      callbackUrl: this.callbackUrl,
    };

    const res = await fetch(this.apiHost, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token.split(" ")[1]}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok)
      throw new Error(`FlexPay mobile deposit failed: HTTP ${res.status}`);
    const json = await res.json();

    return {
      success: json?.code === "0",
      message: json?.message ?? "FlexPay mobile deposit",
      data: { orderNumber: json?.orderNumber },
    };
  }

  async check(args: { orderNumber: string }): Promise<PayResult> {
    const url = `${this.checkEndpoint}check/${args.orderNumber}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token.split(" ")[1]}`,
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`FlexPay check failed: HTTP ${res.status}`);
    const json = await res.json();

    return {
      success: json?.code === "0",
      message: json?.message ?? "FlexPay check",
      data: json?.transaction,
    };
  }

  async withdraw(args: WithdrawArgsFlexPay): Promise<PayResult> {
    await this.ensureValidToken();

    let phone = args.phone;
    if (phone.length > 9) phone = phone.slice(-9);
    phone = "243" + phone;

    const payload = {
      merchant: this.merchantOut,
      type: "1",
      reference: args.reference,
      amount: args.amount,
      currency: args.currency,
      customer: phone,
      description: `Retrait pour le numéro ${phone}`,
      callback_url: this.callbackUrl,
    };

    const res = await fetch(this.apiOutHost, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.tokenOut}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`FlexPay withdraw failed: HTTP ${res.status}`);
    const json = await res.json();

    return {
      success: json?.code === "0",
      message: json?.message ?? "FlexPay withdraw",
      data: { orderNumber: json?.orderNumber, status: json?.status },
    };
  }

  async balance(): Promise<any> {
    try {
      await this.ensureValidToken();
      // console.log("🔐 FlexPay payout token", this.tokenOut);
      console.log(
        "🔐 FlexPay payout token valid, checking balance...",
        this.apiCheckOutHost + "/balance/" + this.merchantOut,
      );
      const res = await fetch(
        this.apiCheckOutHost + "/balance/" + this.merchantOut,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.tokenOut}`,
          },
          cache: "no-store",
        },
      );

      if (!res.ok) {
        throw new Error(`FlexPay balance check failed: HTTP ${res.status}`);
      }

      const json = await res.json();
      return {
        success: json?.code === "0",
        message: json?.message ?? "FlexPay balance",
        data: json?.balances,
      };
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la récupération du solde FlexPay:",
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// ✅ singleton module-scope
let flexpaySingleton: FlexPayService | null = null;
export function getFlexPayService() {
  if (!flexpaySingleton) flexpaySingleton = new FlexPayService();
  return flexpaySingleton;
}
