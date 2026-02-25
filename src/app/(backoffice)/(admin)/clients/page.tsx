"use client";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import {
  getPackages,
  getAccounts,
} from "@/lib/actions/clients-management-actions";
import ClientsGrid from "./ClientsGrid";
import { useAuthStore } from "@/store/authStore";

export default function ClientsPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  const [displayClients, setDisplayClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const user = useAuthStore((state) => state.user);

  const loadData = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Récupérer packages et accounts
      const [packagesData, accountsData] = await Promise.all([
        getPackages(),
        getAccounts(),
      ]);

      setPackages(packagesData);
      setAccounts(accountsData);

      // Sélectionner le premier package par défaut
      if (packagesData.length > 0) {
        const firstPackageId = packagesData[0]._id;
        setSelectedPackageId(firstPackageId);
        updateDisplayClients(firstPackageId, accountsData);
      }
    } catch (err) {
      setError("Une erreur est survenue lors du chargement des données");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDisplayClients = (
    packageId: string | null,
    accountsData: any[],
  ) => {
    if (packageId) {
      // Afficher les clients du package
      const packageClients = accountsData
        .filter(
          (acc: any) =>
            acc.packageId?._id === packageId && acc.clientId?.isActive,
        )
        .map((acc: any) => ({ ...acc.clientId, account: acc }));
      setDisplayClients(packageClients);
    }
  };

  const handlePackageChange = (packageId: string | null) => {
    setSelectedPackageId(packageId);
    updateDisplayClients(packageId, accounts);
  };

  useEffect(() => {
    if (user && user.role !== "admin") {
      setError("Vous n'avez pas accès à cette page");
      setIsLoading(false);
      return;
    }
    loadData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon
            icon="heroicons:arrow-path"
            className="w-8 h-8 text-primary animate-spin mx-auto mb-2"
          />
          <p className="text-midnight_text dark:text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon
            icon="heroicons:exclamation-circle"
            className="w-12 h-12 text-red-500 mx-auto mb-3"
          />
          <p className="text-midnight_text dark:text-white font-semibold">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Calculer les stats pour chaque package
  const getPackageStats = (packageId: string) => {
    const packageAccounts = accounts.filter(
      (acc: any) => acc.packageId?._id === packageId && acc.clientId?.isActive,
    );
    const totalClients = packageAccounts.length;
    const pkg = packages.find((p: any) => p._id === packageId);
    return {
      prix: pkg?.prix || 0,
      totalClients,
      ca: (pkg?.prix || 0) * totalClients,
    };
  };

  const currentTab = packages.find((p: any) => p._id === selectedPackageId);
  const currentStats = currentTab ? getPackageStats(currentTab._id) : null;

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-midnight_text dark:text-white">
          Gestion des Clients
        </h1>
        <p className="text-dark/60 dark:text-white/60 mt-2">
          {accounts.filter((acc: any) => acc.clientId?.isActive).length} clients
          actifs
        </p>
      </div>

      {packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Icon
            icon="heroicons:package"
            className="w-16 h-16 text-dark/20 dark:text-white/20 mb-4"
          />
          <p className="text-midnight_text dark:text-white font-semibold mb-1">
            Aucun package disponible
          </p>
          <p className="text-dark/50 dark:text-white/50 text-sm">
            Les clients apparaîtront ici une fois associés à un package
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2">
            {packages.map((pkg: any) => (
              <button
                key={pkg._id}
                onClick={() => handlePackageChange(pkg._id)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPackageId === pkg._id
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-darkmode text-midnight_text dark:text-white border border-gray-200 dark:border-darkborder hover:border-primary"
                }`}
              >
                {pkg.titre}
              </button>
            ))}
          </div>

          {/* Metrics */}
          {currentStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-darklight rounded-2xl p-4 border border-gray-200 dark:border-darkborder">
                <p className="text-sm text-dark/60 dark:text-white/60 mb-1">
                  Montant Unitaire
                </p>
                <p className="text-2xl font-bold text-midnight_text dark:text-white">
                  ${currentStats.prix.toFixed(2)}
                </p>
              </div>
              <div className="bg-white dark:bg-darklight rounded-2xl p-4 border border-gray-200 dark:border-darkborder">
                <p className="text-sm text-dark/60 dark:text-white/60 mb-1">
                  Total Clients
                </p>
                <p className="text-2xl font-bold text-midnight_text dark:text-white">
                  {currentStats.totalClients}
                </p>
              </div>
              <div className="bg-white dark:bg-darklight rounded-2xl p-4 border border-gray-200 dark:border-darkborder">
                <p className="text-sm text-dark/60 dark:text-white/60 mb-1">
                  Chiffre d'Affaires
                </p>
                <p className="text-2xl font-bold text-success">
                  ${currentStats.ca.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Clients Grid */}
          <div className="bg-white dark:bg-darklight rounded-2xl p-6 border border-gray-200 dark:border-darkborder">
            <ClientsGrid
              clients={displayClients}
              onClientsUpdated={() => loadData()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
