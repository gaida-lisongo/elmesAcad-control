import { redirect } from "next/navigation";

// L'inscription publique est désactivée.
// Les comptes sont créés par un administrateur.
export default function SignupPage() {
  redirect("/signin");
}
