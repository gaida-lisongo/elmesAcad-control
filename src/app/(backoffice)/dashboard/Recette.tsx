"use client";

import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "./Depense";
import DetailRecette from "./DetailRecette";

type RecetteRow = {
  id: string;
  client: string;
  amount: string;
  type: string;
  date: string;
  status: string;
  student?: string;
  classe?: string;
  reference?: string;
  orderNumber?: string;
};

const statusLabels: Record<string, string> = {
  completed: "succès",
  pending: "en attente",
  failed: "échoué",
};

export default function Recette({
  cols,
  data,
}: {
  cols: string[];
  data: RecetteRow[];
}) {
  const [rows, setRows] = useState<RecetteRow[]>(data);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setRows(data);
  }, [data]);

  const clients = useMemo(() => {
    const unique = new Set(rows.map((r) => r.client).filter(Boolean));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rows.filter((row) => {
      const matchSearch = term
        ? `${row.student ?? ""} ${row.classe ?? ""}`
            .toLowerCase()
            .includes(term)
        : true;
      const matchClient = filterClient ? row.client === filterClient : true;
      const matchStatus = filterStatus ? row.status === filterStatus : true;
      return matchSearch && matchClient && matchStatus;
    });
  }, [rows, searchTerm, filterClient, filterStatus]);

  const handleStatusUpdated = (recetteId: string, status: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === recetteId
          ? {
              ...row,
              status,
            }
          : row,
      ),
    );
  };

  return (
    <div className="col-span-12 bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-gray-200 dark:border-darkborder">
        <div>
          <h4 className="text-midnight_text dark:text-white">
            Transactions récentes
          </h4>
          {rows.length === 0 && (
            <span className="text-sm text-dark/40 dark:text-white/30 italic">
              Aucune transaction
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Rechercher par classe ou élève"
            className="h-10 w-60 rounded-xl border border-gray-200 bg-white px-3 text-sm text-midnight_text shadow-sm focus:border-primary focus:outline-none dark:border-darkborder dark:bg-darkmode dark:text-white"
          />
          <select
            value={filterClient}
            onChange={(event) => setFilterClient(event.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-midnight_text shadow-sm focus:border-primary focus:outline-none dark:border-darkborder dark:bg-darkmode dark:text-white"
          >
            <option value="">Tous les clients</option>
            {clients.map((client) => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-midnight_text shadow-sm focus:border-primary focus:outline-none dark:border-darkborder dark:bg-darkmode dark:text-white"
          >
            <option value="">Tous les statuts</option>
            <option value="completed">Complété</option>
            <option value="pending">En attente</option>
            <option value="failed">Echoué</option>
          </select>
        </div>
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
            {filteredRows.length > 0 ? (
              filteredRows.map((t) => (
                <tr
                  key={t.id}
                  className="cursor-pointer hover:bg-grey dark:hover:bg-darkmode/50 duration-200"
                  onClick={() => setSelectedId(t.id)}
                >
                  <td className="px-5 py-3.5 whitespace-nowrap text-base font-medium text-midnight_text dark:text-white">
                    {t.client}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-base font-semibold text-midnight_text dark:text-white">
                    {t.amount}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-base text-dark/50 dark:text-white/50">
                    {t.type}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm text-dark/50 dark:text-white/50">
                    {t.date}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <StatusBadge status={statusLabels[t.status] || t.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={cols.length}
                  className="px-5 py-8 text-center text-dark/50 dark:text-white/50"
                >
                  Aucune transaction pour le moment
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-card-shadow dark:border-darkborder dark:bg-darklight"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-darkborder">
              <h4 className="text-midnight_text dark:text-white">
                Détails de la recette
              </h4>
              <button
                onClick={() => setSelectedId(null)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-midnight_text transition hover:border-primary hover:text-primary dark:border-darkborder dark:text-white"
              >
                Fermer
              </button>
            </div>
            <div className="p-6">
              <DetailRecette
                recetteId={selectedId}
                onStatusUpdated={handleStatusUpdated}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
