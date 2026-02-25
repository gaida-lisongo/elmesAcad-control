"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { getHero, createOrUpdateHero } from "@/lib/actions/home/hero-actions";
import { Loader } from "../../Common";

interface HeroData {
  _id?: string;
  promesse: string;
  description: string;
  imageUrl: string;
}

const DEFAULT_HERO: HeroData = {
  promesse: "Build Innovative Apps For Your Business",
  description:
    "Build smarter, move faster, and grow stronger with custom apps designed to support your business every step of the way.",
  imageUrl: "/images/hero/right-image.png",
};

const Hero: React.FC<{ data: HeroData }> = ({ data }) => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const [loading, setLoading] = useState(false);

  const [heroData, setHeroData] = useState<HeroData>(data || DEFAULT_HERO);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [tempData, setTempData] = useState<HeroData>(data || DEFAULT_HERO);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagePreviewRef = useRef<string | null>(null);

  const leftAnimation = {
    initial: { x: "-25%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 1, delay: 0.8 },
  };
  const rightAnimation = {
    initial: { x: "25%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 1, delay: 0.8 },
  };

  // Charger les données Hero au montage
  useEffect(() => {
    const fetchHero = async () => {
      setLoading(true);
      try {
        const result = await getHero();
        if (result.success && result.data) {
          setHeroData(result.data);
          setTempData(result.data);
        }
      } catch (error) {
        console.error("Erreur au chargement de Hero:", error);
      } finally {
        setLoading(false);
      }
    };
    // fetchHero();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (limiter à 5MB avant compression)
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image est trop volumineuse (max 5MB)");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        imagePreviewRef.current = base64;
        setTempData({ ...tempData, imageUrl: base64 });
        setEditingField(null);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(file);

          // Limiter la largeur à 1200px max
          const maxWidth = 1200;
          const scale = maxWidth / img.width;
          const newWidth = maxWidth;
          const newHeight = img.height * scale;

          canvas.width = newWidth;
          canvas.height = newHeight;
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          canvas.toBlob(
            (blob) => {
              resolve(blob || file);
            },
            "image/jpeg",
            0.8,
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleStartEdit = (field: string) => {
    if (isAdmin) {
      setEditingField(field);
    }
  };

  const handleFieldChange = (field: keyof HeroData, value: string) => {
    setTempData({ ...tempData, [field]: value });
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!tempData.promesse || !tempData.description) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setSubmitting(true);
    try {
      let imageFile: File | null = null;

      // Si une nouvelle image a été sélectionnée via l'input file
      if (fileInputRef.current?.files?.[0]) {
        const originalFile = fileInputRef.current.files[0];
        const compressedBlob = await compressImage(originalFile);
        imageFile = new File([compressedBlob], originalFile.name, {
          type: "image/jpeg",
        });
      }

      const result = await createOrUpdateHero({
        promesse: tempData.promesse,
        description: tempData.description,
        imageFile,
      });

      if (result.success) {
        setHeroData(result.data);
        setEditingField(null);
        setHasChanges(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        alert(result.message || "Hero mise à jour avec succès!");
      } else {
        alert(result.error || "Erreur lors de la mise à jour.");
      }
    } catch (error) {
      console.error("Erreur à la sauvegarde:", error);
      alert("Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTempData(heroData);
    setEditingField(null);
    setHasChanges(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    imagePreviewRef.current = null;
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <section className="overflow-x-hidden before:content-[''] before:absolute lg:before:h-full sm:before:h-2/3 before:h-3/5 before:bg-no-repeat before:bg-[url('/images/hero/right-background.svg')] before:bg-cover before:right-0 lg:before:top-0 before:bottom-0 lg:before:w-40% before:w-full lg:before:z-0 before:z-1 sm:before:block before:hidden after:content-[''] after:absolute after:bg-grey dark:after:bg-darklight after:h-full lg:after:w-60% after:w-full after:left-0 after:top-0 relative h-full lg:py-9.375! pt-24! pb-0!">
      <div className="container mx-auto lg:max-w-xl md:max-w-screen-md">
        {/* Barre d'outils flottante pour admins */}
        {isAdmin && hasChanges && (
          <div className="fixed top-24 right-6 z-50 flex gap-2 bg-white dark:bg-darklight p-3 rounded-lg shadow-lg">
            <button
              onClick={handleSaveChanges}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 duration-300"
            >
              {submitting ? "Sauvegarde..." : "Sauvegarder"}
            </button>
            <button
              onClick={handleCancel}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 duration-300"
            >
              Annuler
            </button>
          </div>
        )}

        <div className="grid-cols-12 grid z-1 items-center relative">
          {/* Section Gauche */}
          <div className="lg:col-span-6 col-span-12 px-4">
            <motion.div
              {...leftAnimation}
              className="relative before:content-[''] before:absolute before:h-full before:w-full before:bg-[url('/images/hero/leftside-backlayer-icons.svg')] before:-left-9.375 before:bg-contain before:bg-no-repeat before:-z-1"
            >
              {/* Promesse */}
              <div className="group relative">
                {editingField === "promesse" ? (
                  <input
                    type="text"
                    value={tempData.promesse}
                    onChange={(e) =>
                      handleFieldChange("promesse", e.target.value)
                    }
                    maxLength={100}
                    autoFocus
                    className="w-full text-dark dark:text-white mb-0 md:text-65 sm:text-4xl text-3xl bg-transparent border-b-2 border-primary focus:outline-none focus:ring-0"
                  />
                ) : (
                  <h1 className="text-dark dark:text-white mb-0 md:text-65 sm:text-4xl text-3xl cursor-pointer hover:opacity-75 transition-opacity">
                    {tempData.promesse}
                  </h1>
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleStartEdit("promesse")}
                    className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                  >
                    <Icon icon="mdi:pencil" width={20} />
                  </button>
                )}
              </div>

              {/* Description */}
              <div className="group relative mt-4">
                {editingField === "description" ? (
                  <textarea
                    value={tempData.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    maxLength={300}
                    rows={3}
                    autoFocus
                    className="w-full text-lg font-medium text-black/50 dark:text-white/50 sm:py-1.875 py-5 bg-transparent border-2 border-primary rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-lg font-medium text-black/50 dark:text-white/50 sm:py-1.875 py-5 cursor-pointer hover:opacity-75 transition-opacity">
                    {tempData.description}
                  </p>
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleStartEdit("description")}
                    className="absolute -right-10 top-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                  >
                    <Icon icon="mdi:pencil" width={20} />
                  </button>
                )}
              </div>

              <Link
                href="/about"
                className="sm:px-2.188 px-4 sm:py-1.125 py-2 rounded-lg text-base hover:cursor-pointer font-semibold bg-primary text-white hover:bg-orange-600 duration-500 inline-block sm:mb-0 mb-4 mt-4"
              >
                En savoir plus
              </Link>
            </motion.div>
          </div>

          {/* Section Droite - Image */}
          <div className="lg:col-span-6 col-span-12 sm:bg-none bg-[url('/images/hero/right-background.svg')] px-4">
            <motion.div {...rightAnimation} className="group relative">
              <Image
                src={tempData.imageUrl}
                alt="hero Image"
                width={700}
                height={700}
                className="w-full h-full cursor-pointer hover:opacity-75 transition-opacity"
              />

              {isAdmin && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon icon="mdi:pencil" width={40} color="white" />
                    <span className="text-white text-sm font-semibold">
                      Changer l'image
                    </span>
                  </div>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
