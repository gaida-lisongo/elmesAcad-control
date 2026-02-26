"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "./Depense";

type RecetteDetail = {
  _id: string;
  amount: number;
  category: string;
  student: string;
  classe: string;
  reference: string;
  description?: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  clientId?: {
    nomComplet?: string;
    email?: string;
  };
};

type FlexpayResponse = {
  success: boolean;
  message?: string;
  data?: {
    reference?: string;
    amount?: string;
    amountCustomer?: string;
    currency?: string;
    createdAt?: string;
    status?: string | number;
    channel?: string;
  };
  error?: string;
};

const statusLabels: Record<string, string> = {
  completed: "succès",
  pending: "en attente",
  failed: "échoué",
};

const flexpayStatusLabel = (status?: string | number) => {
  const normalized = status === undefined ? "" : String(status);
  if (normalized === "0") return "Paiement reçu";
  if (normalized === "2") return "En attente";
  return normalized || "Inconnu";
};

export default function DetailRecette({
  recetteId,
  onStatusUpdated,
}: {
  recetteId: string;
  onStatusUpdated?: (
    recetteId: string,
    status: "pending" | "completed" | "failed",
  ) => void;
}) {
  const [recette, setRecette] = useState<RecetteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flexpayInfo, setFlexpayInfo] = useState<FlexpayResponse | null>(null);
  const [checkingFlexpay, setCheckingFlexpay] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    let isActive = true;
    const loadRecette = async () => {
      try {
        setLoading(true);
        setError(null);
        const req = await fetch("/api/transactions", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recetteId }),
        });

        if (!req.ok) {
          throw new Error("Erreur lors de la récupération de la recette");
        }

        const res = await req.json();
        if (!res.success) {
          throw new Error(res.error || "Erreur dans la réponse de l'API");
        }

        if (isActive) {
          setRecette(res.data as RecetteDetail);
        }
      } catch (err: any) {
        if (isActive) {
          setError(err.message || "Erreur lors de la récupération");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    if (recetteId) {
      loadRecette();
    }

    return () => {
      isActive = false;
    };
  }, [recetteId]);

  const updateStatus = async (status: "pending" | "completed" | "failed") => {
    try {
      setUpdatingStatus(true);
      const req = await fetch("/api/transactions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recetteId, status }),
      });

      if (!req.ok) {
        throw new Error("Erreur lors de la mise a jour du statut");
      }

      const res = await req.json();
      if (!res.success) {
        throw new Error(res.error || "Erreur lors de la mise a jour");
      }

      setRecette((prev) => (prev ? { ...prev, status } : prev));
      onStatusUpdated?.(recetteId, status);
    } catch (err: any) {
      setFlexpayInfo({
        success: false,
        error: err.message || "Erreur lors de la mise a jour",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCheckFlexpay = async () => {
    if (!recette?.reference) {
      setFlexpayInfo({
        success: false,
        error: "Reference manquante pour FlexPay",
      });
      return;
    }

    try {
      setCheckingFlexpay(true);
      setFlexpayInfo(null);
      const req = await fetch(
        `/api/flexpay?orderNumber=${encodeURIComponent(recette.reference)}`,
      );

      if (!req.ok) {
        throw new Error("Erreur lors de la verification FlexPay");
      }

      const res = (await req.json()) as FlexpayResponse;
      setFlexpayInfo(res);

      const flexpayStatus = res.data?.status;
      if (res.success && String(flexpayStatus) === "0") {
        if (recette.status !== "completed") {
          await updateStatus("completed");
        }
      }
    } catch (err: any) {
      setFlexpayInfo({
        success: false,
        error: err.message || "Erreur lors de la verification",
      });
    } finally {
      setCheckingFlexpay(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-dark/50 dark:text-white/50">
        Chargement des details...
      </div>
    );
  }

  if (error || !recette) {
    return (
      <div className="text-sm text-red-500">
        {error || "Recette introuvable"}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase text-dark/40 dark:text-white/40">
            Client
          </p>
          <p className="text-base text-midnight_text dark:text-white">
            {recette.clientId?.nomComplet || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-dark/40 dark:text-white/40">
            Email
          </p>
          <p className="text-base text-midnight_text dark:text-white">
            {recette.clientId?.email || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-dark/40 dark:text-white/40">
            Eleve
          </p>
          <p className="text-base text-midnight_text dark:text-white">
            {recette.student || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-dark/40 dark:text-white/40">
            Classe
          </p>
          <p className="text-base text-midnight_text dark:text-white">
            {recette.classe || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-dark/40 dark:text-white/40">
            Montant
          </p>
          <p className="text-base font-semibold text-midnight_text dark:text-white">
            ${recette.amount.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-dark/40 dark:text-white/40">
            Type
          </p>
          <p className="text-base text-midnight_text dark:text-white">
            {recette.category || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-dark/40 dark:text-white/40">
            Date
          </p>
          <p className="text-base text-midnight_text dark:text-white">
            {new Date(recette.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-dark/40 dark:text-white/40">
            Reference
          </p>
          <p className="text-base text-midnight_text dark:text-white">
            {recette.reference || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-dark/40 dark:text-white/40">
            Statut
          </p>
          <StatusBadge
            status={statusLabels[recette.status] || recette.status}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-grey/40 p-4 dark:border-darkborder dark:bg-darkmode">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-midnight_text dark:text-white">
              Verification FlexPay
            </p>
            <p className="text-xs text-dark/50 dark:text-white/50">
              Utilise la reference pour verifier le paiement.
            </p>
          </div>
          <button
            onClick={handleCheckFlexpay}
            disabled={checkingFlexpay || updatingStatus}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checkingFlexpay ? "Verification..." : "Verifier le paiement"}
          </button>
        </div>

        {flexpayInfo && (
          <div className="mt-4 space-y-2 rounded-xl border border-gray-200 bg-white p-4 text-sm text-midnight_text dark:border-darkborder dark:bg-darklight dark:text-white">
            <p className="font-semibold">
              {flexpayInfo.success
                ? flexpayInfo.message || "Statut FlexPay"
                : flexpayInfo.error || "Verification echouee"}
            </p>
            {flexpayInfo.data && (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <span>Reference: {flexpayInfo.data.reference || "N/A"}</span>
                <span>Montant: {flexpayInfo.data.amount || "N/A"}</span>
                <span>Client: {flexpayInfo.data.amountCustomer || "N/A"}</span>
                <span>Devise: {flexpayInfo.data.currency || "N/A"}</span>
                <span>Date: {flexpayInfo.data.createdAt || "N/A"}</span>
                <span>
                  Statut: {flexpayStatusLabel(flexpayInfo.data.status)}
                </span>
                <span>Canal: {flexpayInfo.data.channel || "N/A"}</span>
              </div>
            )}
            {updatingStatus && (
              <p className="text-xs text-primary">Mise a jour du statut...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
