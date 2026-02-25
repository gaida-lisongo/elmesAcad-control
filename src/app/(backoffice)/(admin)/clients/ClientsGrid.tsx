"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";
import Image from "next/image";
import IntegrationModal from "./IntegrationModal";
import QuotiteModal from "./QuotiteModal";
import EditEmailModal from "./EditEmailModal";
import EditSoldeModal from "./EditSoldeModal";
import EditLogoModal from "./EditLogoModal";
import { deleteClient } from "@/lib/actions/clients-management-actions";

interface ClientsGridProps {
  clients: any[];
  onClientsUpdated: () => void;
}

export default function ClientsGrid({
  clients,
  onClientsUpdated,
}: ClientsGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showIntegrationModal, setShowIntegrationModal] = useState<
    string | null
  >(null);
  const [showQuotiteModal, setShowQuotiteModal] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState<string | null>(null);
  const [showSoldeModal, setShowSoldeModal] = useState<string | null>(null);
  const [showLogoModal, setShowLogoModal] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.nomComplet.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (clientId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce client?"))
      return;

    setIsDeleting(clientId);
    try {
      const result = await deleteClient(clientId);
      if (result.success) {
        onClientsUpdated();
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const selectedIntegrationClient = clients.find(
    (c) => c._id === showIntegrationModal,
  );
  const selectedQuotiteAccount = clients.find(
    (c) => c._id === showQuotiteModal,
  )?.account;
  const selectedEmailClient = clients.find((c) => c._id === showEmailModal);
  const selectedSoldeAccount = clients.find(
    (c) => c._id === showSoldeModal,
  )?.account;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Icon
          icon="heroicons:magnifying-glass"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/50 dark:text-white/50"
        />
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-2 border border-gray-200 dark:border-darkborder rounded-lg bg-white dark:bg-darkmode text-midnight_text dark:text-white placeholder-dark/50 dark:placeholder-white/50 focus:outline-none focus:border-primary"
        />
      </div>

      {/* Clients Table */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <Icon
            icon="heroicons:users"
            className="w-12 h-12 text-dark/20 dark:text-white/20 mx-auto mb-3"
          />
          <p className="text-midnight_text dark:text-white font-semibold">
            Aucun client trouvé
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-darkborder">
                <th className="text-left px-4 py-3 text-sm font-semibold text-dark/70 dark:text-white/70">
                  Client
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-dark/70 dark:text-white/70">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-dark/70 dark:text-white/70">
                  Quotité
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-dark/70 dark:text-white/70">
                  Solde
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-dark/70 dark:text-white/70">
                  Inscrit le
                </th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-dark/70 dark:text-white/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr
                  key={client._id}
                  className="border-b border-gray-200 dark:border-darkborder hover:bg-grey dark:hover:bg-darkmode/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowLogoModal(client._id)}
                        className="relative w-8 h-8 rounded-lg overflow-hidden hover:opacity-80 transition-opacity group"
                      >
                        {client.logo ? (
                          <>
                            <Image
                              src={client.logo}
                              alt={client.nomComplet}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Icon
                                icon="heroicons:camera"
                                className="w-4 h-4 text-white"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Icon
                              icon="heroicons:building-storefront"
                              className="w-4 h-4 text-primary"
                            />
                          </div>
                        )}
                      </button>
                      <span className="font-medium text-midnight_text dark:text-white truncate">
                        {client.nomComplet}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setShowEmailModal(client._id)}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {client.email}
                      <Icon
                        icon="heroicons:pencil-20-solid"
                        className="w-3 h-3"
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setShowQuotiteModal(client._id)}
                      className="text-sm font-semibold text-midnight_text dark:text-white hover:text-primary flex items-center gap-1"
                    >
                      {(client.account?.quotite || 0).toFixed(2)}
                      <Icon
                        icon="heroicons:pencil-20-solid"
                        className="w-3 h-3"
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setShowSoldeModal(client._id)}
                      className="text-sm font-semibold text-midnight_text dark:text-white hover:text-primary flex items-center gap-1"
                    >
                      ${(client.account?.solde || 0).toFixed(2)}
                      <Icon
                        icon="heroicons:pencil-20-solid"
                        className="w-3 h-3"
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-dark/60 dark:text-white/60">
                      {client.createdAt}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setShowIntegrationModal(client._id)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Détails d'intégration"
                      >
                        <Icon icon="heroicons:link" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client._id)}
                        disabled={isDeleting === client._id}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        <Icon
                          icon="heroicons:trash-20-solid"
                          className="w-4 h-4"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showIntegrationModal && selectedIntegrationClient && (
        <IntegrationModal
          client={selectedIntegrationClient}
          onClose={() => setShowIntegrationModal(null)}
        />
      )}

      {showQuotiteModal && selectedQuotiteAccount && (
        <QuotiteModal
          account={selectedQuotiteAccount}
          onClose={() => setShowQuotiteModal(null)}
          onSuccess={onClientsUpdated}
        />
      )}

      {showEmailModal && selectedEmailClient && (
        <EditEmailModal
          clientId={selectedEmailClient._id}
          currentEmail={selectedEmailClient.email}
          onClose={() => setShowEmailModal(null)}
          onSuccess={onClientsUpdated}
        />
      )}

      {showSoldeModal && selectedSoldeAccount && (
        <EditSoldeModal
          accountId={selectedSoldeAccount._id}
          currentSolde={selectedSoldeAccount.solde}
          onClose={() => setShowSoldeModal(null)}
          onSuccess={onClientsUpdated}
        />
      )}

      {showLogoModal &&
        (() => {
          const client = clients.find((c) => c._id === showLogoModal);
          return client ? (
            <EditLogoModal
              clientId={client._id}
              currentLogo={client.logo}
              clientName={client.nomComplet}
              onClose={() => setShowLogoModal(null)}
              onSuccess={onClientsUpdated}
            />
          ) : null;
        })()}
    </div>
  );
}
