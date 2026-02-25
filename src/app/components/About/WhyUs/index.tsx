"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Logo section */}
          <div className="flex justify-center lg:justify-start">
            <Image
              src="/images/logo/elmes-logo.png"
              alt="ELMES"
              width={300}
              height={300}
              className="w-full max-w-xs"
            />
          </div>

          {/* Content section */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-midnight_text dark:text-white">
              Pourquoi nous choisir
            </h2>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item._id}
                  className="border border-border dark:border-darkborder rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-midnight_text dark:text-white mb-2">
                        {index + 1}. {item.titre}
                      </h3>
                      <p className="text-black/70 dark:text-white/70 text-base">
                        {item.description}
                      </p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="text-red-500 hover:text-red-700 text-sm flex-shrink-0"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="mt-6">
                {isAdding ? (
                  <div className="space-y-3 border border-border dark:border-darkborder rounded-lg p-4">
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
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                      >
                        {loading ? "..." : "Ajouter"}
                      </button>
                      <button
                        onClick={() => setIsAdding(false)}
                        className="flex-1 px-4 py-2 border border-border rounded-lg"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    + Ajouter une raison
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
