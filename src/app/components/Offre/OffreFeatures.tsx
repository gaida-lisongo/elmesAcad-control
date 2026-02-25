"use client";
import React from "react";
import { Icon } from "@iconify/react";

interface Module {
  _id: string;
  titre: string;
  description: string;
}

interface OffreFeaturesProps {
  modules: Module[];
}

const iconOptions = [
  "mdi:rocket-launch",
  "mdi:chart-line",
  "mdi:cog",
  "mdi:database",
  "mdi:cloud",
  "mdi:lock",
  "mdi:speedometer",
  "mdi:puzzle",
];

const gradientOptions = [
  "from-blue-500/20 to-blue-600/20",
  "from-purple-500/20 to-purple-600/20",
  "from-green-500/20 to-green-600/20",
  "from-orange-500/20 to-orange-600/20",
  "from-pink-500/20 to-pink-600/20",
  "from-teal-500/20 to-teal-600/20",
  "from-red-500/20 to-red-600/20",
  "from-indigo-500/20 to-indigo-600/20",
];

const OffreFeatures = ({ modules }: OffreFeaturesProps) => {
  return (
    <section className="py-12 md:py-17 bg-white dark:bg-darkmode">
      <div className="container mx-auto lg:max-w-xl md:max-w-screen-md px-4">
        {/* Section Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Icon
              icon="mdi:star-four-points"
              className="text-primary"
              width="20"
            />
            <span className="text-sm font-medium text-primary">
              Fonctionnalités
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-midnight_text dark:text-white mb-4">
            Ce qui est inclus dans cette offre
          </h2>
          <p className="text-lg text-black/70 dark:text-white/70 max-w-2xl mx-auto">
            Découvrez tous les modules et fonctionnalités qui vous permettront
            d'atteindre vos objectifs
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const icon = iconOptions[index % iconOptions.length];
            const gradient = gradientOptions[index % gradientOptions.length];

            return (
              <div
                key={module._id}
                className="group relative bg-gradient-to-br border border-border dark:border-darkborder rounded-xl p-6 hover:scale-105 hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                ></div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-4 inline-flex items-center justify-center w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon icon={icon} className="text-primary" width="32" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-midnight_text dark:text-white mb-3">
                    {module.titre}
                  </h3>

                  {/* Description */}
                  <p className="text-black/70 dark:text-white/70 leading-relaxed">
                    {module.description}
                  </p>

                  {/* Checkmark Badge */}
                  <div className="mt-4 inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                    <Icon icon="mdi:check-circle" width="18" />
                    <span>Inclus</span>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div
          className="text-center mt-12 animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          <p className="text-black/60 dark:text-white/60 flex items-center justify-center gap-2">
            <Icon icon="mdi:information" width="20" />
            Tous les modules sont activés dès votre souscription
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
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
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
      `}</style>
    </section>
  );
};

export default OffreFeatures;
