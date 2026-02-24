"use client";

import KPI from "./KPI";
import Depense, { StatusBadge } from "./Depense";
import FormDepense from "./FormDepense";
import Recette from "./Recette";

// ─── Fake data — TODO: replace with real API calls ────────────────────────────
export interface StatItem {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: string;
  color: string;
}

export interface ActivityItem {
  id: number;
  icon: string;
  color: string;
  text: string;
  time: string;
}

const STATS: StatItem[] = [
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

const ACTIVITY_FEED: ActivityItem[] = [
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

      <KPI data={STATS} />

      {/* ── Main grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">
        {/* Recent clients table */}
        <Depense
          cols={["Client", "Email", "Plan", "Statut", "Rejoint le"]}
          data={RECENT_CLIENTS}
        />

        {/* Activity feed */}
        <FormDepense activityFeed={ACTIVITY_FEED} />

        {/* Recent transactions */}
        <Recette cols={[
          'Client', 'Montant', 'Moyen', 'Date', 'Statut'
        ]} data={RECENT_TRANSACTIONS} />
      </div>
    </div>
  );
}
