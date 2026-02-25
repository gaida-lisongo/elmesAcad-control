"use client";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const workflowSteps = [
  {
    id: 1,
    title: "Choix du pack",
    description:
      "Le client sélectionne le pack adapté (Basique, Pro ou Elite) selon le niveau de digitalisation souhaité.",
  },
  {
    id: 2,
    title: "Paiement & Activation",
    description:
      "Après confirmation du paiement, l'accès à l'espace client est immédiatement débloqué.",
  },
  {
    id: 3,
    title: "Paramétrage du compte",
    description:
      "Le client configure sa quotité, ses informations structurelles et les paramètres nécessaires au dimensionnement.",
  },
  {
    id: 4,
    title: "Dimensionnement serveur",
    description:
      "Nous provisionnons l'infrastructure en fonction des données fournies (charge, volume, sécurité).",
  },
  {
    id: 5,
    title: "Livraison sous 5 heures",
    description:
      "Nous livrons le domaine personnalisé ainsi que les informations de messagerie professionnelle.",
  },
  {
    id: 6,
    title: "Gestion Web & Mobile",
    description:
      "Le client administre sa section ou faculté via son espace web et l'application mobile.",
  },
];

const Features = () => {
  const ref = useRef(null);
  const inView = useInView(ref);

  const leftAnimation = {
    animate: inView ? { x: 0, opacity: 1 } : { x: "-10%", opacity: 0 },
    transition: { duration: 1 },
  };

  const rightAnimation = {
    animate: inView ? { x: 0, opacity: 1 } : { x: "10%", opacity: 0 },
    transition: { duration: 1 },
  };

  return (
    <section className="bg-grey dark:bg-darklight overflow-x-hidden">
      <div
        ref={ref}
        className="container mx-auto lg:max-w-xl md:max-w-screen-md px-4"
      >
        <div className="grid grid-cols-12 xl:gap-24 gap-6 gap-y-11 items-center">
          {/* Image */}
          <div className="lg:col-span-6 col-span-12 px-3">
            <motion.div {...leftAnimation}>
              <Image
                src="/images/brands/cart-1.jpg"
                alt="workflow"
                width={550}
                height={650}
                className="w-full h-full"
              />
            </motion.div>
          </div>

          {/* Workflow */}
          <div className="lg:col-span-6 col-span-12 px-3">
            <motion.div {...rightAnimation}>
              <p className="dark:text-white/50 text-black/50 text-lg pb-6 mb-0">
                Notre Workflow
              </p>

              <h3 className="md:text-5xl text-3xl font-semibold text-dark dark:text-white pb-6">
                De l'achat à la livraison en 5 heures
              </h3>

              <ul>
                {workflowSteps.map((step) => (
                  <li key={step.id} className="flex gap-3 items-start pb-6">
                    <span className="mt-1">
                      <Icon
                        icon="tabler:circle-check"
                        width="24"
                        height="24"
                        className="text-success"
                      />
                    </span>
                    <div>
                      <p className="font-semibold text-dark dark:text-white">
                        {step.title}
                      </p>
                      <p className="text-black/50 dark:text-white/50">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  href="#pricing"
                  className="py-2 px-6 bg-primary rounded-lg hover:bg-orange-600 duration-300 text-white font-semibold block w-fit"
                >
                  Voir les Packs
                </Link>
              </div>

              <p className="text-sm mt-4 text-black/50 dark:text-white/50">
                * Livraison garantie après paiement confirmé et configuration
                complète.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
