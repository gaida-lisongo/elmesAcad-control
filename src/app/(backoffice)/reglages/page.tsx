"use client";

import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Switch } from "@headlessui/react";
import { Icon } from "@iconify/react";
import toast, { Toaster } from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
type UserRole = "ADMIN" | "TENANT";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

type UserFormData = Omit<UserRow, "id">;

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: replace with API call → GET /api/users
const INITIAL_USERS: UserRow[] = [
  {
    id: "1",
    name: "Alice Martin",
    email: "alice@example.com",
    role: "ADMIN",
    isActive: true,
  },
  {
    id: "2",
    name: "Bob Dupont",
    email: "bob@example.com",
    role: "TENANT",
    isActive: true,
  },
  {
    id: "3",
    name: "Carol Durand",
    email: "carol@example.com",
    role: "TENANT",
    isActive: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

const EMPTY_FORM: UserFormData = {
  name: "",
  email: "",
  role: "TENANT",
  isActive: true,
};

// ─── UserModal ────────────────────────────────────────────────────────────────
interface UserModalProps {
  open: boolean;
  onClose: () => void;
  initial?: UserRow | null;
  onSave: (data: UserFormData, id?: string) => void;
}

function UserModal({ open, onClose, initial, onSave }: UserModalProps) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState<UserFormData>(
    initial
      ? {
          name: initial.name,
          email: initial.email,
          role: initial.role,
          isActive: initial.isActive,
        }
      : EMPTY_FORM,
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof UserFormData, string>>
  >({});

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Le nom est requis.";
    if (!form.email.trim()) next.email = "L'email est requis.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Format email invalide.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave(form, initial?.id);
    onClose();
  }

  // Reset form when modal opens
  function handleDialogClose() {
    setErrors({});
    setForm(
      initial
        ? {
            name: initial.name,
            email: initial.email,
            role: initial.role,
            isActive: initial.isActive,
          }
        : EMPTY_FORM,
    );
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleDialogClose} className="relative z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-dark/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-darklight rounded-3xl shadow-card-shadow border border-gray-200 dark:border-darkborder p-6">
          <div className="flex items-center justify-between mb-6">
            <DialogTitle className="text-xl font-bold text-midnight_text dark:text-white">
              {isEdit ? "Modifier l'utilisateur" : "Créer un utilisateur"}
            </DialogTitle>
            <button
              onClick={handleDialogClose}
              className="p-1.5 rounded-lg text-midnight_text/40 dark:text-white/40 hover:text-midnight_text dark:hover:text-white hover:bg-grey dark:hover:bg-darkmode duration-300"
            >
              <Icon icon="heroicons:x-mark-20-solid" className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-base font-medium text-midnight_text dark:text-white mb-1.5">
                Nom complet <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Alice Martin"
                className={
                  errors.name
                    ? "p-3 border border-red-400 focus:border-red-500 rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]"
                    : "p-3 border border-gray-200 focus:border-primary dark:border-darkborder dark:focus:border-primary rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]"
                }
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-base font-medium text-midnight_text dark:text-white mb-1.5">
                Email <span className="text-primary">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="alice@example.com"
                className={
                  errors.email
                    ? "p-3 border border-red-400 focus:border-red-500 rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]"
                    : "p-3 border border-gray-200 focus:border-primary dark:border-darkborder dark:focus:border-primary rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]"
                }
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-base font-medium text-midnight_text dark:text-white mb-1.5">
                Rôle
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as UserRole })
                }
                className="p-3 border border-gray-200 focus:border-primary dark:border-darkborder dark:focus:border-primary rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="TENANT">TENANT</option>
              </select>
            </div>

            {/* Status switch */}
            <div className="flex items-center justify-between py-1">
              <span className="text-base font-medium text-midnight_text dark:text-white">
                Statut actif
              </span>
              <Switch
                checked={form.isActive}
                onChange={(val) => setForm({ ...form, isActive: val })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none ${
                  form.isActive
                    ? "bg-primary"
                    : "bg-gray-300 dark:bg-darkborder"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${
                    form.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </Switch>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-darkborder">
              <button
                type="button"
                onClick={handleDialogClose}
                className="mt-4 px-6 py-3 text-base font-medium text-midnight_text dark:text-white border border-gray-200 dark:border-darkborder rounded-lg hover:bg-grey dark:hover:bg-darkmode duration-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="mt-4 px-6 py-3 text-base font-medium text-white bg-primary hover:bg-orange-600 duration-300 rounded-lg"
              >
                {isEdit ? "Mettre à jour" : "Créer"}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

// ─── UsersTable ───────────────────────────────────────────────────────────────
interface UsersTableProps {
  users: UserRow[];
  onEdit: (user: UserRow) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function UsersTable({ users, onEdit, onToggle, onDelete }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-16">
        <Icon
          icon="heroicons:users"
          className="w-10 h-10 mx-auto mb-3 text-midnight_text/20 dark:text-white/20"
        />
        <p className="text-base text-dark/50 dark:text-white/50">
          Aucun utilisateur pour l'instant.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-darkborder">
        <thead className="bg-grey dark:bg-darkmode">
          <tr>
            {["Nom", "Email", "Rôle", "Statut", "Actions"].map((col) => (
              <th
                key={col}
                className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-midnight_text/50 dark:text-white/40"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-darkborder">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-grey dark:hover:bg-darkmode/50 duration-200"
            >
              {/* Name + initials */}
              <td className="px-5 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-base font-medium text-midnight_text dark:text-white">
                    {user.name}
                  </span>
                </div>
              </td>

              {/* Email */}
              <td className="px-5 py-4 whitespace-nowrap text-base text-dark/50 dark:text-white/50">
                {user.email}
              </td>

              {/* Role badge */}
              <td className="px-5 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    user.role === "ADMIN"
                      ? "bg-primary/10 text-primary"
                      : "bg-blue/10 text-blue"
                  }`}
                >
                  {user.role}
                </span>
              </td>

              {/* Status badge */}
              <td className="px-5 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    user.isActive
                      ? "bg-success/10 text-success"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      user.isActive ? "bg-success" : "bg-red-500"
                    }`}
                  />
                  {user.isActive ? "Actif" : "Inactif"}
                </span>
              </td>

              {/* Actions */}
              <td className="px-5 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1">
                  {/* Edit */}
                  <button
                    onClick={() => onEdit(user)}
                    title="Modifier"
                    className="p-1.5 rounded-lg text-midnight_text/40 dark:text-white/40 hover:text-primary dark:hover:text-primary hover:bg-primary/5 duration-200"
                  >
                    <Icon
                      icon="heroicons:pencil-square-20-solid"
                      className="w-4 h-4"
                    />
                  </button>

                  {/* Toggle active */}
                  <button
                    onClick={() => onToggle(user.id)}
                    title={user.isActive ? "Désactiver" : "Activer"}
                    className={`p-1.5 rounded-lg duration-200 ${
                      user.isActive
                        ? "text-midnight_text/40 dark:text-white/40 hover:text-primary hover:bg-primary/5"
                        : "text-midnight_text/40 dark:text-white/40 hover:text-success hover:bg-success/5"
                    }`}
                  >
                    <Icon
                      icon={
                        user.isActive
                          ? "heroicons:pause-circle-20-solid"
                          : "heroicons:play-circle-20-solid"
                      }
                      className="w-4 h-4"
                    />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDelete(user.id)}
                    title="Supprimer"
                    className="p-1.5 rounded-lg text-midnight_text/40 dark:text-white/40 hover:text-red-500 hover:bg-red-500/5 duration-200"
                  >
                    <Icon icon="heroicons:trash-20-solid" className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReglagesPage() {
  const [users, setUsers] = useState<UserRow[]>(INITIAL_USERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);

  // TODO: replace with API call → POST /api/users  or  PATCH /api/users/:id
  function handleSave(data: UserFormData, id?: string) {
    if (id) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...data } : u)),
      );
      toast.success("Utilisateur mis à jour.");
    } else {
      const newUser: UserRow = { id: generateId(), ...data };
      setUsers((prev) => [newUser, ...prev]);
      toast.success("Utilisateur créé.");
    }
  }

  function openCreate() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEdit(user: UserRow) {
    setEditTarget(user);
    setModalOpen(true);
  }

  // TODO: replace with API call → PATCH /api/users/:id  (toggle isActive)
  function handleToggle(id: string) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const next = { ...u, isActive: !u.isActive };
        toast(
          next.isActive ? "Utilisateur activé." : "Utilisateur désactivé.",
          {
            icon: next.isActive ? "✅" : "⛔",
          },
        );
        return next;
      }),
    );
  }

  // TODO: replace with API call → DELETE /api/users/:id  (+confirmation dialog)
  function handleDelete(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.error("Utilisateur supprimé.");
  }

  return (
    <>
      <Toaster position="top-right" />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-midnight_text dark:text-white">
            Gestion des utilisateurs
          </h2>
          <p className="text-base text-dark/50 dark:text-white/50 mt-1">
            {users.length} utilisateur{users.length !== 1 ? "s" : ""} enregistré
            {users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 w-fit px-6 py-3 text-base font-medium text-white bg-primary hover:bg-orange-600 duration-300 rounded-lg"
        >
          <Icon icon="heroicons:plus-20-solid" className="w-5 h-5" />
          Créer un utilisateur
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow overflow-hidden">
        <UsersTable
          users={users}
          onEdit={openEdit}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal */}
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editTarget}
        onSave={handleSave}
      />
    </>
  );
}
