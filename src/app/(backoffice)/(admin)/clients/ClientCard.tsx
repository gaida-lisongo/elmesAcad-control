"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";
import IntegrationModal from "./IntegrationModal";
import QuotiteModal from "./QuotiteModal";
import { deleteClient } from "@/lib/actions/clients-management-actions";
import Image from "next/image";

interface ClientCardProps {
  client: any;
  onClientDeleted: () => void;
}

export default function ClientCard({
  client,
  onClientDeleted,
}: ClientCardProps) {
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [showQuotiteModal, setShowQuotiteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteMessageType, setDeleteMessageType] = useState<
    "success" | "error" | ""
  >("");

  const hasAccount = client.account && client.account._id;
  const accountStatus = hasAccount ? "active" : "inactive";

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce client?"))
      return;

    setIsDeleting(true);
    try {
      const result = await deleteClient(client._id);
      if (result.success) {
        setDeleteMessageType("success");
        setDeleteMessage("Client supprimé avec succès");
        setTimeout(() => {
          onClientDeleted();
        }, 1500);
      } else {
        setDeleteMessageType("error");
        setDeleteMessage("Erreur lors de la suppression");
      }
    } catch (error) {
      setDeleteMessageType("error");
      setDeleteMessage("Une erreur est survenue");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: string | Date) => {
    // Si c'est déjà une chaîne formatée, la retourner directement
    if (typeof date === "string") {
      return date === "N/A" ? "N/A" : date;
    }
    // Sinon, formater la date
    const d = new Date(date);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="bg-white dark:bg-darklight rounded-3xl overflow-hidden border-b-2 border-gray-200 dark:border-darkborder shadow-card-shadow hover:shadow-lg transition-shadow duration-300">
        {/* Section 1: Logo + Status Badge + Quotite */}
        <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-grey dark:bg-darkmode flex-shrink-0">
              {client.logo ? (
                <Image
                  src={client.logo}
                  alt={client.nomComplet}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon
                    icon="heroicons:building-storefront"
                    className="w-8 h-8 text-primary"
                  />
                </div>
              )}
            </div>

            {/* Status Badge + Quotite Button */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    hasAccount
                      ? "bg-success/10 text-success"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {hasAccount ? "Actif" : "Inactif"}
                </span>
              </div>
              <button
                onClick={() => setShowQuotiteModal(true)}
                className="text-left text-sm font-medium text-midnight_text dark:text-white hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1"
              >
                Quotité:{" "}
                <span className="font-semibold">
                  {(client.account?.quotite || 0).toFixed(2)}
                </span>
                <Icon icon="heroicons:pencil-20-solid" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Client Information */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-darkborder space-y-3">
          <div>
            <p className="text-sm text-dark/50 dark:text-white/50">Nom</p>
            <p className="text-base font-semibold text-midnight_text dark:text-white truncate">
              {client.nomComplet}
            </p>
          </div>
          <div>
            <p className="text-sm text-dark/50 dark:text-white/50">Email</p>
            <p className="text-sm text-midnight_text dark:text-white truncate">
              {client.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-dark/50 dark:text-white/50">
              Inscrit le
            </p>
            <p className="text-sm text-midnight_text dark:text-white">
              {formatDate(client.createdAt)}
            </p>
          </div>
          {hasAccount && (
            <div>
              <p className="text-sm text-dark/50 dark:text-white/50">
                Solde du compte
              </p>
              <p className="text-sm font-semibold text-midnight_text dark:text-white">
                ${client.account.solde?.toFixed(2) || "0.00"}
              </p>
            </div>
          )}
        </div>

        {deleteMessage && (
          <div
            className={`mx-6 p-3 rounded-lg text-sm text-center ${
              deleteMessageType === "success"
                ? "bg-success/10 text-success"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            {deleteMessage}
          </div>
        )}

        {/* Section 3: Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-darkborder flex gap-3">
          <button
            onClick={() => setShowIntegrationModal(true)}
            className="flex-grow-[3] flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white dark:bg-primary/20 dark:hover:bg-primary rounded-xl transition-colors font-medium text-sm"
          >
            <Icon icon="heroicons:link" className="w-4 h-4" />
            Intégration
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-grow px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white dark:bg-red-500/20 dark:hover:bg-red-500 rounded-xl transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon icon="heroicons:trash-20-solid" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {showIntegrationModal && (
        <IntegrationModal
          client={client}
          onClose={() => setShowIntegrationModal(false)}
        />
      )}

      {showQuotiteModal && client.account && (
        <QuotiteModal
          account={client.account}
          onClose={() => setShowQuotiteModal(false)}
          onSuccess={() => onClientDeleted()}
        />
      )}
    </>
  );
}
