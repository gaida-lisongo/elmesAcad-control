"use client";

import { useEffect, useState } from "react";
import KPI from "./KPI";
import Depense from "./Depense";
import FormDepense from "./FormDepense";
import Recette from "./Recette";
import {
  getDashboardData,
  DashboardData,
} from "@/lib/actions/dashboard-actions";
import { useAuthStore } from "@/store/authStore";

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
  id: string;
  icon: string;
  color: string;
  text: string;
  time: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        const data = await getDashboardData(
          user.id,
          (user.role || "client") as "admin" | "client",
        );
        setDashboardData(data);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id, user?.role]);

  if (loading || !dashboardData) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-midnight_text dark:text-white">
            Tableau de bord
          </h2>
          <p className="text-base text-dark/50 dark:text-white/50 mt-1">
            Chargement des données...
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-darklight rounded-3xl p-6 h-24 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Construire les KPI stats
  const STATS: StatItem[] = [
    {
      label: "Transactions complètes",
      value: dashboardData.transactions
        .filter((t) => t.status === "completed")
        .length.toString(),
      delta: `${dashboardData.revenuePercent}% complètes`,
      positive: true,
      icon: "heroicons:arrows-right-left-20-solid",
      color: "bg-blue/10 text-blue",
    },
    {
      label: "Revenus perçus (USD)",
      value: `$${dashboardData.totalRevenue.toFixed(2)}`,
      delta: `Quotite: ${(dashboardData.quotite * 100).toFixed(0)}%`,
      positive: true,
      icon: "heroicons:banknotes-20-solid",
      color: "bg-success/10 text-success",
    },
    {
      label: "Montants dépensés (USD)",
      value: `$${dashboardData.totalSpent.toFixed(2)}`,
      delta: `${dashboardData.spentPercent}% complétés`,
      positive: dashboardData.totalSpent === 0,
      icon: "heroicons:arrow-down-tray-20-solid",
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Solde disponible (USD)",
      value: `$${dashboardData.balance.toFixed(2)}`,
      delta: dashboardData.balance >= 0 ? "Positif" : "Négatif",
      positive: dashboardData.balance >= 0,
      icon: "heroicons:wallet-20-solid",
      color:
        dashboardData.balance >= 0
          ? "bg-success/10 text-success"
          : "bg-red-500/10 text-red-500",
    },
  ];

  // Formater les transactions pour Recette
  const formattedTransactions = dashboardData.transactions.map((t) => ({
    id: t._id,
    client: t.clientId || "N/A",
    amount: `$${t.amount.toFixed(2)}`,
    type: t.category || "Paiement",
    date: new Date(t.createdAt).toLocaleDateString("fr-FR"),
    status:
      t.status === "completed"
        ? "succès"
        : t.status === "pending"
          ? "en attente"
          : "échoué",
  }));

  // Formater les withdrawals pour Depense (10 derniers)
  const formattedWithdrawals = dashboardData.withdrawals
    .slice(0, 10)
    .map((w) => ({
      id: w._id,
      reference: w.reference,
      amount: `$${w.amount.toFixed(2)}`,
      phone: w.phone,
      date: new Date(w.createdAt).toLocaleDateString("fr-FR"),
      status: w.status,
    }));

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-midnight_text dark:text-white">Tableau de bord</h2>
        <p className="text-base text-dark/50 dark:text-white/50 mt-1">
          Vue d&apos;ensemble de votre activité
        </p>
      </div>

      <KPI data={STATS} />

      {/* ── Main grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">
        {/* Recent withdrawals */}
        <Depense
          cols={["Référence", "Montant", "Téléphone", "Date", "Statut"]}
          data={formattedWithdrawals}
        />

        {/* Activity feed and withdrawal form */}
        <FormDepense
          activityFeed={dashboardData.activities}
          balance={dashboardData.balance}
          userId={user?.id || ""}
          userRole={(user?.role || "client") as "admin" | "client"}
        />

        {/* Recent transactions */}
        <Recette
          cols={["Client", "Montant", "Type", "Date", "Statut"]}
          data={formattedTransactions}
        />
      </div>
    </div>
  );
}
