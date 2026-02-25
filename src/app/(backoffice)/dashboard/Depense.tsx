"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { confirmWithdrawal } from "@/lib/actions/dashboard-actions";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    actif: "bg-success/10 text-success",
    inactif: "bg-red-500/10 text-red-500",
    succès: "bg-success/10 text-success",
    "en attente": "bg-primary/10 text-primary",
    échoué: "bg-red-500/10 text-red-500",
    completed: "bg-success/10 text-success",
    pending: "bg-primary/10 text-primary",
    failed: "bg-red-500/10 text-red-500",
    true: "bg-success/10 text-success",
    false: "bg-red-500/10 text-red-500",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[status] ?? "bg-grey text-dark"}`}
    >
      {typeof status === "boolean" ? (status ? "Actif" : "Inactif") : status}
    </span>
  );
}

export default function Depense({
  cols,
  data,
  userRole = "client",
}: {
  cols: string[];
  data: any[];
  userRole?: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleConfirmWithdrawal = async (withdrawal: any) => {
    if (withdrawal.status === "completed") return;

    setLoading(withdrawal.id || withdrawal._id);
    setMessage("");

    try {
      const result = await confirmWithdrawal(
        withdrawal.id || withdrawal._id,
        userRole as "admin" | "client",
        parseFloat(withdrawal.amount.replace("$", "")),
        withdrawal.phone,
        withdrawal.reference,
      );

      if (result.success) {
        setMessageType("success");
        setMessage("Retrait confirmé avec succès!");
        // Reload after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessageType("error");
        setMessage(result.message || "Erreur lors de la confirmation");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Une erreur est survenue");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="col-span-12 xl:col-span-8 bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-darkborder">
        <h4 className="text-midnight_text dark:text-white">
          10 dernières dépenses
        </h4>
        {data.length === 0 && (
          <span className="text-sm text-dark/40 dark:text-white/30 italic">
            Aucune dépense
          </span>
        )}
      </div>

      {message && (
        <div
          className={`px-6 py-3 text-sm ${
            messageType === "success"
              ? "bg-success/10 text-success"
              : "bg-red-500/10 text-red-500"
          }`}
        >
          {message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-darkborder">
          <thead className="bg-grey dark:bg-darkmode">
            <tr>
              {cols.map((col) => (
                <th
                  key={col}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-midnight_text/50 dark:text-white/40"
                >
                  {col}
                </th>
              ))}
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-midnight_text/50 dark:text-white/40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-darkborder">
            {data.length > 0 ? (
              data.map((w: any) => (
                <tr
                  key={w.id || w._id}
                  className="hover:bg-grey dark:hover:bg-darkmode/50 duration-200"
                >
                  <td className="px-5 py-3.5 whitespace-nowrap text-base font-medium text-midnight_text dark:text-white">
                    {w.reference}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-base font-semibold text-midnight_text dark:text-white">
                    {w.amount}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-base text-dark/50 dark:text-white/50">
                    {w.phone}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm text-dark/50 dark:text-white/50">
                    {w.date}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <StatusBadge status={w.status} />
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {w.status !== "completed" && (
                      <button
                        onClick={() => handleConfirmWithdrawal(w)}
                        disabled={loading === (w.id || w._id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                        title="Confirmer ce retrait via FlexPay"
                      >
                        <Icon
                          icon="heroicons:check-20-solid"
                          className="w-4 h-4"
                        />
                        {loading === (w.id || w._id) ? "..." : "Confirmer"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={cols.length + 1}
                  className="px-5 py-8 text-center text-dark/50 dark:text-white/50"
                >
                  Aucune dépense pour le moment
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
