"use client";

import { Icon } from "@iconify/react";

// ─── Fake data — TODO: replace with real API calls ────────────────────────────

const STATS = [
  {
    label: "Clients actifs",
    value: "142",
    delta: "+12 ce mois",
    positive: true,
    icon: "heroicons:users-20-solid",
    color: "bg-primary/10 text-primary",
  },
  {
    label: "Transactions",
    value: "1 840",
    delta: "+230 ce mois",
    positive: true,
    icon: "heroicons:arrows-right-left-20-solid",
    color: "bg-blue/10 text-blue",
  },
  {
    label: "Revenus (USD)",
    value: "$24 500",
    delta: "+8,4 %",
    positive: true,
    icon: "heroicons:banknotes-20-solid",
    color: "bg-success/10 text-success",
  },
  {
    label: "Factures en attente",
    value: "17",
    delta: "-3 depuis hier",
    positive: false,
    icon: "heroicons:document-text-20-solid",
    color: "bg-red-500/10 text-red-500",
  },
];

const RECENT_CLIENTS = [
  {
    id: "c1",
    nom: "Acme Corp",
    email: "billing@acme.io",
    plan: "Pro",
    status: "actif",
    joined: "20 fév. 2026",
  },
  {
    id: "c2",
    nom: "Globex Ltd",
    email: "admin@globex.com",
    plan: "Starter",
    status: "actif",
    joined: "19 fév. 2026",
  },
  {
    id: "c3",
    nom: "Initech SA",
    email: "contact@initech.cd",
    plan: "Pro",
    status: "inactif",
    joined: "15 fév. 2026",
  },
  {
    id: "c4",
    nom: "Umbrella Inc",
    email: "ops@umbrella.com",
    plan: "Enterprise",
    status: "actif",
    joined: "10 fév. 2026",
  },
  {
    id: "c5",
    nom: "Soylent NV",
    email: "hello@soylent.be",
    plan: "Starter",
    status: "actif",
    joined: "8 fév. 2026",
  },
];

const RECENT_TRANSACTIONS = [
  {
    id: "t1",
    client: "Acme Corp",
    amount: "$1 200",
    type: "Paiement",
    date: "22 fév.",
    status: "succès",
  },
  {
    id: "t2",
    client: "Globex Ltd",
    amount: "$340",
    type: "Paiement",
    date: "21 fév.",
    status: "succès",
  },
  {
    id: "t3",
    client: "Umbrella Inc",
    amount: "$4 800",
    type: "Paiement",
    date: "21 fév.",
    status: "succès",
  },
  {
    id: "t4",
    client: "Initech SA",
    amount: "$600",
    type: "Remboursement",
    date: "20 fév.",
    status: "en attente",
  },
  {
    id: "t5",
    client: "Soylent NV",
    amount: "$220",
    type: "Paiement",
    date: "19 fév.",
    status: "échoué",
  },
];

const ACTIVITY_FEED = [
  {
    id: 1,
    icon: "heroicons:user-plus-20-solid",
    color: "text-primary bg-primary/10",
    text: "Nouveau client : Acme Corp",
    time: "Il y a 2 h",
  },
  {
    id: 2,
    icon: "heroicons:banknotes-20-solid",
    color: "text-success bg-success/10",
    text: "Paiement reçu : $1 200 — Acme Corp",
    time: "Il y a 3 h",
  },
  {
    id: 3,
    icon: "heroicons:document-text-20-solid",
    color: "text-blue bg-blue/10",
    text: "Facture #F-0084 générée",
    time: "Il y a 5 h",
  },
  {
    id: 4,
    icon: "heroicons:exclamation-triangle-20-solid",
    color: "text-red-500 bg-red-500/10",
    text: "Transaction échouée — Initech SA",
    time: "Hier",
  },
  {
    id: 5,
    icon: "heroicons:arrow-path-20-solid",
    color: "text-primary bg-primary/10",
    text: "Remboursement traité : $600",
    time: "Hier",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  delta,
  positive,
  icon,
  color,
}: (typeof STATS)[0]) {
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    actif: "bg-success/10 text-success",
    inactif: "bg-red-500/10 text-red-500",
    succès: "bg-success/10 text-success",
    "en attente": "bg-primary/10 text-primary",
    échoué: "bg-red-500/10 text-red-500",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[status] ?? "bg-grey text-dark"}`}
    >
      {status}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-midnight_text dark:text-white">Tableau de bord</h2>
        <p className="text-base text-dark/50 dark:text-white/50 mt-1">
          Vue d&apos;ensemble de votre activité — données simulées
        </p>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Main grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">
        {/* Recent clients table */}
        <div className="col-span-12 xl:col-span-8 bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-darkborder">
            <h4 className="text-midnight_text dark:text-white">
              Clients récents
            </h4>
            <span className="text-sm text-dark/40 dark:text-white/30 italic">
              Données simulées
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkborder">
              <thead className="bg-grey dark:bg-darkmode">
                <tr>
                  {["Client", "Email", "Plan", "Statut", "Rejoint le"].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-midnight_text/50 dark:text-white/40"
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-darkborder">
                {RECENT_CLIENTS.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-grey dark:hover:bg-darkmode/50 duration-200"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {c.nom.charAt(0)}
                        </span>
                        <span className="text-base font-medium text-midnight_text dark:text-white">
                          {c.nom}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-base text-dark/50 dark:text-white/50 whitespace-nowrap">
                      {c.email}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-sm font-medium text-midnight_text dark:text-white">
                        {c.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-dark/50 dark:text-white/50 whitespace-nowrap">
                      {c.joined}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity feed */}
        <div className="col-span-12 xl:col-span-4 bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-darkborder">
            <h4 className="text-midnight_text dark:text-white">
              Activité récente
            </h4>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-darkborder">
            {ACTIVITY_FEED.map((item) => (
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
            ))}
          </ul>
        </div>

        {/* Recent transactions */}
        <div className="col-span-12 bg-white dark:bg-darklight rounded-3xl border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-darkborder">
            <h4 className="text-midnight_text dark:text-white">
              Transactions récentes
            </h4>
            <span className="text-sm text-dark/40 dark:text-white/30 italic">
              Données simulées
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkborder">
              <thead className="bg-grey dark:bg-darkmode">
                <tr>
                  {["Client", "Montant", "Type", "Date", "Statut"].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-midnight_text/50 dark:text-white/40"
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-darkborder">
                {RECENT_TRANSACTIONS.map((t) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
