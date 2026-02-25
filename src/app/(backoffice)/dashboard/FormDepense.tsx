"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { ActivityItem } from "./page";
import { useAuthStore } from "@/store/authStore";
import { createWithdrawal } from "@/lib/actions/dashboard-actions";

export default function FormDepense({
  activityFeed,
  balance,
  userId,
  userRole,
}: {
  activityFeed: ActivityItem[];
  balance: number;
  userId: string;
  userRole: "admin" | "client";
}) {
  const { user } = useAuthStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    phone: "",
    reference: "",
    description: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const canWithdraw = balance > 0;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const amount = parseFloat(formData.amount);

      if (isNaN(amount) || amount <= 0) {
        setMessageType("error");
        setMessage("Montant invalide");
        setIsLoading(false);
        return;
      }

      if (amount > balance) {
        setMessageType("error");
        setMessage("Montant supérieur au solde disponible");
        setIsLoading(false);
        return;
      }

      const result = await createWithdrawal(
        userId,
        userRole,
        amount,
        formData.phone,
        formData.reference,
        formData.description,
      );

      if (result.success) {
        setMessageType("success");
        setMessage("Retrait créé avec succès!");
        setFormData({ amount: "", phone: "", reference: "", description: "" });
        // Reload dashboard data after creating withdrawal
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessageType("error");
        setMessage(result.message || "Erreur lors de la création du retrait");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="col-span-12 xl:col-span-4 space-y-6">
      {/* Balance Card */}
      <div className="bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-midnight_text dark:text-white">
            Solde disponible
          </h4>
          <Icon
            icon="heroicons:wallet-20-solid"
            className="w-6 h-6 text-primary"
          />
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-3xl font-bold text-midnight_text dark:text-white">
              ${balance.toFixed(2)}
            </p>
            <p className="text-sm text-dark/50 dark:text-white/50 mt-2">
              {canWithdraw
                ? "Vous pouvez effectuer un retrait"
                : "Solde insuffisant pour effectuer un retrait"}
            </p>
          </div>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            type="button"
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
          >
            {isFormOpen ? "Masquer formulaire" : "Créer un retrait"}
          </button>
        </div>
      </div>

      {/* Withdrawal Form */}
      {isFormOpen && (
        <div className="bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow p-6">
          <h4 className="text-midnight_text dark:text-white mb-4">
            Nouveau retrait
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-midnight_text dark:text-white mb-1">
                Montant (USD)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                max={balance}
                className="w-full px-3 py-2 border border-gray-200 dark:border-darkborder rounded-lg bg-white dark:bg-darkmode text-midnight_text dark:text-white focus:outline-none focus:border-primary disabled:opacity-50"
                required
                disabled={isLoading || !canWithdraw}
              />
              <p className="text-xs text-dark/50 dark:text-white/50 mt-1">
                Max: ${balance.toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-midnight_text dark:text-white mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+243..."
                className="w-full px-3 py-2 border border-gray-200 dark:border-darkborder rounded-lg bg-white dark:bg-darkmode text-midnight_text dark:text-white focus:outline-none focus:border-primary disabled:opacity-50"
                required
                disabled={isLoading || !canWithdraw}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-midnight_text dark:text-white mb-1">
                Référence
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                placeholder="REF-001"
                className="w-full px-3 py-2 border border-gray-200 dark:border-darkborder rounded-lg bg-white dark:bg-darkmode text-midnight_text dark:text-white focus:outline-none focus:border-primary disabled:opacity-50"
                required
                disabled={isLoading || !canWithdraw}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-midnight_text dark:text-white mb-1">
                Description (optionnel)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description du retrait..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 dark:border-darkborder rounded-lg bg-white dark:bg-darkmode text-midnight_text dark:text-white focus:outline-none focus:border-primary resize-none disabled:opacity-50"
                disabled={isLoading || !canWithdraw}
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  messageType === "success"
                    ? "bg-success/10 text-success"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !canWithdraw}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              title={!canWithdraw ? "Solde insuffisant" : ""}
            >
              {isLoading ? "Traitement..." : "Créer le retrait"}
            </button>
          </form>
        </div>
      )}

      {/* Activity Feed */}
      <div className="bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-darkborder">
          <h4 className="text-midnight_text dark:text-white">
            Activité récente
          </h4>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-darkborder">
          {activityFeed.length > 0 ? (
            activityFeed.map((item) => (
              <li key={item.id} className="flex items-start gap-4 px-6 py-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${item.color}`}
                >
                  <Icon icon={item.icon} className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-midnight_text dark:text-white leading-snug">
                    {item.text}
                  </p>
                  <p className="text-xs text-dark/40 dark:text-white/30 mt-0.5">
                    {item.time}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-4 text-center text-dark/50 dark:text-white/50 text-sm">
              Aucune activité
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
