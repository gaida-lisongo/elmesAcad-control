"use client";
import React from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Image from "next/image";

interface OffreHeroProps {
  titre: string;
  description: string;
  prix: number;
}

const OffreHero = ({ titre, description, prix }: OffreHeroProps) => {
  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/5 dark:to-darkmode pt-45 md:pt-40 pb-20 md:pb-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 dark:opacity-5">
        <Image
          src="/images/brands/check-3.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto lg:max-w-xl md:max-w-screen-md px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 animate-fade-in">
            <Icon icon="mdi:star" className="text-primary" width="20" />
            <span className="text-sm font-medium text-primary">
              Offre Premium
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-midnight_text dark:text-white mb-6 animate-slide-up">
            {titre}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-black/70 dark:text-white/70 mb-8 leading-relaxed animate-slide-up delay-100">
            {description}
          </p>

          {/* Price & CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up delay-200">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl md:text-6xl font-bold text-primary">
                {prix}$
              </span>
              <span className="text-xl text-black/50 dark:text-white/50">
                /mois
              </span>
            </div>
            <Link
              href="/#pricing"
              className="group relative px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all hover:shadow-2xl hover:scale-105 flex items-center gap-2"
            >
              Commencer maintenant
              <Icon
                icon="mdi:arrow-right"
                className="group-hover:translate-x-1 transition-transform"
                width="24"
              />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-black/60 dark:text-white/60 animate-fade-in delay-300">
            <div className="flex items-center gap-2">
              <Icon
                icon="mdi:check-circle"
                className="text-green-500"
                width="20"
              />
              <span>Sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon
                icon="mdi:shield-check"
                className="text-blue-500"
                width="20"
              />
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="mdi:headset" className="text-purple-500" width="20" />
              <span>Support 24/7</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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
        @keyframes spin-slow {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        .delay-100 {
          animation-delay: 0.1s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default OffreHero;
