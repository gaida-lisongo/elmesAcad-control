import { Icon } from "@iconify/react";
import { StatItem } from "./page";
// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, delta, positive, icon, color }: StatItem) {
  return (
    <div className="bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow p-6 flex items-center gap-5">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon icon={icon} className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-dark/50 dark:text-white/40 font-medium truncate">
          {label}
        </p>
        <p className="text-2xl font-bold text-midnight_text dark:text-white leading-tight mt-0.5">
          {value}
        </p>
        <p
          className={`text-xs mt-0.5 font-medium ${positive ? "text-success" : "text-red-500"}`}
        >
          {delta}
        </p>
      </div>
    </div>
  );
}

export default function KPI({ data }: { data: StatItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {data.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
