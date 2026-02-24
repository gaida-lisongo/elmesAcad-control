"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Logo from "@/app/components/Layout/Header/Logo";
import Loader from "@/app/components/Common/Loader";
import { useAuthStore } from "@/store/authStore";
import { Icon } from "@iconify/react";

type AccountType = "admin" | "client";

const Signin = () => {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("client");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const validateForm = () => {
    let errors = { email: "", password: "" };
    let isValid = true;

    if (!loginData.email) {
      errors.email = "Email is required.";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      errors.email = "Please enter a valid email address.";
      isValid = false;
    }

    if (!loginData.password) {
      errors.password = "Password is required.";
      isValid = false;
    } else if (loginData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setAuthError("");
    try {
      // Ajouter le type de compte aux credentials
      const result = await signIn("credentials", {
        redirect: false,
        email: loginData.email,
        password: loginData.password,
        accountType, // Passer le type de compte
      });
      if (result?.error) {
        setAuthError("Email ou mot de passe incorrect pour ce type de compte.");
      } else {
        // Load complete user data into store
        try {
          const response = await fetch("/api/me");
          if (response.ok) {
            const userData = await response.json();
            const { setUser } = useAuthStore.getState();
            setUser({
              id: userData._id || userData.id,
              nomComplet: userData.nomComplet || userData.name || "",
              email: userData.email || "",
              photoUrl: userData.photoUrl,
              role: userData.role || "client",
              autorisations: userData.autorisations,
              quotite: userData.quotite,
            });
          }
        } catch (err) {
          console.error("Failed to load user data:", err);
        }
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setAuthError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-10 text-center mx-auto inline-block">
        <Logo />
      </div>

      {/* Tabs pour choisir le type de compte */}
      <div className="mb-8 flex gap-2">
        {/* Tab Admin */}
        <button
          onClick={() => {
            setAccountType("admin");
            setAuthError("");
          }}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
            accountType === "admin"
              ? "bg-primary text-white shadow-lg"
              : "bg-grey dark:bg-darkmode text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Icon icon="mdi:shield-admin" width={20} />
          Administrateur
        </button>

        {/* Tab Client */}
        <button
          onClick={() => {
            setAccountType("client");
            setAuthError("");
          }}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
            accountType === "client"
              ? "bg-primary text-white shadow-lg"
              : "bg-grey dark:bg-darkmode text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Icon icon="mdi:account" width={20} />
          Client
        </button>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-200 flex items-start gap-2">
          <Icon
            icon="mdi:information"
            width={16}
            className="mt-0.5 flex-shrink-0"
          />
          {accountType === "admin"
            ? "Connectez-vous avec votre compte administrateur"
            : "Connectez-vous avec les identifiants reçus lors de votre achat"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {authError && (
          <p className="text-red-500 text-sm mb-4 rounded-lg bg-red-500/5 px-4 py-2">
            {authError}
          </p>
        )}
        <div className="mb-[22px]">
          <input
            type="email"
            placeholder="Adresse email"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
            className="w-full rounded-md border border-border dark:border-dark_border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition placeholder:text-gray-400 focus:border-primary focus-visible:shadow-none dark:border-border_color dark:text-white dark:focus:border-primary"
          />
        </div>
        <div className="mb-[22px]">
          <input
            type="password"
            placeholder="Mot de passe"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            className="w-full rounded-md border border-border dark:border-dark_border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition focus:border-primary focus-visible:shadow-none dark:border-border_color dark:text-white dark:focus:border-primary"
          />
        </div>
        <div className="mb-9">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-primary bg-primary hover:bg-primary/75 px-5 py-3 text-base text-white font-medium transition duration-300 ease-in-out disabled:opacity-60"
          >
            {loading && <Loader />}
            Se connecter
          </button>
        </div>
      </form>

      <div className="flex flex-col items-center justify-center">
        <Link
          href="/mot-de-passe-oublie"
          className="mb-2 inline-block text-base text-dark hover:text-primary dark:text-white dark:hover:text-primary"
        >
          Mot de passe oublié?
        </Link>
      </div>
    </div>
  );
};

export default Signin;
