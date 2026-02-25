"use client";
import React from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Image from "next/image";

const OffreCTA = () => {
  return (
    <section className="py-12 md:py-17 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 dark:opacity-5">
        <Image
          src="/images/brands/cart-1.jpg"
          alt="Background"
          fill
          className="object-cover"
        />
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto lg:max-w-xl md:max-w-screen-md px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 dark:bg-primary/30 rounded-full mb-6 animate-bounce-slow">
            <Icon
              icon="mdi:rocket-launch"
              className="text-primary"
              width="40"
            />
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-5xl font-bold text-midnight_text dark:text-white mb-6 animate-slide-up">
            Prêt à démarrer votre transformation ?
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-black/70 dark:text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed animate-slide-up delay-100">
            Rejoignez des centaines d'entreprises qui ont déjà fait le choix de
            l'excellence. Commencez dès aujourd'hui et voyez les résultats en
            quelques jours.
          </p>

          {/* CTA Button */}
          <Link
            href="/#pricing"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all hover:shadow-2xl hover:scale-110 animate-slide-up delay-200"
          >
            <span>Commander maintenant</span>
            <Icon
              icon="mdi:arrow-right"
              className="group-hover:translate-x-2 transition-transform duration-300"
              width="24"
            />
          </Link>

          {/* Trust Points */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-10 animate-fade-in delay-300">
            <div className="flex items-center gap-2 text-black/70 dark:text-white/70">
              <Icon
                icon="mdi:check-decagram"
                className="text-green-500"
                width="24"
              />
              <span className="font-medium">Activation immédiate</span>
            </div>
            <div className="flex items-center gap-2 text-black/70 dark:text-white/70">
              <Icon
                icon="mdi:shield-lock"
                className="text-blue-500"
                width="24"
              />
              <span className="font-medium">Paiement 100% sécurisé</span>
            </div>
            <div className="flex items-center gap-2 text-black/70 dark:text-white/70">
              <Icon icon="mdi:sync" className="text-purple-500" width="24" />
              <span className="font-medium">Sans engagement</span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-10 p-6 bg-white/50 dark:bg-darkmode/50 backdrop-blur-sm border border-border dark:border-darkborder rounded-xl inline-block animate-fade-in delay-400">
            <div className="flex items-start gap-3 text-left">
              <Icon
                icon="mdi:information"
                className="text-primary flex-shrink-0 mt-1"
                width="24"
              />
              <div>
                <p className="font-semibold text-midnight_text dark:text-white mb-1">
                  Besoin d'aide pour choisir ?
                </p>
                <p className="text-sm text-black/70 dark:text-white/70">
                  Notre équipe est disponible 24/7 pour répondre à toutes vos
                  questions
                </p>
              </div>
            </div>
          </div>
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
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          opacity: 0;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};

export default OffreCTA;
