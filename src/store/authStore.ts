import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = "admin" | "client";

export interface AuthUser {
  id: string;
  nomComplet: string;
  email: string;
  photoUrl?: string;
  role: UserRole;
  autorisations?: string[];
  quotite?: number; // for admins
}

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | Partial<AuthUser>) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  clearUser: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => {
        if (typeof user === "object" && user !== null) {
          const currentUser = get().user;
          // Merge with existing user if partial
          if (currentUser && Object.keys(user).length < 6) {
            set({ user: { ...currentUser, ...user } });
          } else {
            set({ user: user as AuthUser });
          }
        }
      },
      updateUser: (updates) => {
        console.log("Updating user with:", updates);
        const current = get().user;
        console.log("Current user:", current);
        if (current) {
          set({ user: { ...current, ...updates } });
        }
        console.log("Updated user:", get().user);
      },
      clearUser: () => set({ user: null }),
    }),
    {
      name: "auth-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
