"use client";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import SingleService from "./SingleService";

const Services = () => {
  const [previewServices, setPreviewServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = async () => {
    try {
      const res = await fetch("/api/service");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      console.log("Fetched services:", data);
      const list = data.ServicesData || [];

      const shuffled = [...list].sort(() => 0.5 - Math.random());
      setPreviewServices(shuffled.slice(0, 3));
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);
  const ref = useRef(null);
  const inView = useInView(ref);

  const TopAnimation = {
    animate: inView ? { y: 0, opacity: 1 } : { y: "-100%", opacity: 0 },
    transition: { duration: 1, delay: 0.4 },
  };

  return (
    <section className="dark:bg-darkmode bg-[url('/images/plan/price-plan-background-icons.svg')] bg-cover bg-center bg-no-repeat overflow-hidden">
      <div
        ref={ref}
        className="container mx-auto lg:max-w-xl md:max-w-screen-md px-4"
      >
        <motion.div {...TopAnimation} className="mb-17">
          <p className="text-black/50 dark:text-white/50 text-lg lg:text-start text-center">
            Votre gestion académique est-elle encore fragmentée ?
          </p>
          <div className="flex lg:flex-row flex-col lg:gap-0 gap-10 justify-between items-center mt-5">
            <h2 className="font-semibold md:text-6xl sm:text-40 text-3xl text-black dark:text-white lg:text-start text-center">
              Applications innovantes pour <br /> vos besoins metiers
            </h2>
            <Link
              href="/services"
              className="py-1.125 px-2.188 bg-primary rounded-lg hover:bg-orange-600 duration-300 text-white font-semibold"
            >
              Tous les services
            </Link>
          </div>
        </motion.div>
        {loading ? (
          <div className="text-center text-black/50 dark:text-white/50 py-10">
            Chargement...
          </div>
        ) : previewServices.length === 0 ? (
          <div className="text-center text-black/50 dark:text-white/50 py-10">
            Aucun service disponible.
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {previewServices.map((item: any) => (
              <SingleService
                key={item.slug}
                service={{
                  imageUrl: item.image,
                  title: item.title,
                  slug: item.slug,
                  description: item.description,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;
