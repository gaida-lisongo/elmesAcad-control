import ForgotPassword from "@/app/components/Auth/ForgotPassword";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mot de passe oublié | Saturn",
};

const ForgotPasswordPage = () => {
  return (
    <div className="pt-32 sm:pt-56 pb-10 px-4 bg-grey dark:bg-darkmode">
      <div className="container mx-auto max-w-lg overflow-hidden rounded-lg bg-white dark:bg-darklight text-center px-8 py-14 sm:px-12 md:px-16">
        <ForgotPassword />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
