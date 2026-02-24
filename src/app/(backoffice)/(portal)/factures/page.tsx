"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import Loader from "@/app/components/Common/Loader";
import {
  checkPaymentStatus,
  activateCommandeAfterPayment,
  createNewCommande,
} from "@/lib/actions/home/commande-actions";

interface Package {
  _id: string;
  titre: string;
  prix: number;
  description?: string;
}

interface PaymentInfo {
  reference?: string;
  amount?: string;
  amountCustomer?: string;
  currency?: string;
  createdAt?: string;
  status?: string;
  channel?: string;
}

interface Commande {
  _id: string;
  orderNumber: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  reference: string;
  email: string;
  phone: string;
  packageId?: {
    _id: string;
    titre: string;
    prix: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function FacturesPage() {
  const user = useAuthStore((state) => state.user);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(
    null,
  );

  // Payment check modal
  const [paymentCheckModal, setPaymentCheckModal] = useState<{
    isOpen: boolean;
    isLoading?: boolean;
    paymentInfo?: PaymentInfo | null;
    error?: string;
    commandeId?: string;
  }>({
    isOpen: false,
  });

  // Create commande modal 3 steps
  const [createModal, setCreateModal] = useState({
    isOpen: false,
    step: 1,
    selectedPackage: null as Package | null,
    phoneNumber: "",
    isLoading: false,
    packages: [] as Package[],
  });

  // Récupérer les commandes
  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/commandes");

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des commandes");
        }

        const result = await response.json();

        if (result.success) {
          setCommandes(result.data);
        } else {
          setError(result.error || "Erreur lors du chargement");
        }
      } catch (err: any) {
        console.error("Erreur fetch commandes:", err);
        setError(err.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchCommandes();
    }
  }, [user?.id]);

  // Charger les packages quand le modal s'ouvre
  useEffect(() => {
    if (createModal.isOpen && createModal.packages.length === 0) {
      const fetchPackages = async () => {
        try {
          const response = await fetch("/api/data?type=packages");
          const result = await response.json();
          if (result.success) {
            setCreateModal((prev) => ({
              ...prev,
              packages: result.data || [],
            }));
          }
        } catch (error) {
          console.error("Erreur fetch packages:", error);
        }
      };
      fetchPackages();
    }
  }, [createModal.isOpen]);

  // Étape 1: Sélectionner le package
  const handleSelectPackage = (pkg: Package) => {
    setCreateModal((prev) => ({
      ...prev,
      selectedPackage: pkg,
      step: 2,
    }));
  };

  // Étape 2: Renseigner le numéro et passer à l'étape 3
  const handleNextStep = () => {
    if (createModal.phoneNumber.trim()) {
      setCreateModal((prev) => ({
        ...prev,
        step: 3,
      }));
    }
  };

  // Étape 3: Créer la commande
  const handleCreateCommande = async () => {
    if (!createModal.selectedPackage || !user?.id) return;

    setCreateModal((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await createNewCommande(
        user.id,
        createModal.selectedPackage._id,
        createModal.phoneNumber,
        user.email,
      );

      if (result.success) {
        // Ajouter la nouvelle commande au state
        if (createModal.selectedPackage) {
          setCommandes((prev) => [
            ...prev,
            {
              _id: result.data?.commandeId,
              orderNumber: result.data?.orderNumber,
              amount: result.data?.amount,
              status: "pending",
              reference: "",
              email: user.email,
              phone: createModal.phoneNumber,
              packageId: {
                _id: createModal.selectedPackage!._id,
                titre: createModal.selectedPackage!.titre,
                prix: createModal.selectedPackage!.prix,
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]);
        }

        // Fermer le modal
        setCreateModal({
          isOpen: false,
          step: 1,
          selectedPackage: null,
          phoneNumber: "",
          isLoading: false,
          packages: [],
        });

        alert("✅ Commande créée avec succès!");
      } else {
        alert("❌ " + (result.error || "Erreur lors de la création"));
      }
    } catch (err: any) {
      alert("❌ " + (err.message || "Erreur serveur"));
    } finally {
      setCreateModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Vérifier le statut du paiement
  const handleCheckPayment = async (commande: Commande) => {
    setPaymentCheckModal({
      isOpen: true,
      isLoading: true,
      commandeId: commande._id,
    });

    try {
      const result = await checkPaymentStatus(commande.orderNumber);

      if (result.success) {
        setPaymentCheckModal({
          isOpen: true,
          isLoading: false,
          paymentInfo: result.data,
          commandeId: commande._id,
        });
      } else {
        setPaymentCheckModal({
          isOpen: true,
          isLoading: false,
          error: result.error || "Erreur lors de la vérification",
          commandeId: commande._id,
        });
      }
    } catch (err: any) {
      setPaymentCheckModal({
        isOpen: true,
        isLoading: false,
        error: err.message || "Erreur serveur",
        commandeId: commande._id,
      });
    }
  };

  // Activer la commande
  const handleActivateCommande = async () => {
    if (!paymentCheckModal.commandeId || !user?.id) return;

    setPaymentCheckModal((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await activateCommandeAfterPayment(
        paymentCheckModal.commandeId,
        user.id,
      );

      if (result.success) {
        // Mettre à jour les commandes dans le state
        setCommandes((prev) =>
          prev.map((cmd) =>
            cmd._id === paymentCheckModal.commandeId
              ? { ...cmd, status: "completed" }
              : cmd,
          ),
        );

        // Fermer le modal de détails et de paiement
        setSelectedCommande(null);
        setPaymentCheckModal({ isOpen: false });

        // Afficher un toast de succès
        alert("✅ Commande activée avec succès!");
      } else {
        setPaymentCheckModal((prev) => ({
          ...prev,
          isLoading: false,
          error: result.error || "Erreur lors de l'activation",
        }));
      }
    } catch (err: any) {
      setPaymentCheckModal((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || "Erreur serveur",
      }));
    }
  };

  // Statut badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
            <Icon icon="solar:check-circle-linear" width={16} />
            Complété
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm font-medium">
            <Icon icon="solar:clock-circle-linear" width={16} />
            En attente
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium">
            <Icon icon="solar:close-circle-linear" width={16} />
            Échoué
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" text="Chargement de vos commandes..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
              Mes Commandes
            </h1>
            <p className="text-black/60 dark:text-white/60">
              Historique complet de vos achats et factures
            </p>
          </div>
          <button
            onClick={() =>
              setCreateModal((prev) => ({
                ...prev,
                isOpen: true,
                step: 1,
              }))
            }
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary text-white hover:bg-orange-600 transition-colors font-semibold"
          >
            <Icon icon="solar:add-circle-linear" width={20} />
            Créer une commande
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
          <Icon
            icon="solar:warning-circle-linear"
            className="inline mr-2"
            width={20}
          />
          {error}
        </div>
      )}

      {commandes.length === 0 ? (
        <div className="text-center py-16">
          <Icon
            icon="solar:box-open-linear"
            width={64}
            className="mx-auto mb-4 text-black/20 dark:text-white/20"
          />
          <p className="text-black/60 dark:text-white/60 mb-6">
            Aucune commande pour le moment
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-primary text-white hover:bg-orange-600 transition-colors font-semibold"
          >
            <Icon icon="solar:add-circle-linear" width={20} />
            Acheter un package
          </Link>
        </div>
      ) : (
        <>
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Carte 1: Total des commandes */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-2 font-medium">
                    Total des commandes
                  </p>
                  <p className="text-4xl font-bold text-white">
                    {commandes.length}
                  </p>
                </div>
                <Icon
                  icon="solar:bag-check-linear"
                  width={48}
                  className="text-white/20"
                />
              </div>
            </div>

            {/* Carte 2: Commandes complétées */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-2 font-medium">
                    Commandes complétées
                  </p>
                  <p className="text-4xl font-bold text-white">
                    {commandes.filter((c) => c.status === "completed").length}
                  </p>
                </div>
                <Icon
                  icon="solar:check-circle-linear"
                  width={48}
                  className="text-white/20"
                />
              </div>
            </div>

            {/* Carte 3: Dépense totale */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-orange-600 dark:from-orange-600 dark:to-orange-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-2 font-medium">
                    Dépense totale
                  </p>
                  <p className="text-4xl font-bold text-white">
                    ${commandes.reduce((sum, c) => sum + c.amount, 0)}
                  </p>
                </div>
                <Icon
                  icon="solar:dollar-outline"
                  width={48}
                  className="text-white/20"
                />
              </div>
            </div>
          </div>

          {/* Tableau des commandes */}
          <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-border dark:border-slate-700 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border dark:border-slate-700 bg-grey dark:bg-slate-800/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Package
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Montant
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {commandes.map((commande) => (
                    <tr
                      key={commande._id}
                      className="border-b border-border dark:border-slate-700/50 hover:bg-grey/50 dark:hover:bg-slate-700/30 transition-all duration-200"
                    >
                      <td className="px-6 py-5">
                        <p className="text-black dark:text-white font-semibold">
                          {commande.packageId?.titre || "N/A"}
                        </p>
                        <p className="text-xs text-black/50 dark:text-slate-400">
                          {commande.reference}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-black dark:text-white font-bold text-lg">
                          ${commande.amount}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(commande.status)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm">
                          <p className="text-black dark:text-white font-medium">
                            {formatDate(commande.createdAt)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => setSelectedCommande(commande)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-primary dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 font-semibold text-sm transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-500/20"
                        >
                          <Icon icon="solar:eye-linear" width={18} />
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Détails */}
          {selectedCommande && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
              <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto border border-border dark:border-slate-700">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-r from-blue-500 to-primary dark:from-blue-600 dark:to-orange-600 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Détails de la commande
                  </h2>
                  <p className="text-white/80 text-sm">
                    Numéro: {selectedCommande.orderNumber.substring(0, 20)}...
                  </p>
                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedCommande(null)}
                    className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                  >
                    <Icon icon="mdi:close" width={24} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                  {/* Statut */}
                  <div>
                    <label className="block text-sm font-semibold text-black/70 dark:text-slate-300 mb-3">
                      Statut du paiement
                    </label>
                    {getStatusBadge(selectedCommande.status)}
                  </div>

                  {/* Grid 2 colonnes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Numéro de commande */}
                    <div>
                      <label className="block text-sm font-semibold text-black/70 dark:text-slate-300 mb-3">
                        N° de commande
                      </label>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700">
                        <code className="flex-1 text-xs font-mono text-blue-900 dark:text-blue-300 break-all">
                          {selectedCommande.orderNumber}
                        </code>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(
                              selectedCommande.orderNumber,
                            )
                          }
                          className="p-2 hover:bg-blue-100 dark:hover:bg-slate-700 rounded transition-colors text-blue-600 dark:text-blue-400"
                        >
                          <Icon icon="mdi:content-copy" width={18} />
                        </button>
                      </div>
                    </div>

                    {/* Montant */}
                    <div>
                      <label className="block text-sm font-semibold text-black/70 dark:text-slate-300 mb-3">
                        Montant payé
                      </label>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                          ${selectedCommande.amount}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Package */}
                  {selectedCommande.packageId && (
                    <div>
                      <label className="block text-sm font-semibold text-black/70 dark:text-slate-300 mb-3">
                        Package acheté
                      </label>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800/50">
                        <p className="text-black dark:text-white font-bold text-lg">
                          {selectedCommande.packageId.titre}
                        </p>
                        <p className="text-primary dark:text-orange-400 font-bold mt-2 text-lg">
                          ${selectedCommande.packageId.prix}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-black/70 dark:text-slate-300 mb-3">
                        Email
                      </label>
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-black dark:text-white font-medium break-all">
                          {selectedCommande.email}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black/70 dark:text-slate-300 mb-3">
                        Téléphone
                      </label>
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-black dark:text-white font-medium">
                          {selectedCommande.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Référence */}
                  <div>
                    <label className="block text-sm font-semibold text-black/70 dark:text-slate-300 mb-3">
                      Référence de paiement
                    </label>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                      <code className="flex-1 text-xs font-mono text-purple-900 dark:text-purple-300 break-all">
                        {selectedCommande.reference}
                      </code>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            selectedCommande.reference,
                          )
                        }
                        className="p-2 hover:bg-purple-100 dark:hover:bg-purple-800 rounded transition-colors text-purple-600 dark:text-purple-400"
                      >
                        <Icon icon="mdi:content-copy" width={18} />
                      </button>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-black/70 dark:text-slate-300 mb-3">
                      Date de commande
                    </label>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <p className="text-black dark:text-white font-medium">
                        {new Date(
                          selectedCommande.createdAt,
                        ).toLocaleTimeString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-600">
                    <p className="text-sm text-blue-900 dark:text-blue-200 font-medium flex items-start gap-2">
                      <Icon
                        icon="mdi:information"
                        width={18}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <span>
                        Les commandes ne peuvent pas être modifiées. Pour toute
                        question, veuillez contacter le support.
                      </span>
                    </p>
                  </div>
                </div>

                {/* Footer Button */}
                <div className="p-8 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                  {selectedCommande.status === "pending" && (
                    <button
                      onClick={() => handleCheckPayment(selectedCommande)}
                      className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-primary hover:from-orange-600 hover:to-orange-600 text-white font-semibold transition-all duration-200 transform hover:scale-105 dark:from-orange-600 dark:to-orange-700 flex items-center justify-center gap-2"
                    >
                      <Icon icon="solar:bolt-circle-linear" width={20} />
                      Vérifier & Activer la commande
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedCommande(null)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-black dark:text-white font-semibold transition-all duration-200"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Check Modal */}
          {paymentCheckModal.isOpen && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Icon icon="solar:card-linear" width={24} />
                      Vérification de paiement
                    </h2>
                    <button
                      onClick={() =>
                        setPaymentCheckModal((prev) => ({
                          ...prev,
                          isOpen: false,
                        }))
                      }
                      className="text-white hover:bg-white/20 rounded-lg p-1 transition"
                    >
                      <Icon icon="mdi:close" width={24} />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                  {paymentCheckModal.isLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader size="lg" text="Vérification du paiement..." />
                    </div>
                  ) : paymentCheckModal.error ? (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-red-700 dark:text-red-300 font-medium flex items-start gap-2">
                        <Icon
                          icon="mdi:alert-circle"
                          width={20}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <span>{paymentCheckModal.error}</span>
                      </p>
                    </div>
                  ) : paymentCheckModal.paymentInfo ? (
                    <>
                      {/* Payment Status */}
                      <div
                        className={`p-4 rounded-lg border-l-4 ${
                          paymentCheckModal.paymentInfo.status === "0"
                            ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                            : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium flex items-center gap-2 ${
                            paymentCheckModal.paymentInfo.status === "0"
                              ? "text-green-700 dark:text-green-300"
                              : "text-yellow-700 dark:text-yellow-300"
                          }`}
                        >
                          <Icon
                            icon={
                              paymentCheckModal.paymentInfo.status === "0"
                                ? "mdi:check-circle"
                                : "mdi:clock-outline"
                            }
                            width={20}
                          />
                          {paymentCheckModal.paymentInfo.status === "0"
                            ? "✓ Paiement confirmé"
                            : "⏱ Paiement en attente"}
                        </p>
                      </div>

                      {/* Payment Details */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Référence
                          </span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
                            {paymentCheckModal.paymentInfo.reference}
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Montant
                          </span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {paymentCheckModal.paymentInfo.amount}{" "}
                            {paymentCheckModal.paymentInfo.currency}
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Canal
                          </span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                            {paymentCheckModal.paymentInfo.channel === "om"
                              ? "Mobile Money"
                              : paymentCheckModal.paymentInfo.channel}
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Date
                          </span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {paymentCheckModal.paymentInfo.createdAt
                              ? new Date(
                                  paymentCheckModal.paymentInfo.createdAt,
                                ).toLocaleString("fr-FR", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "---"}
                          </span>
                        </div>
                      </div>

                      {/* Info Box */}
                      {paymentCheckModal.paymentInfo.status !== "0" && (
                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Votre paiement n'a pas encore été confirmé. Veuillez
                            vérifier votre référence de paiement ou contacter le
                            support.
                          </p>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                  {paymentCheckModal.paymentInfo &&
                    paymentCheckModal.paymentInfo.status === "2" && (
                      <button
                        onClick={handleActivateCommande}
                        disabled={paymentCheckModal.isLoading}
                        className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 transform hover:scale-105 dark:from-green-600 dark:to-emerald-700 flex items-center justify-center gap-2"
                      >
                        <Icon icon="mdi:check-bold" width={20} />
                        Activer la commande
                      </button>
                    )}
                  <button
                    onClick={() =>
                      setPaymentCheckModal((prev) => ({
                        ...prev,
                        isOpen: false,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-lg bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-black dark:text-white font-semibold transition-all duration-200"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Commande Modal - 3 Steps */}
          {createModal.isOpen && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-500 to-primary dark:from-blue-600 dark:to-orange-600">
                  <h2 className="text-2xl font-bold text-white flex items-center justify-between">
                    <span>Créer une commande</span>
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                      Étape {createModal.step}/3
                    </span>
                  </h2>
                </div>

                {/* Body */}
                <div className="p-8">
                  {/* Étape 1: Sélectionner le package */}
                  {createModal.step === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
                        Choisissez votre package
                      </h3>
                      <div className="grid gap-4">
                        {createModal.packages.map((pkg) => (
                          <button
                            key={pkg._id}
                            onClick={() => handleSelectPackage(pkg)}
                            className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-black dark:text-white text-lg">
                                  {pkg.titre}
                                </h4>
                                {pkg.description && (
                                  <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                                    {pkg.description}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-3xl font-bold text-primary">
                                  ${pkg.prix}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Étape 2: Renseigner le numéro */}
                  {createModal.step === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
                        Confirmer votre numéro
                      </h3>
                      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Package sélectionné:</strong>{" "}
                          {createModal.selectedPackage?.titre}
                        </p>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-2">
                          ${createModal.selectedPackage?.prix}
                        </p>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-semibold text-black dark:text-white mb-3">
                          Numéro de téléphone
                        </label>
                        <input
                          type="text"
                          value={createModal.phoneNumber}
                          onChange={(e) =>
                            setCreateModal((prev) => ({
                              ...prev,
                              phoneNumber: e.target.value,
                            }))
                          }
                          placeholder="+243 XXX XXXXXX"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-black dark:text-white focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  )}

                  {/* Étape 3: Confirmation */}
                  {createModal.step === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
                        Confirmer votre commande
                      </h3>

                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            Package
                          </p>
                          <p className="font-bold text-black dark:text-white">
                            {createModal.selectedPackage?.titre}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            Téléphone
                          </p>
                          <p className="font-bold text-black dark:text-white">
                            {createModal.phoneNumber}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                            Montant total
                          </p>
                          <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                            ${createModal.selectedPackage?.prix}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                  <button
                    onClick={() => {
                      if (createModal.step > 1) {
                        setCreateModal((prev) => ({
                          ...prev,
                          step: prev.step - 1,
                        }));
                      } else {
                        setCreateModal({
                          isOpen: false,
                          step: 1,
                          selectedPackage: null,
                          phoneNumber: "",
                          isLoading: false,
                          packages: [],
                        });
                      }
                    }}
                    disabled={createModal.isLoading}
                    className="flex-1 px-4 py-3 rounded-lg bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-black dark:text-white font-semibold transition-all disabled:opacity-50"
                  >
                    {createModal.step === 1 ? "Annuler" : "Retour"}
                  </button>

                  <button
                    onClick={() => {
                      if (createModal.step === 2) {
                        handleNextStep();
                      } else if (createModal.step === 3) {
                        handleCreateCommande();
                      }
                    }}
                    disabled={
                      createModal.isLoading ||
                      (createModal.step === 2 &&
                        !createModal.phoneNumber.trim())
                    }
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {createModal.isLoading && (
                      <span className="animate-spin">⟳</span>
                    )}
                    {createModal.step === 3 ? "Créer la commande" : "Suivant"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
