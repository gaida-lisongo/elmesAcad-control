import { ServicePay } from "../base";
import type { DepositArgsCinetPay, PayResult, Currency } from "../types";

export class CinetPayService extends ServicePay {
  private apiKey = process.env.CINETPAY_API_KEY!;
  private apiOutEndpoint = process.env.CINETPAY_OUT!;
  private apiInEndpoint = process.env.CINETPAY_IN!;
  private siteIdCdf = process.env.CINETPAY_SITE_ID_CDF!;
  private siteIdUsd = process.env.CINETPAY_SITE_ID_USD!;
  private callbackUrl = process.env.CINETPAY_CALLBACK_URL!; // ✅ NEXT

  constructor() {
    super();
    // sécurise les env
    const required = [
      this.apiKey,
      this.apiInEndpoint,
      this.apiOutEndpoint,
      this.siteIdCdf,
      this.siteIdUsd,
      this.callbackUrl,
    ];
    if (required.some((v) => !v)) {
      throw new Error("CinetPay env vars missing");
    }
  }

  private siteId(currency: Currency) {
    return currency === "USD" ? this.siteIdUsd : this.siteIdCdf;
  }
  private alt(currency: Currency) {
    return currency === "USD" ? "CDF" : "USD";
  }

  async deposit(args: DepositArgsCinetPay): Promise<PayResult> {
    const payload: any = {
      apikey: this.apiKey,
      site_id: this.siteId(args.currency),
      alternative_currency: this.alt(args.currency),
      transaction_id: args.transactionId,
      amount: args.amount,
      currency: args.currency,
      description: args.description,
      channels: args.type,
      notify_url: this.callbackUrl,
      return_url: this.callbackUrl,
      lang: "FR",
    };

    // carte = infos client (comme ton code original)
    if (args.type === "CREDIT_CARD") {
      payload.customer_id = args.customer.id;
      payload.customer_name = args.customer.name;
      payload.customer_surname = args.customer.surname;
      payload.customer_email = args.customer.email;
      payload.customer_phone_number = args.customer.phone;
      payload.customer_address = args.customer.address || "";
      payload.customer_city = args.customer.city || "";
      payload.customer_country = args.customer.country || "";
      payload.customer_state = args.customer.state || "";
      payload.customer_zip_code = args.customer.zipCode || "";
      payload.metadata = args.customer.metadata || "";
    }

    const res = await fetch(this.apiInEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`CinetPay deposit failed: HTTP ${res.status}`);
    }

    const json = await res.json();
    const ok = json?.code === "201";

    return {
      success: ok,
      message: json?.message ?? "CinetPay deposit",
      data: {
        ...(json?.data ?? {}),
        api_response_id: json?.api_response_id,
        details: json?.description,
      },
    };
  }

  async check(args: {
    transactionId: string;
    currency: Currency;
  }): Promise<PayResult> {
    const endpoint = "https://api-checkout.cinetpay.com/v2/payment/check";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: this.apiKey,
        site_id: this.siteId(args.currency),
        transaction_id: args.transactionId,
      }),
      cache: "no-store",
    });

    const json = await res.json();
    return {
      success: true,
      message: "CinetPay check",
      data: json,
    };
  }

  async withdraw(_: any): Promise<PayResult> {
    // ton code Node simulait le payout :contentReference[oaicite:6]{index=6}
    return { success: false, message: "CinetPay payout not implemented yet" };
  }
}
