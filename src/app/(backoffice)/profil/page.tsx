"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { updateProfile, updateAvatar, changePassword } from "./actions";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserProfile {
  nomComplet: string;
  email: string;
  role: string;
  photoUrl?: string;
}

type Tab = "INFORMATIONS" | "SECURITE";

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

// ─── Input class helper ───────────────────────────────────────────────────────
const inputCls = (hasError?: boolean) =>
  hasError
    ? "p-3 border border-red-400 focus:border-red-500 rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]"
    : "p-3 border border-gray-200 focus:border-primary dark:border-darkborder dark:focus:border-primary rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { updateUser, user } = useAuthStore();

  const [tab, setTab] = useState<Tab>("INFORMATIONS");

  // Profile form state
  const [form, setForm] = useState({
    nomComplet: user?.nomComplet ?? "",
    email: user?.email ?? "",
  });
  const [formErrors, setFormErrors] = useState<{
    nomComplet?: string;
    email?: string;
  }>({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password form state
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
  const [savingPw, setSavingPw] = useState(false);

  // ── Avatar upload ───────────────────────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setUploadingAvatar(true);
    try {
      const result = await updateAvatar(formData);
      console.log("updateAvatar result:", result);
      if (!result.success) {
        throw new Error(result.error ?? "Erreur upload.");
      }
      if (result.user) {
        // ✅ Sync complete user to Zustand store
        updateUser(result.user);
      }
      toast.success("Photo mise à jour.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ── Profile save ─────────────────────────────────────────────────────────
  function validateProfile(): boolean {
    const errs: typeof formErrors = {};
    const nomTrimmed = form.nomComplet.trim();
    const emailTrimmed = form.email.trim();

    if (nomTrimmed && nomTrimmed.length < 2)
      errs.nomComplet = "Minimum 2 caractères.";
    if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed))
      errs.email = "Format email invalide.";
    // Check if at least one field is filled
    if (!nomTrimmed && !emailTrimmed) {
      toast.error("Au moins un champ à mettre à jour.");
      return false;
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validateProfile()) return;
    setSavingProfile(true);
    try {
      const nomTrimmed = form.nomComplet.trim();
      const emailTrimmed = form.email.trim();

      const result = await updateProfile({
        nomComplet: nomTrimmed || undefined,
        email: emailTrimmed || undefined,
      });
      if (!result.success) {
        throw new Error(result.error ?? "Erreur de mise à jour.");
      }
      if (result.user) {
        // ✅ Sync complete user object to Zustand store (preserves all fields)
        updateUser(result.user);
      }
      toast.success("Profil mis à jour.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
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

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validatePassword()) return;
    setSavingPw(true);
    try {
      const result = await changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      if (!result.success) {
        throw new Error(result.error ?? "Erreur de mise à jour.");
      }
      toast.success("Mot de passe modifié.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwErrors({});
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingPw(false);
    }
  }

  // ── Derived display values ───────────────────────────────────────────────
  const displayName = user?.nomComplet ?? "";
  const displayEmail = user?.email ?? "";
  const displayRole = user?.role ?? "";
  const photoUrl = user?.photoUrl;
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const tabBtnCls = (t: Tab) =>
    tab === t
      ? "px-5 py-2.5 text-sm font-semibold text-primary border-b-2 border-primary"
      : "px-5 py-2.5 text-sm font-medium text-dark/50 dark:text-white/50 hover:text-midnight_text dark:hover:text-white border-b-2 border-transparent duration-200";

  return (
    <>
      <Toaster position="top-right" />

      {/* Identity hero card */}
      <div className="bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow px-8 py-6 mb-8 flex items-center gap-5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {photoUrl ? (
            <div className="w-16 h-16 rounded-2xl overflow-hidden">
              <Image
                key={photoUrl}
                src={photoUrl}
                alt={displayName}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-primary text-white text-xl font-bold flex items-center justify-center">
              {initials || "?"}
            </div>
          )}
          {/* Upload overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow hover:bg-orange-600 duration-200 disabled:opacity-60"
            title="Changer la photo"
          >
            {uploadingAvatar ? (
              <Icon
                icon="heroicons:arrow-path-20-solid"
                className="w-3.5 h-3.5 animate-spin"
              />
            ) : (
              <Icon icon="heroicons:camera-20-solid" className="w-3.5 h-3.5" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div>
          <h2 className="text-midnight_text dark:text-white leading-tight">
            {displayName}
          </h2>
          <p className="text-base text-dark/50 dark:text-white/50 mt-0.5">
            {displayEmail}
          </p>
          {displayRole && (
            <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {displayRole}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-darkborder mb-6">
        <button
          className={tabBtnCls("INFORMATIONS")}
          onClick={() => setTab("INFORMATIONS")}
        >
          INFORMATIONS PERSONNELLES
        </button>
        <button
          className={tabBtnCls("SECURITE")}
          onClick={() => setTab("SECURITE")}
        >
          SÉCURITÉ
        </button>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* ── Tab: Informations ────────────────────────────────── */}
        {tab === "INFORMATIONS" && (
          <Section
            title="Informations du compte"
            description="Modifiez votre nom et votre adresse email."
          >
            <form onSubmit={handleProfileSave} className="space-y-5">
              {/* Nom */}
              <div>
                <label className="block text-base font-medium text-midnight_text dark:text-white mb-1.5">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={form.nomComplet}
                  onChange={(e) =>
                    setForm({ ...form, nomComplet: e.target.value })
                  }
                  className={inputCls(!!formErrors.nomComplet)}
                />
                {formErrors.nomComplet && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors.nomComplet}
                  </p>
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
                  className={inputCls(!!formErrors.email)}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Rôle (read-only) */}
              <div>
                <label className="block text-base font-medium text-midnight_text dark:text-white mb-1.5">
                  Rôle
                </label>
                <input
                  type="text"
                  value={displayRole}
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
                  disabled={savingProfile}
                  className="mt-4 flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary hover:bg-orange-600 duration-300 rounded-lg disabled:opacity-60"
                >
                  {savingProfile ? (
                    <Icon
                      icon="heroicons:arrow-path-20-solid"
                      className="w-5 h-5 animate-spin"
                    />
                  ) : (
                    <Icon icon="heroicons:check-20-solid" className="w-5 h-5" />
                  )}
                  Sauvegarder
                </button>
              </div>
            </form>
          </Section>
        )}

        {/* ── Tab: Sécurité ─────────────────────────────────────── */}
        {tab === "SECURITE" && (
          <Section
            title="Changer le mot de passe"
            description="Choisissez un mot de passe fort (min. 8 caractères)."
          >
            <form onSubmit={handlePasswordSave} className="space-y-5">
              {/* Mot de passe actuel */}
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
                  className={inputCls(!!pwErrors.currentPassword)}
                />
                {pwErrors.currentPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {pwErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* Nouveau mot de passe */}
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
                  className={inputCls(!!pwErrors.newPassword)}
                />
                {pwErrors.newPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {pwErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirmer */}
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
                  className={inputCls(!!pwErrors.confirmPassword)}
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
                  disabled={savingPw}
                  className="mt-4 flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary hover:bg-orange-600 duration-300 rounded-lg disabled:opacity-60"
                >
                  {savingPw ? (
                    <Icon
                      icon="heroicons:arrow-path-20-solid"
                      className="w-5 h-5 animate-spin"
                    />
                  ) : (
                    <Icon
                      icon="heroicons:lock-closed-20-solid"
                      className="w-5 h-5"
                    />
                  )}
                  Mettre à jour le mot de passe
                </button>
              </div>
            </form>
          </Section>
        )}
      </div>
    </>
  );
}
