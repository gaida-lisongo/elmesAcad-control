"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import Loader from "@/app/components/Common/Loader";
import Link from "next/link";
import Logo from "@/app/components/Layout/Header/Logo";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Veuillez saisir votre adresse email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });
      if (res.ok) {
        setSent(true);
        toast.success("Un email de rÃ©cupÃ©ration vous a Ã©tÃ© envoyÃ©.");
        setEmail("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Une erreur est survenue.");
      }
    } catch {
      toast.error("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-10 text-center mx-auto inline-block">
        <Logo />
      </div>

      {sent ? (
        <div className="text-center">
          <p className="text-base text-dark dark:text-white mb-4">
            Si un compte correspond à cette adresse, vous recevrez un lien de
            réinitialisation sous peu.
          </p>
          <Link
            href="/signin"
            className="inline-block text-base text-primary hover:underline"
          >
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-6 text-center text-base text-dark/60 dark:text-white/60">
            Saisissez votre adresse email pour recevoir un lien de
            rÃ©initialisation de mot de passe.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-[22px]">
              <input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                Envoyer le lien
              </button>
            </div>
          </form>
          <div className="text-center">
            <Link
              href="/signin"
              className="text-base text-dark hover:text-primary dark:text-white dark:hover:text-primary"
            >
              Retour à la connexion
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
