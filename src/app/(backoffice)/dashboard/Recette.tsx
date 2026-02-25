import { StatusBadge } from "./Depense";

export default function Recette({
  cols,
  data,
}: {
  cols: string[];
  data: any[];
}) {
  return (
    <div className="col-span-12 bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-darkborder">
        <h4 className="text-midnight_text dark:text-white">
          Transactions récentes
        </h4>
        {data.length === 0 && (
          <span className="text-sm text-dark/40 dark:text-white/30 italic">
            Aucune transaction
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
              data.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-grey dark:hover:bg-darkmode/50 duration-200"
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
                    <StatusBadge status={t.status} />
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
    </div>
  );
}
