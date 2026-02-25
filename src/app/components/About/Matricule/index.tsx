"use client";
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  getMatricules,
  createMatricule,
  deleteMatricule,
} from "@/lib/actions/about-actions";
import { useAuthStore } from "@/store/authStore";

interface IMatriculeItem {
  _id: string;
  designation: string;
  value: string;
}

const iconMap: { [key: string]: string } = {
  RCCM: "mdi:file-document-outline",
  "Numéro d'Impôt": "mdi:file-document-check-outline",
  "Numéro CNSS": "mdi:shield-account-outline",
  "Numéro de Registre": "mdi:book-outline",
  "Numéro de Certificat": "mdi:certificate",
  Email: "mdi:email-outline",
  Téléphone: "mdi:phone-outline",
  Adresse: "mdi:map-marker-outline",
};

const Matricule = () => {
  const [items, setItems] = useState<IMatriculeItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ designation: "", value: "" });
  const [loading, setLoading] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const result = await getMatricules();
    if (result.success) {
      setItems(result.data);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.designation || !newItem.value) return;

    setLoading(true);
    const result = await createMatricule(newItem.designation, newItem.value);
    if (result.success) {
      await fetchItems();
      setNewItem({ designation: "", value: "" });
      setIsAdding(false);
    }
    setLoading(false);
  };

  const handleDeleteItem = async (id: string) => {
    const result = await deleteMatricule(id);
    if (result.success) {
      await fetchItems();
    }
  };

  return (
    <section className="dark:bg-darkmode py-12 md:py-17">
      <div className="container mx-auto lg:max-w-xl md:max-w-screen-md px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-midnight_text dark:text-white">
            Nos Références Légales
          </h2>
          <p className="text-black/70 dark:text-white/70 text-lg">
            Nos numéros d'immatriculation et d'identité officielle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {items.map((item) => (
            <div
              key={item._id}
              className="border border-border dark:border-darkborder rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon
                  icon={iconMap[item.designation] || "mdi:file-outline"}
                  width="32"
                  height="32"
                  className="text-primary"
                />
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                )}
              </div>
              <h3 className="text-lg font-bold text-midnight_text dark:text-white mb-2">
                {item.designation}
              </h3>
              <p className="text-black/70 dark:text-white/70 font-mono text-sm break-all">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {isAdmin && (
          <div>
            {isAdding ? (
              <div className="border border-border dark:border-darkborder rounded-lg p-6 space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Désignation*
                  </label>
                  <select
                    value={newItem.designation}
                    onChange={(e) =>
                      setNewItem({ ...newItem, designation: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-border dark:border-darkborder dark:bg-darkmode dark:text-white"
                  >
                    <option value="">Choisir une désignation</option>
                    {Object.keys(iconMap).map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Valeur*
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: CD-12345678"
                    value={newItem.value}
                    onChange={(e) =>
                      setNewItem({ ...newItem, value: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-border dark:border-darkborder dark:bg-darkmode dark:text-white"
                  />
                </div>
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
                className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
              >
                + Ajouter une référence
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Matricule;
