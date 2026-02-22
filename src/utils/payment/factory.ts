import type { ProviderName } from "./types";
import { getFlexPayService } from "./providers/flexpay";
import { CinetPayService } from "./providers/CinetPay";
import { WonyaPayService } from "./providers/wonyapay";
import { ServicePay } from "./base";

export function getPaymentProvider(provider: ProviderName): ServicePay {
  if (!provider) throw new Error("provider is required");

  switch (provider) {
    case "flexpay":
      return getFlexPayService();
    case "cinetpay":
      return new CinetPayService();
    case "wonyapay":
      return new WonyaPayService();
    default:
      throw new Error(`Provider [${provider}] not supported`);
  }
}
