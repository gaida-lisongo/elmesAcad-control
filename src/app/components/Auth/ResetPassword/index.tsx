"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/app/components/Common/Loader";
import Logo from "@/app/components/Layout/Header/Logo";
import Link from "next/link";

const ResetPassword = () => {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Une erreur est survenue.");
        return;
      }
      setDone(true);
      toast.success("Mot de passe mis à jour avec succès !");
      setTimeout(() => router.push("/signin"), 2000);
    } catch {
      toast.error("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="text-center">
        <p className="text-red-500 mb-4">Lien invalide ou incomplet.</p>
        <Link href="/mot-de-passe-oublie" className="text-primary hover:underline">
          Faire une nouvelle demande
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10 text-center mx-auto inline-block">
        <Logo />
      </div>
      {done ? (
        <p className="text-base text-dark dark:text-white text-center">
          Mot de passe réinitialisé. Redirection en cours…
        </p>
      ) : (
        <>
          <p className="mb-6 text-center text-base text-dark/60 dark:text-white/60">
            Nouveau mot de passe pour <strong>{email}</strong>.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-[22px]">
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-border dark:border-dark_border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition placeholder:text-gray-400 focus:border-primary focus-visible:shadow-none dark:border-border_color dark:text-white dark:focus:border-primary"
              />
            </div>
            <div className="mb-[22px]">
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-md border border-border dark:border-dark_border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition placeholder:text-gray-400 focus:border-primary focus-visible:shadow-none dark:border-border_color dark:text-white dark:focus:border-primary"
              />
            </div>
            <div className="mb-6">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-primary bg-primary hover:bg-primary/75 px-5 py-3 text-base text-white font-medium transition duration-300 ease-in-out disabled:opacity-60"
              >
                {loading && <Loader />}
                Réinitialiser le mot de passe
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ResetPassword;
