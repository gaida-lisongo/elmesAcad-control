"use client";
import React, { FC, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";

interface ClientData {
  nomComplet: string;
  email: string;
  logo: string;
  uuid: string;
  quotite: number;
}

const Footer: FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [uuid, setUuid] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/service");
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setServices(data.ServicesData || []);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchData();
  }, []);

  const handleVerifyClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setClientData(null);

    try {
      const res = await fetch("/api/client/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid }),
      });

      const data = await res.json();

      if (data.success) {
        setClientData(data.data);
        setShowModal(true);
      } else {
        setError(data.message || "Erreur lors de la vérification");
        setShowModal(true);
      }
    } catch (error) {
      setError("Erreur serveur");
      setShowModal(true);
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <footer className="bg-Dark-primary dark:bg-darklight py-17 pb-6">
      <div className="container mx-auto lg:max-w-xl md:max-w-screen-md px-4">
        <div className="grid grid-cols-12 sm:gap-1.875 gap-5">
          <div className="lg:col-span-4 col-span-12">
            <div className="md:pe-7.5">
              <Link href="#">
                <Image
                  src="/images/logo/logo.png"
                  alt="Logo"
                  width={200}
                  height={200}
                />
              </Link>
              <p className="mb-0 font-medium text-lg text-white/50 pt-2.188 pb-1.875">
                Nous ne digitalisons pas simplement un établissement — nous
                construisons l’infrastructure académique du futur.
              </p>
              <p className="text-lg font-medium text-white mb-0">
                Produit de ELMES
              </p>
              <p className="text-white/50 text-lg font-medium mb-0">
                (ElectroMecatronique Services)
              </p>
            </div>
          </div>
          <div className="lg:col-span-4 sm:col-span-6 col-span-12">
            <h4 className="text-lg text-white dark:text-white font-medium mb-2.375">
              Services
            </h4>
            <ul className="grid grid-cols-2 gap-2">
              {services.slice(0, 4).map((item, index) => (
                <li key={index} className="pb-1.563">
                  <Link
                    href={`/services/${item.slug}`}
                    className="text-lg font-medium text-white/50 hover:text-primary"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-4 md:col-span-7 col-span-12">
            <h4 className="text-lg text-white dark:text-white font-medium sm:mb-2.375 mb-6">
              Vérifier votre compte
            </h4>
            <p className="text-lg text-white/50 font-medium mb-4">
              Entrez votre UUID pour vérifier votre compte actif
            </p>
            <form
              onSubmit={handleVerifyClient}
              className="flex sm:flex-nowrap flex-wrap items-center gap-2"
            >
              <input
                type="text"
                value={uuid}
                onChange={(e) => setUuid(e.target.value)}
                placeholder="Votre UUID"
                className="text-base font-medium py-4 px-5 !rounded-lg dark:text-white dark:bg-darkmode h-full border border-border_color focus:border-primary dark:border-border_color dark:focus:border-primary flex-1"
              />
              <button
                type="submit"
                disabled={loading || !uuid}
                className="py-4 px-2.188 bg-primary text-white hover:bg-orange-600 rounded-lg duration-500 sm:w-fit w-full disabled:opacity-50"
              >
                {loading ? "..." : "Vérifier"}
              </button>
            </form>
          </div>
        </div>
        <div className="flex md:flex-nowrap flex-wrap gap-6 items-center justify-between sm:pt-17 pt-10">
          <p className="text-lg font-medium text-white/50 ">
            @2025 - All Rights Reserved by{" "}
            <Link
              href="https://getnextjstemplates.com/"
              className="hover:text-primary"
            >
              GetNextJs Templates
            </Link>
          </p>
          <div className="flex gap-6 items-center">
            <Link
              href="#"
              className="p-2 border-2 bg-transparent border-primary rounded-full group hover:bg-primary hover:border-primary"
            >
              <Icon
                icon="grommet-icons:facebook-option"
                width="24"
                height="24"
                className="text-primary group-hover:text-white"
              />
            </Link>
            <Link
              href="#"
              className="p-2 border-2 bg-transparent border-primary rounded-full group hover:bg-primary hover:border-primary"
            >
              <Icon
                icon="mage:twitter"
                width="24"
                height="24"
                className="text-primary group-hover:text-white"
              />
            </Link>
            <Link
              href="#"
              className="p-2 border-2 bg-transparent border-primary rounded-full group hover:bg-primary hover:border-primary"
            >
              <Icon
                icon="jam:google-plus"
                width="24"
                height="24"
                className="text-primary group-hover:text-white"
              />
            </Link>
            <Link
              href="#"
              className="p-2 border-2 bg-transparent border-primary rounded-full group hover:bg-primary hover:border-primary"
            >
              <Icon
                icon="typcn:social-linkedin"
                width="24"
                height="24"
                className="text-primary group-hover:text-white"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-darkmode rounded-lg p-6 max-w-md w-full">
            {clientData ? (
              <>
                <h3 className="text-xl font-bold mb-4 text-midnight_text dark:text-white">
                  Détails du compte
                </h3>
                {clientData.logo && (
                  <div className="mb-4">
                    <Image
                      src={clientData.logo}
                      alt={clientData.nomComplet}
                      width={100}
                      height={100}
                      className="rounded-lg"
                    />
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Nom
                    </p>
                    <p className="font-medium dark:text-white">
                      {clientData.nomComplet}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="font-medium dark:text-white">
                      {clientData.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      UUID
                    </p>
                    <p className="font-medium dark:text-white text-sm break-all">
                      {clientData.uuid}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Quotité
                    </p>
                    <p className="font-medium dark:text-white">
                      {clientData.quotite}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-4 text-red-600">Erreur</h3>
                <p className="text-gray-700 dark:text-gray-300">{error}</p>
              </>
            )}
            <button
              onClick={() => {
                setShowModal(false);
                setUuid("");
              }}
              className="mt-6 w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
