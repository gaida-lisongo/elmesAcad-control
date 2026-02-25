"use client";
import { Icon } from "@iconify/react";

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
}: {
  cols: string[];
  data: any[];
}) {
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
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={cols.length}
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
