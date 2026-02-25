"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import {
  getWhyUs,
  createWhyUs,
  deleteWhyUs,
} from "@/lib/actions/about-actions";
import { useAuthStore } from "@/store/authStore";

interface IWhyUsItem {
  _id: string;
  titre: string;
  description: string;
}

const icons = [
  "mdi:lightning-bolt",
  "mdi:shield-check",
  "mdi:chart-line",
  "mdi:handshake",
  "mdi:target",
  "mdi:star",
];

const colors = [
  "from-blue-500/20 to-blue-600/20",
  "from-green-500/20 to-green-600/20",
  "from-purple-500/20 to-purple-600/20",
  "from-orange-500/20 to-orange-600/20",
  "from-pink-500/20 to-pink-600/20",
  "from-red-500/20 to-red-600/20",
];

const WhyUs = () => {
  const [items, setItems] = useState<IWhyUsItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ titre: "", description: "" });
  const [loading, setLoading] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const result = await getWhyUs();
    if (result.success) {
      setItems(result.data);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.titre || !newItem.description) return;

    setLoading(true);
    const result = await createWhyUs(newItem.titre, newItem.description);
    if (result.success) {
      await fetchItems();
      setNewItem({ titre: "", description: "" });
      setIsAdding(false);
    }
    setLoading(false);
  };

  const handleDeleteItem = async (id: string) => {
    const result = await deleteWhyUs(id);
    if (result.success) {
      await fetchItems();
    }
  };

  return (
    <section className="dark:bg-darkmode py-12 md:py-17">
      <div className="container mx-auto lg:max-w-xl md:max-w-screen-md px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Logo section - Centered and larger with halo */}
          <div className="flex justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10 blur-3xl rounded-full scale-120"></div>
            <Image
              src="/images/logo/LOGO_ELMES-03.png"
              alt="ELMES"
              width={400}
              height={400}
              className="w-full max-w-md relative z-10 drop-shadow-2xl animate-float"
            />
          </div>

          {/* Content section */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-midnight_text dark:text-white">
              Pourquoi nous choisir
            </h2>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item._id}
                  className={`border border-border dark:border-darkborder rounded-lg p-5 bg-gradient-to-r ${
                    colors[index % colors.length]
                  } hover:shadow-lg transition-all duration-300 group hover:scale-105`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                        <Icon
                          icon={icons[index % icons.length]}
                          width="24"
                          height="24"
                          className="text-primary"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-midnight_text dark:text-white mb-2">
                          {item.titre}
                        </h3>
                        <p className="text-black/70 dark:text-white/70 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="text-red-500 hover:text-red-700 text-lg flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="mt-8">
                {isAdding ? (
                  <div className="space-y-3 border border-border dark:border-darkborder rounded-lg p-5 bg-primary/5">
                    <input
                      type="text"
                      placeholder="Titre"
                      value={newItem.titre}
                      onChange={(e) =>
                        setNewItem({ ...newItem, titre: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-border dark:border-darkborder dark:bg-darkmode dark:text-white"
                    />
                    <textarea
                      placeholder="Description"
                      value={newItem.description}
                      onChange={(e) =>
                        setNewItem({ ...newItem, description: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-border dark:border-darkborder dark:bg-darkmode dark:text-white h-20"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddItem}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all"
                      >
                        {loading ? "..." : "Ajouter"}
                      </button>
                      <button
                        onClick={() => setIsAdding(false)}
                        className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-all hover:shadow-lg"
                  >
                    + Ajouter une raison
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default WhyUs;
