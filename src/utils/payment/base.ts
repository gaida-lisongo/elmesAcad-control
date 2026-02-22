import type { PayResult } from "./types";

export abstract class ServicePay {
  abstract deposit(args: any): Promise<PayResult>;
  abstract check(args: any): Promise<PayResult>;
  abstract withdraw(args: any): Promise<PayResult>;
}
