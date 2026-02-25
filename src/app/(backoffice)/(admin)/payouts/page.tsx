"use client";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import {
  getAllWithdraws,
  getWithdrawsStats,
  validateWithdraw,
} from "@/lib/actions/payouts-actions";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";

export default function PayoutsPage() {
  const [stats, setStats] = useState({
    totalPending: 0,
    totalCompleted: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });
  const [pendingWithdraws, setPendingWithdraws] = useState<any[]>([]);
  const [completedWithdraws, setCompletedWithdraws] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<"pending" | "completed">(
    "pending",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const user = useAuthStore((state) => state.user);

  const loadData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [statsData, pending, completed] = await Promise.all([
        getWithdrawsStats(),
        getAllWithdraws("pending", 50),
        getAllWithdraws("completed", 50),
      ]);

      setStats(statsData);
      setPendingWithdraws(pending);
      setCompletedWithdraws(completed);
    } catch (err) {
      setError("Une erreur est survenue lors du chargement des données");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async (withdrawId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir valider ce retrait?")) return;

    setValidatingId(withdrawId);
    setMessage("");
    setMessageType("");

    try {
      const result = await validateWithdraw(withdrawId);

      if (result.success) {
        setMessageType("success");
        setMessage("Retrait validé et facture envoyée avec succès!");
        // Reload data
        await loadData();
      } else {
        setMessageType("error");
        setMessage(result.message || "Erreur lors de la validation");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Une erreur est survenue");
    } finally {
      setValidatingId(null);
    }
  };

  useEffect(() => {
    if (user && user.role === "client") {
      setError("Accès non autorisé");
      setIsLoading(false);
      return;
    }
    loadData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon
            icon="heroicons:arrow-path"
            className="w-8 h-8 text-primary animate-spin mx-auto mb-2"
          />
          <p className="text-midnight_text dark:text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  const currentWithdraws =
    selectedTab === "pending" ? pendingWithdraws : completedWithdraws;
  const canValidate = user?.role === "admin";

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-midnight_text dark:text-white">
          Gestion des Retraits
        </h1>
        <p className="text-dark/60 dark:text-white/60 mt-2">
          Validation et suivi des demandes de retrait
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${
            messageType === "success"
              ? "bg-success/10 text-success"
              : "bg-red-500/10 text-red-500"
          }`}
        >
          {message}
        </div>
      )}

      {error && !isLoading && (
        <div className="p-4 rounded-lg text-sm bg-red-500/10 text-red-500">
          {error}
        </div>
      )}

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-darklight rounded-2xl p-4 border border-gray-200 dark:border-darkborder">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon icon="heroicons:clock" className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-dark/60 dark:text-white/60">
              En attente
            </p>
          </div>
          <p className="text-2xl font-bold text-midnight_text dark:text-white">
            {stats.totalPending}
          </p>
        </div>

        <div className="bg-white dark:bg-darklight rounded-2xl p-4 border border-gray-200 dark:border-darkborder">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Icon
                icon="heroicons:check-circle"
                className="w-5 h-5 text-success"
              />
            </div>
            <p className="text-sm text-dark/60 dark:text-white/60">Validés</p>
          </div>
          <p className="text-2xl font-bold text-midnight_text dark:text-white">
            {stats.totalCompleted}
          </p>
        </div>

        <div className="bg-white dark:bg-darklight rounded-2xl p-4 border border-gray-200 dark:border-darkborder">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon
                icon="heroicons:currency-dollar"
                className="w-5 h-5 text-primary"
              />
            </div>
            <p className="text-sm text-dark/60 dark:text-white/60">
              Montant en attente
            </p>
          </div>
          <p className="text-2xl font-bold text-primary">
            ${stats.pendingAmount.toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-darklight rounded-2xl p-4 border border-gray-200 dark:border-darkborder">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Icon
                icon="heroicons:currency-dollar"
                className="w-5 h-5 text-success"
              />
            </div>
            <p className="text-sm text-dark/60 dark:text-white/60">
              Montant total
            </p>
          </div>
          <p className="text-2xl font-bold text-success">
            ${stats.totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2">
        <button
          onClick={() => setSelectedTab("pending")}
          className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            selectedTab === "pending"
              ? "bg-primary text-white"
              : "bg-white dark:bg-darkmode text-midnight_text dark:text-white border border-gray-200 dark:border-darkborder hover:border-primary"
          }`}
        >
          <Icon icon="heroicons:clock" className="w-4 h-4" />
          En attente ({stats.totalPending})
        </button>
        <button
          onClick={() => setSelectedTab("completed")}
          className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            selectedTab === "completed"
              ? "bg-success text-white"
              : "bg-white dark:bg-darkmode text-midnight_text dark:text-white border border-gray-200 dark:border-darkborder hover:border-success"
          }`}
        >
          <Icon icon="heroicons:check-circle" className="w-4 h-4" />
          Validés ({stats.totalCompleted})
        </button>
      </div>

      {/* Liste des retraits */}
      <div className="bg-white dark:bg-darklight rounded-2xl border border-gray-200 dark:border-darkborder overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-darkborder">
            <thead className="bg-grey dark:bg-darkmode">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-midnight_text/50 dark:text-white/40">
                  Client
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-midnight_text/50 dark:text-white/40">
                  Package
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-midnight_text/50 dark:text-white/40">
                  Montant
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-midnight_text/50 dark:text-white/40">
                  Téléphone
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-midnight_text/50 dark:text-white/40">
                  Référence
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-midnight_text/50 dark:text-white/40">
                  Date
                </th>
                {canValidate && selectedTab === "pending" && (
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-midnight_text/50 dark:text-white/40">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-darkborder">
              {currentWithdraws.length > 0 ? (
                currentWithdraws.map((withdraw: any) => (
                  <tr
                    key={withdraw._id}
                    className="hover:bg-grey dark:hover:bg-darkmode/50 duration-200"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {withdraw.accountId?.clientId?.logo ? (
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                            <Image
                              src={withdraw.accountId.clientId.logo}
                              alt={withdraw.accountId.clientId.nomComplet}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon
                              icon="heroicons:user"
                              className="w-4 h-4 text-primary"
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-midnight_text dark:text-white">
                            {withdraw.accountId?.clientId?.nomComplet || "N/A"}
                          </p>
                          <p className="text-xs text-dark/50 dark:text-white/50">
                            {withdraw.accountId?.clientId?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-dark/70 dark:text-white/70">
                      {withdraw.accountId?.packageId?.titre || "N/A"}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-base font-semibold text-midnight_text dark:text-white">
                      ${withdraw.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-dark/50 dark:text-white/50">
                      {withdraw.phone}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-dark/50 dark:text-white/50">
                      {withdraw.reference}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-dark/50 dark:text-white/50">
                      {new Date(withdraw.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    {canValidate && selectedTab === "pending" && (
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleValidate(withdraw._id)}
                          disabled={validatingId === withdraw._id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                        >
                          <Icon
                            icon={
                              validatingId === withdraw._id
                                ? "heroicons:arrow-path"
                                : "heroicons:check-20-solid"
                            }
                            className={`w-4 h-4 ${validatingId === withdraw._id ? "animate-spin" : ""}`}
                          />
                          {validatingId === withdraw._id
                            ? "Validation..."
                            : "Valider"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={canValidate && selectedTab === "pending" ? 7 : 6}
                    className="px-5 py-8 text-center text-dark/50 dark:text-white/50"
                  >
                    Aucun retrait{" "}
                    {selectedTab === "pending" ? "en attente" : "validé"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
