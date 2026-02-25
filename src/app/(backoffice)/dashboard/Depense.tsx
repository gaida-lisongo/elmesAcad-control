export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    actif: "bg-success/10 text-success",
    inactif: "bg-red-500/10 text-red-500",
    succès: "bg-success/10 text-success",
    "en attente": "bg-primary/10 text-primary",
    échoué: "bg-red-500/10 text-red-500",
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
  isAdmin = false,
}: {
  cols: string[];
  data: any[];
  isAdmin?: boolean;
}) {
  return (
    <div className="col-span-12 xl:col-span-8 bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-darkborder">
        <h4 className="text-midnight_text dark:text-white">
          {isAdmin ? "Clients actifs" : "Informations"}
        </h4>
        {data.length === 0 && (
          <span className="text-sm text-dark/40 dark:text-white/30 italic">
            {isAdmin ? "Aucun client" : "N/A"}
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
              data.map((c: any) => (
                <tr
                  key={c.id || c._id}
                  className="hover:bg-grey dark:hover:bg-darkmode/50 duration-200"
                >
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {c.nomComplet?.charAt(0) || c.nom?.charAt(0) || "?"}
                      </span>
                      <span className="text-base font-medium text-midnight_text dark:text-white">
                        {c.nomComplet || c.nom}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-base text-dark/50 dark:text-white/50 whitespace-nowrap">
                    {c.email}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-sm font-medium text-midnight_text dark:text-white">
                      {c.plan || c.uuid || "N/A"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <StatusBadge status={c.status ?? c.isActive ?? true} />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-dark/50 dark:text-white/50 whitespace-nowrap">
                    {c.joined ||
                      new Date(c.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={cols.length}
                  className="px-5 py-8 text-center text-dark/50 dark:text-white/50"
                >
                  {isAdmin
                    ? "Aucun client actif pour le moment"
                    : "Pas de données disponibles"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
