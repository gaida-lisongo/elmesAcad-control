"use client";
import React from "react";
import { Icon } from "@iconify/react";

interface OffreBenefitsProps {
  benefices: string[];
  avantages: string[];
}

const benefitIcons = [
  { icon: "mdi:chart-timeline-variant", color: "text-blue-500" },
  { icon: "mdi:lightbulb-on", color: "text-yellow-500" },
  { icon: "mdi:target", color: "text-red-500" },
  { icon: "mdi:rocket-launch", color: "text-purple-500" },
  { icon: "mdi:shield-check", color: "text-green-500" },
  { icon: "mdi:cash-multiple", color: "text-teal-500" },
];

const avantageIcons = [
  { icon: "mdi:clock-fast", color: "text-orange-500" },
  { icon: "mdi:hand-heart", color: "text-pink-500" },
  { icon: "mdi:diamond", color: "text-indigo-500" },
  { icon: "mdi:star-circle", color: "text-amber-500" },
  { icon: "mdi:trophy", color: "text-yellow-600" },
  { icon: "mdi:flash", color: "text-blue-600" },
];

const OffreBenefits = ({ benefices, avantages }: OffreBenefitsProps) => {
  return (
    <section className="py-12 md:py-17 bg-gradient-to-b from-white to-gray-50 dark:from-darkmode dark:to-darkmode/95">
      <div className="container mx-auto lg:max-w-xl md:max-w-screen-md px-4">
        {/* Section Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Icon icon="mdi:heart-circle" className="text-primary" width="20" />
            <span className="text-sm font-medium text-primary">
              Pourquoi choisir cette offre
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-midnight_text dark:text-white mb-4">
            Transformez votre activité dès aujourd'hui
          </h2>
          <p className="text-lg text-black/70 dark:text-white/70 max-w-2xl mx-auto">
            Des bénéfices concrets et des avantages exclusifs pour propulser
            votre réussite
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Benefices Column */}
          <div className="animate-fade-in-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                <Icon icon="mdi:gift" className="text-primary" width="28" />
              </div>
              <h3 className="text-2xl font-bold text-midnight_text dark:text-white">
                Bénéfices
              </h3>
            </div>

            <div className="space-y-4">
              {benefices.map((benefice, index) => {
                const iconData = benefitIcons[index % benefitIcons.length];
                return (
                  <div
                    key={index}
                    className="group flex items-start gap-4 p-4 bg-white dark:bg-darkmode border border-border dark:border-darkborder rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`flex-shrink-0 ${iconData.color} mt-1 group-hover:scale-110 transition-transform`}
                    >
                      <Icon icon={iconData.icon} width="24" />
                    </div>
                    <p className="text-black/80 dark:text-white/80 leading-relaxed">
                      {benefice}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Avantages Column */}
          <div className="animate-fade-in-right">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg">
                <Icon
                  icon="mdi:star-box"
                  className="text-green-600 dark:text-green-400"
                  width="28"
                />
              </div>
              <h3 className="text-2xl font-bold text-midnight_text dark:text-white">
                Avantages
              </h3>
            </div>

            <div className="space-y-4">
              {avantages.map((avantage, index) => {
                const iconData = avantageIcons[index % avantageIcons.length];
                return (
                  <div
                    key={index}
                    className="group flex items-start gap-4 p-4 bg-white dark:bg-darkmode border border-border dark:border-darkborder rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`flex-shrink-0 ${iconData.color} mt-1 group-hover:scale-110 transition-transform`}
                    >
                      <Icon icon={iconData.icon} width="24" />
                    </div>
                    <p className="text-black/80 dark:text-white/80 leading-relaxed">
                      {avantage}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Highlight */}
        <div
          className="mt-12 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 border border-primary/20 rounded-xl text-center animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <Icon icon="mdi:seal-variant" width="24" />
            <span className="font-bold text-lg">Garantie Satisfaction</span>
          </div>
          <p className="text-black/70 dark:text-white/70">
            Rejoignez des centaines d'entreprises qui ont déjà transformé leur
            activité avec nos solutions
          </p>
        </div>
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
        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        .animate-fade-in-left {
          animation: fade-in-left 0.8s ease-out;
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
};

export default OffreBenefits;
