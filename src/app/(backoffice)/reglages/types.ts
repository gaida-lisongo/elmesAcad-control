// Shared types and constants — NOT a "use server" file
// Safe to import from both server actions and client components

export const AUTORISATIONS = ["SUPER-ADMIN", "ADMIN", "MODERATEUR"] as const;
export type Autorisation = (typeof AUTORISATIONS)[number];

export interface AdminDTO {
  id: string;
  nomComplet: string;
  email: string;
  autorisations: Autorisation[];
  quotite: number;
  createdAt: string;
}
