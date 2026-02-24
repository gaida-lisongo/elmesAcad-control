"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast, { Toaster } from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CommandeProduct {
  _id: string;
  category: string;
  student: string;
  classe: string;
  amount: number;
  orderNumber: string;
  phone: string;
  status: "pending" | "completed" | "failed";
  reference: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalCommandes: number;
  totalRevenu: number;
  categories: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  byStatus: {
    pending: number;
    completed: number;
    failed: number;
  };
}

// ─── Helper Functions ─────────────────────────────────────────────────────────
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return { icon: "heroicons:check-circle-20-solid", color: "text-success", label: "Complétée" };
    case "pending":
      return { icon: "heroicons:clock-20-solid", color: "text-warning", label: "En attente" };
    case "failed":
      return { icon: "heroicons:x-circle-20-solid", color: "text-red-500", label: "Échouée" };
    default:
      return { icon: "heroicons:question-mark-circle-20-solid", color: "text-gray-500", label: "Inconnu" };
  }
};

const getStatusBg = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-success/10";
    case "pending":
      return "bg-warning/10";
    case "failed":
      return "bg-red-500/10";
    default:
      return "bg-gray-100";
  }
};

// ─── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-darklight rounded-2xl p-6 border border-gray-200 dark:border-darkborder shadow-card-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-dark/50 dark:text-white/50">{label}</p>
          <h3 className="text-2xl font-bold text-midnight_text dark:text-white mt-2">
            {value}
          </h3>
        </div>
        <div className={`${color} rounded-full p-4`}>
          <Icon icon={icon} width="28" height="28" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const [commandes, setCommandes] = useState<CommandeProduct[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "category">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // ── Fetch transactions ───────────────────────────────────────────────────
  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      setLoading(true);
      const response = await fetch("/api/transactions/client");

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des transactions");
      }

      const result = await response.json();

      if (result.success) {
        setCommandes(result.data || []);
        setStats(result.stats || null);
      } else {
        toast.error(result.error || "Erreur lors du chargement");
      }
    } catch (error: any) {
      console.error("❌ Error fetching transactions:", error);
      toast.error(error.message || "Erreur lors du chargement des transactions");
    } finally {
      setLoading(false);
    }
  }

  // ── Filter and sort data ────────────────────────────────────────────────
  const filteredCommandes = commandes
    .filter((cmd) => {
      const matchSearch =
        cmd.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cmd.classe.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cmd.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = !filterCategory || cmd.category === filterCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      let compareValue = 0;

      if (sortBy === "date") {
        compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "amount") {
        compareValue = a.amount - b.amount;
      } else if (sortBy === "category") {
        compareValue = a.category.localeCompare(b.category);
      }

      return sortOrder === "desc" ? -compareValue : compareValue;
    });

  // Get unique categories
  const uniqueCategories = Array.from(new Set(commandes.map((c) => c.category)));

  return (
    <>
      <Toaster position="top-right" />

      <div className="space-y-8">
        {/* ─── Header ────────────────────────────────────────────── */}
        <div>
          <h1 className="text-3xl font-bold text-midnight_text dark:text-white">
            Transactions
          </h1>
          <p className="text-dark/50 dark:text-white/50 mt-2">
            Consultez l'historique complet de vos ventes
          </p>
        </div>

        {/* ─── Stats Grid ────────────────────────────────────────── */}
        {stats && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Total des ventes"
              value={stats.totalCommandes}
              icon="heroicons:shopping-cart-20-solid"
              color="bg-primary/10 text-primary"
            />
            <StatCard
              label="Revenu total"
              value={formatAmount(stats.totalRevenu)}
              icon="heroicons:banknotes-20-solid"
              color="bg-success/10 text-success"
            />
            <StatCard
              label="En attente"
              value={stats.byStatus.pending}
              icon="heroicons:clock-20-solid"
              color="bg-warning/10 text-warning"
            />
            <StatCard
              label="Complétées"
              value={stats.byStatus.completed}
              icon="heroicons:check-circle-20-solid"
              color="bg-success/10 text-success"
            />
          </div>
        )}

        {/* ─── Filters & Search ────────────────────────────────── */}
        <div className="bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-semibold text-midnight_text dark:text-white mb-3">
                Rechercher
              </label>
              <div className="relative">
                <Icon
                  icon="heroicons:magnifying-glass-20-solid"
                  width="20"
                  height="20"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Étudiant, classe ou commande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-200 focus:border-primary dark:border-darkborder dark:focus:border-primary rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode placeholder:text-[#668199]"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-midnight_text dark:text-white mb-3">
                Catégorie
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 focus:border-primary dark:border-darkborder dark:focus:border-primary rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode"
              >
                <option value="">Toutes les catégories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-midnight_text dark:text-white mb-3">
                Trier par
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-200 focus:border-primary dark:border-darkborder dark:focus:border-primary rounded-lg w-full focus:outline-none text-midnight_text dark:text-white dark:bg-darkmode"
              >
                <option value="date">Date</option>
                <option value="amount">Montant</option>
                <option value="category">Catégorie</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-semibold text-midnight_text dark:text-white mb-3">
                Ordre
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortOrder("desc")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    sortOrder === "desc"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 dark:bg-darkmode dark:text-white border border-gray-200 dark:border-darkborder"
                  }`}
                >
                  Desc
                </button>
                <button
                  onClick={() => setSortOrder("asc")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    sortOrder === "asc"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 dark:bg-darkmode dark:text-white border border-gray-200 dark:border-darkborder"
                  }`}
                >
                  Asc
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Data Table ────────────────────────────────────────── */}
        <div className="bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <Icon
                  icon="heroicons:arrow-path-20-solid"
                  width="32"
                  height="32"
                  className="text-primary animate-spin"
                />
                <p className="text-dark/50 dark:text-white/50">Chargement...</p>
              </div>
            </div>
          ) : filteredCommandes.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Icon
                  icon="heroicons:shopping-cart-20-solid"
                  width="48"
                  height="48"
                  className="text-gray-300 mx-auto mb-4"
                />
                <p className="text-dark/50 dark:text-white/50">
                  {commandes.length === 0 ? "Aucune transaction pour le moment" : "Aucune transaction ne correspond aux critères"}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-darkborder bg-gray-50 dark:bg-darkmode">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-midnight_text dark:text-white">
                      Étudiant
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-midnight_text dark:text-white">
                      Classe
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-midnight_text dark:text-white">
                      Catégorie
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-midnight_text dark:text-white">
                      Montant
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-midnight_text dark:text-white">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-midnight_text dark:text-white">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommandes.map((cmd) => {
                    const statusInfo = getStatusIcon(cmd.status);
                    return (
                      <tr
                        key={cmd._id}
                        className="border-b border-gray-200 dark:border-darkborder hover:bg-gray-50 dark:hover:bg-darkmode/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-midnight_text dark:text-white font-medium">
                          {cmd.student}
                        </td>
                        <td className="px-6 py-4 text-sm text-dark/70 dark:text-white/70">
                          {cmd.classe}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            {cmd.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-midnight_text dark:text-white">
                          {formatAmount(cmd.amount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusBg(cmd.status)}`}
                          >
                            <Icon
                              icon={statusInfo.icon}
                              width="16"
                              height="16"
                              className={statusInfo.color}
                            />
                            <span
                              className={`text-xs font-medium ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-dark/70 dark:text-white/70">
                          {formatDate(cmd.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── Footer info ────────────────────────────────────── */}
          {!loading && filteredCommandes.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-darkborder bg-gray-50 dark:bg-darkmode">
              <p className="text-sm text-dark/50 dark:text-white/50">
                Affichage de {filteredCommandes.length} transaction{filteredCommandes.length !== 1 ? "s" : ""} sur {commandes.length} au total
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
