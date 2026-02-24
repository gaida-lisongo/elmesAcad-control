"use client";

import { useInitializeAuth } from "@/hooks/useInitializeAuth";

/**
 * Component that initializes auth store from session.
 * Must be placed in a client component within SessionProvider.
 */
export function AuthInitializer() {
  useInitializeAuth();
  return null;
}
