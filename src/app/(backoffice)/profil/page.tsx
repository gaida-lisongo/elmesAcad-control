"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import toast, { Toaster } from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MockUser {
  name: string;
  email: string;
  role: "ADMIN" | "TENANT";
  avatarInitials: string;
}

// ─── Mock — TODO: replace with useSession() / API call → GET /api/me ─────────
const MOCK_USER: MockUser = {
  name: "Alice Martin",
  email: "alice@example.com",
  role: "ADMIN",
  avatarInitials: "AM",
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow p-8">
      <div className="mb-6 pb-5 border-b border-gray-200 dark:border-darkborder">
        <h4 className="text-midnight_text dark:text-white">{title}</h4>
        {description && (
          <p className="text-base text-dark/50 dark:text-white/50 mt-1">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  // TODO: replace mock with session data → const { data: session } = useSession();
  const [form, setForm] = useState({
    name: MOCK_USER.name,
    email: MOCK_USER.email,
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
  }>({});

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwErrors, setPwErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // ── Profile save ─────────────────────────────────────────────────────────
  function validateProfile(): boolean {
    const errs: typeof formErrors = {};
    if (!form.name.trim()) errs.name = "Le nom est requis.";
    if (!form.email.trim()) errs.email = "L'email est requis.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Format email invalide.";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validateProfile()) return;
    // TODO: API call → PATCH /api/me  { name, email }
    toast.success("Profil mis à jour.");
  }

  // ── Password save ────────────────────────────────────────────────────────
  function validatePassword(): boolean {
    const errs: typeof pwErrors = {};
    if (!pwForm.currentPassword)
      errs.currentPassword = "Mot de passe actuel requis.";
    if (!pwForm.newPassword) errs.newPassword = "Nouveau mot de passe requis.";
    else if (pwForm.newPassword.length < 8)
      errs.newPassword = "Minimum 8 caractères.";
    if (pwForm.newPassword !== pwForm.confirmPassword)
      errs.confirmPassword = "Les mots de passe ne correspondent pas.";
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validatePassword()) return;
    // TODO: API call → POST /api/me/change-password  { currentPassword, newPassword }
    toast.success("Mot de passe modifié.");
    setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPwErrors({});
  }

  // ── Logout moved to BackofficeSideNav

  return (
    <>
      <Toaster position="top-right" />

      {/* Identity hero card */}
      <div className="bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow px-8 py-6 mb-8 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary text-white text-xl font-bold flex items-center justify-center flex-shrink-0">
          {MOCK_USER.avatarInitials}
        </div>
        <div>
          <h2 className="text-midnight_text dark:text-white leading-tight">
            {MOCK_USER.name}
          </h2>
          <p className="text-base text-dark/50 dark:text-white/50 mt-0.5">
            {MOCK_USER.email}
          </p>
          <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {MOCK_USER.role}
          </span>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* ── Profile info ────────────────────────────────────── */}
        <Section
          title="Informations du compte"
          description="Modifiez votre nom et votre adresse email."
        >
          <form onSubmit={handleProfileSave} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-base font-medium text-midnight_text dark:text-white mb-1.5">
                Nom complet
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={
                  formErrors.name
                    ? "p-3 border border-red-400 focus:border-red-500 rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]"
                    : "p-3 border border-gray-200 focus:border-primary dark:border-darkborder dark:focus:border-primary rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]"
                }
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-base font-medium text-midnight_text dark:text-white mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={
                  formErrors.email
                    ? "p-3 border border-red-400 focus:border-red-500 rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]"
                    : "p-3 border border-gray-200 focus:border-primary dark:border-darkborder dark:focus:border-primary rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]"
                }
              />
              {formErrors.email && (
                <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Role (read-only) */}
            <div>
              <label className="block text-base font-medium text-midnight_text dark:text-white mb-1.5">
                Rôle
              </label>
              <input
                type="text"
                value={MOCK_USER.role}
                readOnly
                className="p-3 border border-gray-200 dark:border-darkborder rounded-lg w-full bg-grey dark:bg-darkmode/50 text-midnight_text/50 dark:text-white/40 cursor-not-allowed"
              />
              <p className="text-sm text-dark/40 dark:text-white/30 mt-1">
                Le rôle est géré par un administrateur.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-darkborder">
              <button
                type="submit"
                className="mt-4 flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary hover:bg-orange-600 duration-300 rounded-lg"
              >
                <Icon icon="heroicons:check-20-solid" className="w-5 h-5" />
                Sauvegarder
              </button>
            </div>
          </form>
        </Section>

        {/* ── Password change ──────────────────────────────────── */}
        <Section
          title="Changer le mot de passe"
          description="Choisissez un mot de passe fort (min. 8 caractères)."
        >
          <form onSubmit={handlePasswordSave} className="space-y-5">
            {/* Current password */}
            <div>
              <label className="block text-base font-medium text-midnight_text dark:text-white mb-1.5">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, currentPassword: e.target.value })
                }
                placeholder="••••••••"
                className={
                  pwErrors.currentPassword
                    ? "p-3 border border-red-400 focus:border-red-500 rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]"
                    : "p-3 border border-gray-200 focus:border-primary dark:border-darkborder dark:focus:border-primary rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]"
                }
              />
              {pwErrors.currentPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {pwErrors.currentPassword}
                </p>
              )}
            </div>

            {/* New password */}
            <div>
              <label className="block text-base font-medium text-midnight_text dark:text-white mb-1.5">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, newPassword: e.target.value })
                }
                placeholder="••••••••"
                className={
                  pwErrors.newPassword
                    ? "p-3 border border-red-400 focus:border-red-500 rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]"
                    : "p-3 border border-gray-200 focus:border-primary dark:border-darkborder dark:focus:border-primary rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]"
                }
              />
              {pwErrors.newPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {pwErrors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-base font-medium text-midnight_text dark:text-white mb-1.5">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, confirmPassword: e.target.value })
                }
                placeholder="••••••••"
                className={
                  pwErrors.confirmPassword
                    ? "p-3 border border-red-400 focus:border-red-500 rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]"
                    : "p-3 border border-gray-200 focus:border-primary dark:border-darkborder dark:focus:border-primary rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]"
                }
              />
              {pwErrors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {pwErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-darkborder">
              <button
                type="submit"
                className="mt-4 flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary hover:bg-orange-600 duration-300 rounded-lg"
              >
                <Icon
                  icon="heroicons:lock-closed-20-solid"
                  className="w-5 h-5"
                />
                Mettre à jour le mot de passe
              </button>
            </div>
          </form>
        </Section>
      </div>
    </>
  );
}
