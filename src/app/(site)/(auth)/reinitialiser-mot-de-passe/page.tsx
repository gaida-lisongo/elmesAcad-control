import { Suspense } from "react";
import ResetPassword from "@/app/components/Auth/ResetPassword";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe | Saturn",
};

export default function ResetPasswordPage() {
  return (
    <div className="pt-32 sm:pt-56 pb-10 px-4 bg-grey dark:bg-darkmode">
      <div className="container mx-auto max-w-lg overflow-hidden rounded-lg bg-white dark:bg-darklight text-center px-8 py-14 sm:px-12 md:px-16">
        <Suspense fallback={<div className="text-center">Chargement…</div>}>
          <ResetPassword />
        </Suspense>
      </div>
    </div>
  );
}
