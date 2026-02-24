"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Icon } from "@iconify/react";
import toast, { Toaster } from "react-hot-toast";
import {
  createAdmin,
  updateAdmin,
  deleteAdmin,
  updateAutorisations,
  updateQuotite,
} from "../actions";
import { AUTORISATIONS, type AdminDTO, type Autorisation } from "../types";

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE: Record<Autorisation, string> = {
  "SUPER-ADMIN": "bg-primary/10 text-primary",
  ADMIN: "bg-blue/10 text-blue",
  MODERATEUR: "bg-success/10 text-success",
};

function AutoBadge({ a }: { a: Autorisation }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${BADGE[a] ?? "bg-grey text-dark"}`}
    >
      {a}
    </span>
  );
}

// ─── Shared input class ───────────────────────────────────────────────────────
const inputCls = (err?: string[]) =>
  err
    ? "p-3 border border-red-400 focus:border-red-500 rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]"
    : "p-3 border border-gray-200 focus:border-primary dark:border-darkborder dark:focus:border-primary rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]";

// ─── CreateModal ──────────────────────────────────────────────────────────────
function CreateModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createAdmin, {});

  useEffect(() => {
    if (!state.error && !state.fieldErrors && Object.keys(state).length === 0)
      return;
    if (!state.error && !state.fieldErrors) {
      // empty state = success after first meaningful submit
    }
  }, [state]);

  // Detect successful submit: no error, no fieldErrors, pending went false
  const prevPending = useRef(false);
  useEffect(() => {
    if (prevPending.current && !pending && !state.error && !state.fieldErrors) {
      toast.success("Administrateur créé.");
      formRef.current?.reset();
      onCreated();
      onClose();
    }
    prevPending.current = pending;
  }, [pending, state, onCreated, onClose]);

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-dark/60 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-darklight rounded-3xl shadow-card-shadow border border-gray-200 dark:border-darkborder p-6">
          <div className="flex items-center justify-between mb-6">
            <DialogTitle className="text-xl font-bold text-midnight_text dark:text-white">
              Créer un administrateur
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-midnight_text/40 dark:text-white/40 hover:text-midnight_text dark:hover:text-white hover:bg-grey dark:hover:bg-darkmode duration-300"
            >
              <Icon icon="heroicons:x-mark-20-solid" className="w-5 h-5" />
            </button>
          </div>

          {state.error && (
            <p className="text-sm text-red-500 bg-red-500/5 rounded-lg p-3 mb-4">
              {state.error}
            </p>
          )}

          <form ref={formRef} action={action} className="space-y-5">
            <div>
              <label className="block text-base font-medium text-midnight_text dark:text-white mb-1.5">
                Nom complet <span className="text-primary">*</span>
              </label>
              <input
                name="nomComplet"
                type="text"
                placeholder="Alice Martin"
                className={inputCls(state.fieldErrors?.nomComplet)}
              />
              {state.fieldErrors?.nomComplet && (
                <p className="text-sm text-red-500 mt-1">
                  {state.fieldErrors.nomComplet[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-base font-medium text-midnight_text dark:text-white mb-1.5">
                Email <span className="text-primary">*</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="alice@example.com"
                className={inputCls(state.fieldErrors?.email)}
              />
              {state.fieldErrors?.email && (
                <p className="text-sm text-red-500 mt-1">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-base font-medium text-midnight_text dark:text-white mb-1.5">
                Mot de passe <span className="text-primary">*</span>
              </label>
              <input
                name="motDePasse"
                type="password"
                placeholder="Min. 8 caractères"
                className={inputCls(state.fieldErrors?.motDePasse)}
              />
              {state.fieldErrors?.motDePasse && (
                <p className="text-sm text-red-500 mt-1">
                  {state.fieldErrors.motDePasse[0]}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-darkborder">
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-3 text-base font-medium text-midnight_text dark:text-white border border-gray-200 dark:border-darkborder rounded-lg hover:bg-grey dark:hover:bg-darkmode duration-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={pending}
                className="mt-4 flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary hover:bg-orange-600 duration-300 rounded-lg disabled:opacity-60"
              >
                {pending && (
                  <Icon
                    icon="heroicons:arrow-path-20-solid"
                    className="w-4 h-4 animate-spin"
                  />
                )}
                Créer
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

// ─── EditModal ────────────────────────────────────────────────────────────────
function EditModal({
  admin,
  onClose,
  onUpdated,
}: {
  admin: AdminDTO;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [nomComplet, setNomComplet] = useState(admin.nomComplet);
  const [email, setEmail] = useState(admin.email);
  const [quotite, setQuotite] = useState(String(admin.quotite ?? 0));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const q = parseFloat(quotite);
      if (isNaN(q) || q < 0) {
        setErrors((prev) => ({ ...prev, quotite: "Valeur invalide." }));
        return;
      }
      const result = await updateAdmin(admin.id, { nomComplet, email });
      if (result.fieldErrors) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(result.fieldErrors ?? {})) {
          if (v?.[0]) flat[k] = v[0];
        }
        setErrors(flat);
        return;
      } else if (result.error) {
        toast.error(result.error);
        return;
      }
      // update quotite separately
      const qResult = await updateQuotite(admin.id, q);
      if (qResult.error) {
        toast.error(qResult.error);
        return;
      }
      toast.success("Administrateur mis à jour.");
      onUpdated();
      onClose();
    });
  }

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-dark/60 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-darklight rounded-3xl shadow-card-shadow border border-gray-200 dark:border-darkborder p-6">
          <div className="flex items-center justify-between mb-6">
            <DialogTitle className="text-xl font-bold text-midnight_text dark:text-white">
              Modifier l&apos;administrateur
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-midnight_text/40 dark:text-white/40 hover:text-midnight_text dark:hover:text-white hover:bg-grey dark:hover:bg-darkmode duration-300"
            >
              <Icon icon="heroicons:x-mark-20-solid" className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base font-medium text-midnight_text dark:text-white mb-1.5">
                Nom complet
              </label>
              <input
                type="text"
                value={nomComplet}
                onChange={(e) => setNomComplet(e.target.value)}
                className={inputCls(
                  errors.nomComplet ? [errors.nomComplet] : undefined,
                )}
              />
              {errors.nomComplet && (
                <p className="text-sm text-red-500 mt-1">{errors.nomComplet}</p>
              )}
            </div>

            <div>
              <label className="block text-base font-medium text-midnight_text dark:text-white mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls(errors.email ? [errors.email] : undefined)}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-base font-medium text-midnight_text dark:text-white mb-1.5">
                Quotité
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={quotite}
                onChange={(e) => setQuotite(e.target.value)}
                placeholder="0"
                className={inputCls(
                  errors.quotite ? [errors.quotite] : undefined,
                )}
              />
              {errors.quotite && (
                <p className="text-sm text-red-500 mt-1">{errors.quotite}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-darkborder">
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-3 text-base font-medium text-midnight_text dark:text-white border border-gray-200 dark:border-darkborder rounded-lg hover:bg-grey dark:hover:bg-darkmode duration-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="mt-4 flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary hover:bg-orange-600 duration-300 rounded-lg disabled:opacity-60"
              >
                {isPending && (
                  <Icon
                    icon="heroicons:arrow-path-20-solid"
                    className="w-4 h-4 animate-spin"
                  />
                )}
                Mettre à jour
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

// ─── PermissionsModal ─────────────────────────────────────────────────────────
function PermissionsModal({
  admin,
  onClose,
  onUpdated,
}: {
  admin: AdminDTO;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [selected, setSelected] = useState<Set<Autorisation>>(
    new Set(admin.autorisations),
  );
  const [isPending, startTransition] = useTransition();

  function toggle(a: Autorisation) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(a) ? next.delete(a) : next.add(a);
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateAutorisations(admin.id, [...selected]);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Autorisations mises à jour.");
        onUpdated();
        onClose();
      }
    });
  }

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-dark/60 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm bg-white dark:bg-darklight rounded-3xl shadow-card-shadow border border-gray-200 dark:border-darkborder p-6">
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-xl font-bold text-midnight_text dark:text-white">
              Autorisations
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-midnight_text/40 dark:text-white/40 hover:text-midnight_text dark:hover:text-white hover:bg-grey dark:hover:bg-darkmode duration-300"
            >
              <Icon icon="heroicons:x-mark-20-solid" className="w-5 h-5" />
            </button>
          </div>

          <p className="text-base text-dark/50 dark:text-white/50 mb-6">
            {admin.nomComplet}
          </p>

          <div className="space-y-3 mb-6">
            {AUTORISATIONS.map((a) => (
              <label
                key={a}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-grey dark:hover:bg-darkmode duration-150"
              >
                <input
                  type="checkbox"
                  checked={selected.has(a)}
                  onChange={() => toggle(a)}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="flex-1 text-base font-medium text-midnight_text dark:text-white">
                  {a}
                </span>
                <AutoBadge a={a} />
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-darkborder">
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-6 py-3 text-base font-medium text-midnight_text dark:text-white border border-gray-200 dark:border-darkborder rounded-lg hover:bg-grey dark:hover:bg-darkmode duration-300"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="mt-4 flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary hover:bg-orange-600 duration-300 rounded-lg disabled:opacity-60"
            >
              {isPending && (
                <Icon
                  icon="heroicons:arrow-path-20-solid"
                  className="w-4 h-4 animate-spin"
                />
              )}
              Sauvegarder
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

// ─── Main client component ────────────────────────────────────────────────────
type Modal =
  | { type: "create" }
  | { type: "edit"; admin: AdminDTO }
  | { type: "permissions"; admin: AdminDTO }
  | { type: "delete"; admin: AdminDTO };

export default function AdminsClient({
  initialAdmins,
  fetchError,
}: {
  initialAdmins: AdminDTO[];
  fetchError?: string;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<Modal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminDTO | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  function refresh() {
    router.refresh();
  }

  function confirmDelete(admin: AdminDTO) {
    setDeleteTarget(admin);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    startDeleteTransition(async () => {
      const result = await deleteAdmin(target.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Administrateur supprimé.");
        router.refresh();
      }
    });
  }

  if (fetchError) {
    return (
      <div className="bg-red-500/5 border border-red-300 rounded-2xl p-6 text-red-500">
        Erreur de chargement : {fetchError}
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-midnight_text dark:text-white">
            Gestion des administrateurs
          </h2>
          <p className="text-base text-dark/50 dark:text-white/50 mt-1">
            {initialAdmins.length} administrateur
            {initialAdmins.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setModal({ type: "create" })}
          className="flex items-center gap-2 w-fit px-6 py-3 text-base font-medium text-white bg-primary hover:bg-orange-600 duration-300 rounded-lg"
        >
          <Icon icon="heroicons:plus-20-solid" className="w-5 h-5" />
          Créer un administrateur
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow overflow-hidden">
        {initialAdmins.length === 0 ? (
          <div className="text-center py-16">
            <Icon
              icon="heroicons:users"
              className="w-10 h-10 mx-auto mb-3 text-midnight_text/20 dark:text-white/20"
            />
            <p className="text-base text-dark/50 dark:text-white/50">
              Aucun administrateur pour l&apos;instant.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkborder">
              <thead className="bg-grey dark:bg-darkmode">
                <tr>
                  {["Nom", "Email", "Autorisations", "Quotité", "Actions"].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-midnight_text/50 dark:text-white/40"
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-darkborder">
                {initialAdmins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-grey dark:hover:bg-darkmode/50 duration-200"
                  >
                    {/* Name + avatar */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
                          {admin.nomComplet.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-base font-medium text-midnight_text dark:text-white">
                          {admin.nomComplet}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 whitespace-nowrap text-base text-dark/50 dark:text-white/50">
                      {admin.email}
                    </td>

                    {/* Autorisations */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {admin.autorisations.length === 0 ? (
                          <span className="text-sm text-dark/30 dark:text-white/30 italic">
                            Aucune
                          </span>
                        ) : (
                          admin.autorisations.map((a) => (
                            <AutoBadge key={a} a={a as Autorisation} />
                          ))
                        )}
                      </div>
                    </td>

                    {/* Quotité */}
                    <td className="px-5 py-4 whitespace-nowrap text-base text-dark/50 dark:text-white/50">
                      {admin.quotite ?? 0}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {/* Edit info */}
                        <button
                          onClick={() => setModal({ type: "edit", admin })}
                          title="Modifier"
                          className="p-1.5 rounded-lg text-midnight_text/40 dark:text-white/40 hover:text-primary dark:hover:text-primary hover:bg-primary/5 duration-200"
                        >
                          <Icon
                            icon="heroicons:pencil-square-20-solid"
                            className="w-4 h-4"
                          />
                        </button>

                        {/* Permissions */}
                        <button
                          onClick={() =>
                            setModal({ type: "permissions", admin })
                          }
                          title="Autorisations"
                          className="p-1.5 rounded-lg text-midnight_text/40 dark:text-white/40 hover:text-blue dark:hover:text-blue hover:bg-blue/5 duration-200"
                        >
                          <Icon
                            icon="heroicons:shield-check-20-solid"
                            className="w-4 h-4"
                          />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => confirmDelete(admin)}
                          title="Supprimer"
                          className="p-1.5 rounded-lg text-midnight_text/40 dark:text-white/40 hover:text-red-500 hover:bg-red-500/5 duration-200"
                        >
                          <Icon
                            icon="heroicons:trash-20-solid"
                            className="w-4 h-4"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal?.type === "create" && (
        <CreateModal open onClose={() => setModal(null)} onCreated={refresh} />
      )}

      {modal?.type === "edit" && (
        <EditModal
          admin={modal.admin}
          onClose={() => setModal(null)}
          onUpdated={refresh}
        />
      )}

      {modal?.type === "permissions" && (
        <PermissionsModal
          admin={modal.admin}
          onClose={() => setModal(null)}
          onUpdated={refresh}
        />
      )}

      {/* ── Delete confirmation ── */}
      {deleteTarget && (
        <Dialog
          open
          onClose={() => setDeleteTarget(null)}
          className="relative z-50"
        >
          <div
            className="fixed inset-0 bg-dark/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="w-full max-w-sm bg-white dark:bg-darklight rounded-3xl shadow-card-shadow border border-gray-200 dark:border-darkborder p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon
                    icon="heroicons:exclamation-triangle-20-solid"
                    className="w-5 h-5 text-red-500"
                  />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-midnight_text dark:text-white">
                    Supprimer l&apos;administrateur
                  </DialogTitle>
                  <p className="text-sm text-dark/50 dark:text-white/50 mt-1">
                    <span className="font-semibold text-midnight_text dark:text-white">
                      {deleteTarget.nomComplet}
                    </span>{" "}
                    sera définitivement supprimé. Cette action est irréversible.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-5 py-2.5 text-base font-medium text-midnight_text dark:text-white border border-gray-200 dark:border-darkborder rounded-lg hover:bg-grey dark:hover:bg-darkmode duration-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-5 py-2.5 text-base font-medium text-white bg-red-500 hover:bg-red-600 duration-300 rounded-lg disabled:opacity-60"
                >
                  {isDeleting && (
                    <Icon
                      icon="heroicons:arrow-path-20-solid"
                      className="w-4 h-4 animate-spin"
                    />
                  )}
                  Supprimer
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </>
  );
}
