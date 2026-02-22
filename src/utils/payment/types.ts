export type Currency = "CDF" | "USD";

export type DepositType = "MOBILE_MONEY" | "CREDIT_CARD";

export type ProviderName = "flexpay" | "cinetpay" | "wonyapay";

export interface PayResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface CustomerData {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  state?: string;
  zipCode?: string;
  metadata?: string;
}

export interface DepositArgsFlexPay {
  amount: number;
  currency: Currency;
  phone?: string; // pour mobile money
  reference: string; // ex: "CARD_xxx" ou "MOMO_xxx"
}

export interface DepositArgsCinetPay {
  customer: CustomerData;
  amount: number;
  currency: Currency;
  transactionId: string;
  description: string;
  type: DepositType; // MOBILE_MONEY ou CREDIT_CARD
}

export interface DepositArgsWonyaPay {
  phone: string;
  amount: number;
  currency: Currency;
  motif: string;
}

export interface WithdrawArgsFlexPay {
  amount: number;
  currency: Currency;
  phone: string;
  reference: string;
}

export interface WithdrawArgsWonyaPay {
  phone: string;
  amount: number;
  currency: Currency;
  userName: string;
  motif: string;
}
