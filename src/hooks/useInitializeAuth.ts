import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/store/authStore";

/**
 * Initialize the Zustand store from complete user data
 * Fetches fresh data from /api/me to ensure all fields (including photoUrl) are loaded
 */
export function useInitializeAuth() {
  const { data: session } = useSession();
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch complete user data from server
      const loadUserData = async () => {
        try {
          const response = await fetch("/api/me");
          if (response.ok) {
            const userData = await response.json();
            setUser({
              id: userData._id || userData.id,
              nomComplet: userData.nomComplet || userData.name || "",
              email: userData.email || "",
              photoUrl: userData.photoUrl,
              role: userData.role || "client",
              autorisations: userData.autorisations,
              quotite: userData.quotite,
            });
          } else {
            // Fallback to session data if API fails
            const sessionUser = session.user as any;
            setUser({
              id: sessionUser.id,
              nomComplet: sessionUser.name || sessionUser.nomComplet || "",
              email: sessionUser.email || "",
              photoUrl: sessionUser.photoUrl,
              role: sessionUser.role || "client",
              autorisations: sessionUser.autorisations,
              quotite: sessionUser.quotite,
            });
          }
        } catch (error) {
          console.error("Failed to load user data:", error);
          // Fallback to session data
          const sessionUser = session.user as any;
          setUser({
            id: sessionUser.id,
            nomComplet: sessionUser.name || sessionUser.nomComplet || "",
            email: sessionUser.email || "",
            photoUrl: sessionUser.photoUrl,
            role: sessionUser.role || "client",
            autorisations: sessionUser.autorisations,
            quotite: sessionUser.quotite,
          });
        }
      };

      loadUserData();
    } else {
      clearUser();
    }
  }, [session?.user?.id, setUser, clearUser]);
}
