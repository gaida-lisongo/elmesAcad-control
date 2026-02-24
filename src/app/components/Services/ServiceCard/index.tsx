"use client";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import SingleService from "../../Home/Services/SingleService";
import SkeletonCard from "../../Skeleton/ServiceCard/page";
import { useAuthStore } from "@/store/authStore";
import {
  createModule,
  deleteModule,
  getModules,
  updateModule,
} from "@/lib/actions/home/module-actions";

const ServicesCard = () => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    nom: "",
    description: "",
    probleme: "",
    objectifs: "",
    featuresText: "",
  });

  const loadModules = async () => {
    try {
      const result = await getModules();
      if (result.success) {
        setModules(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const clearPreview = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
  };

  const handleOpenCreate = () => {
    clearPreview();
    setEditingId(null);
    setForm({
      nom: "",
      description: "",
      probleme: "",
      objectifs: "",
      featuresText: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (module: any) => {
    clearPreview();
    setEditingId(module._id);
    setForm({
      nom: module.nom || "",
      description: module.description || "",
      probleme: module.probleme || "",
      objectifs: module.objectifs || "",
      featuresText: (module.features || []).join(", "),
    });
    setImagePreview(module.imageUrl || null);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    clearPreview();
    setEditingId(null);
    setForm({
      nom: "",
      description: "",
      probleme: "",
      objectifs: "",
      featuresText: "",
    });
    setIsModalOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    clearPreview();
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSave = async () => {
    if (!form.nom || !form.description || !form.probleme) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setSaving(true);
    try {
      const features = form.featuresText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        nom: form.nom,
        description: form.description,
        probleme: form.probleme,
        objectifs: form.objectifs,
        features,
        imageFile,
      };

      const result = editingId
        ? await updateModule(editingId, payload)
        : await createModule(payload);

      if (result.success) {
        await loadModules();
        handleCancel();
      } else {
        alert(result.error || "Erreur lors de la sauvegarde.");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce module ?")) return;
    try {
      const result = await deleteModule(id);
      if (result.success) {
        await loadModules();
      } else {
        alert(result.error || "Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Une erreur est survenue.");
    }
  };

  return (
    <section className="dark:bg-darkmode bg-[url('/images/plan/price-plan-background-icons.svg')] bg-auto bg-center bg-no-repeat">
      <div className="container mx-auto lg:max-w-xl md:max-w-screen-md px-4">
        <div className="mb-17">
          <h3 className="font-semibold lg:text-6xl sm:text-5xl text-3xl text-black dark:text-white text-center">
            Applications innovantes pour <br /> vos besoins metiers
          </h3>
        </div>
        <div className="grid grid-cols-12 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            : null}
          {!loading && modules.length === 0 && !isAdmin ? (
            <div className="col-span-12 text-center text-black/50 dark:text-white/50 py-10">
              Aucun service disponible.
            </div>
          ) : null}
          {!loading && isAdmin && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="xl:col-span-4 md:col-span-6 col-span-12"
            >
              <div className="h-full border-2 border-dashed border-black/10 dark:border-white/10 rounded-3xl p-10 bg-white/70 dark:bg-darklight/60 hover:border-primary transition-colors">
                <div className="h-full flex flex-col items-center justify-center gap-3 text-black/60 dark:text-white/60">
                  <span className="w-12 h-12 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center">
                    <Icon icon="mdi:plus" width={24} />
                  </span>
                  <span className="font-semibold">Ajouter un module</span>
                </div>
              </div>
            </button>
          )}
          {!loading &&
            modules.map((item: any) => (
              <div
                key={item._id}
                className="xl:col-span-4 md:col-span-6 col-span-12 relative"
              >
                <SingleService
                  withGrid={false}
                  service={{
                    imageUrl: item.imageUrl,
                    title: item.nom,
                    slug: item.slug || slugify(item.nom || ""),
                    description: item.description,
                  }}
                />
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded bg-white/90 dark:bg-darklight shadow"
                    >
                      <Icon icon="mdi:pencil" width={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 rounded bg-white/90 dark:bg-darklight shadow"
                    >
                      <Icon icon="mdi:trash-can-outline" width={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-darklight p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-black dark:text-white">
                {editingId ? "Modifier un module" : "Ajouter un module"}
              </h3>
              <button
                onClick={handleCancel}
                className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
              >
                <Icon icon="mdi:close" width={22} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Nom du service"
                className="w-full px-4 py-2 border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-darkmode text-black dark:text-white"
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm text-black/60 dark:text-white/60">
                  Image du module
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-black/60 dark:text-white/60 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-white file:cursor-pointer"
                />
              </div>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Description"
                rows={3}
                className="w-full px-4 py-2 border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-darkmode text-black dark:text-white md:col-span-2"
              />
              <textarea
                value={form.probleme}
                onChange={(e) => setForm({ ...form, probleme: e.target.value })}
                placeholder="Detail du service"
                rows={3}
                className="w-full px-4 py-2 border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-darkmode text-black dark:text-white md:col-span-2"
              />
              <textarea
                value={form.objectifs}
                onChange={(e) =>
                  setForm({ ...form, objectifs: e.target.value })
                }
                placeholder="Objectifs"
                rows={3}
                className="w-full px-4 py-2 border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-darkmode text-black dark:text-white md:col-span-2"
              />
              <input
                type="text"
                value={form.featuresText}
                onChange={(e) =>
                  setForm({ ...form, featuresText: e.target.value })
                }
                placeholder="Fonctionnalites (separees par des virgules)"
                className="w-full px-4 py-2 border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-darkmode text-black dark:text-white md:col-span-2"
              />
            </div>

            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm text-black/60 dark:text-white/60 mb-2">
                  Apercu
                </p>
                <div className="w-full h-48 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5">
                  <img
                    src={imagePreview}
                    alt="Apercu module"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-orange-600 duration-300 disabled:opacity-50"
              >
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 duration-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ServicesCard;
