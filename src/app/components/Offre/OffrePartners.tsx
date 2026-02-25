"use client";
import React from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";

interface Client {
  _id: string;
  nomComplet: string;
  logo: string;
}

interface OffrePartnersProps {
  clients: Client[];
}

const OffrePartners = ({ clients }: OffrePartnersProps) => {
  return (
    <section className="py-12 md:py-17 bg-gradient-to-b from-gray-50 to-white dark:from-darkmode/95 dark:to-darkmode">
      <div className="container mx-auto lg:max-w-xl md:max-w-screen-md px-4">
        {/* Section Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Icon icon="mdi:handshake" className="text-primary" width="20" />
            <span className="text-sm font-medium text-primary">
              Nos Partenaires
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-midnight_text dark:text-white mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-lg text-black/70 dark:text-white/70 max-w-2xl mx-auto">
            Rejoignez des entreprises de renom qui ont choisi nos solutions
          </p>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-12">
            <Icon
              icon="mdi:briefcase-outline"
              className="text-black/20 dark:text-white/20 mx-auto mb-4"
              width="64"
            />
            <p className="text-black/50 dark:text-white/50">
              Aucun partenaire pour le moment
            </p>
          </div>
        ) : (
          <>
            {/* Partners Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {clients.map((client, index) => (
                <div
                  key={client._id}
                  className="group relative bg-white dark:bg-darkmode border border-border dark:border-darkborder rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Logo Container */}
                  <div className="relative aspect-square w-full flex items-center justify-center overflow-hidden">
                    {client.logo ? (
                      <Image
                        src={client.logo}
                        alt={client.nomComplet}
                        width={120}
                        height={120}
                        className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <Icon
                          icon="mdi:domain"
                          className="text-gray-400"
                          width="48"
                        />
                      </div>
                    )}
                  </div>

                  {/* Client Name */}
                  <p className="mt-4 text-sm font-medium text-center text-midnight_text dark:text-white line-clamp-2">
                    {client.nomComplet}
                  </p>

                  {/* Hover Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>
              ))}
            </div>

            {/* Stats Banner */}
            <div
              className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 dark:from-primary/20 dark:via-primary/10 dark:to-primary/20 rounded-xl p-8 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon
                      icon="mdi:account-group"
                      className="text-primary"
                      width="32"
                    />
                  </div>
                  <div className="text-3xl font-bold text-midnight_text dark:text-white mb-1">
                    {clients.length}+
                  </div>
                  <div className="text-sm text-black/70 dark:text-white/70">
                    Clients actifs
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon
                      icon="mdi:star"
                      className="text-yellow-500"
                      width="32"
                    />
                  </div>
                  <div className="text-3xl font-bold text-midnight_text dark:text-white mb-1">
                    4.9/5
                  </div>
                  <div className="text-sm text-black/70 dark:text-white/70">
                    Satisfaction client
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon
                      icon="mdi:trophy"
                      className="text-amber-500"
                      width="32"
                    />
                  </div>
                  <div className="text-3xl font-bold text-midnight_text dark:text-white mb-1">
                    98%
                  </div>
                  <div className="text-sm text-black/70 dark:text-white/70">
                    Taux de rétention
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
};

export default OffrePartners;
