"use client";
import { useState, useEffect } from "react";
import { Switch } from "@headlessui/react";
import { Icon } from "@iconify/react";
import Logo from "@/app/components/Layout/Header/Logo";
import SinglePlan from "./SinglePlan";
import { useAuthStore } from "@/store/authStore";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from "@/lib/actions/home/package-actions";
import { getModules } from "@/lib/actions/home/module-actions";

interface Plan {
  _id?: string;
  type: string;
  price: number;
  text: string;
  benefits: string[];
  avantages?: string[];
  features?: string[];
  packageHeritage?: string | null;
  modules?: string[];
}

interface PlanProps {
  onSelectPackage?: (plan: Plan) => void;
  ref: string;
}

const Plan = ({ onSelectPackage, ref }: PlanProps) => {
  const [enabled, setEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [MonthlyPlans, setMonthlyPlans] = useState<any[]>([]);
  const [yearlyPlans, setyearlyPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [allModules, setAllModules] = useState<any[]>([]);
  const [allPackages, setAllPackages] = useState<any[]>([]);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const [form, setForm] = useState({
    titre: "",
    prix: 0,
    description: "",
    packageHeritage: "",
    modules: [] as string[],
    benefices: "",
    avantages: "",
    features: "",
  });

  useEffect(() => {
    loadPackages();
    loadModules();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const result = await getPackages();
      if (result.success && result.data) {
        const packages = result.data;
        setAllPackages(packages);

        // Mapper au format attendu
        const mapped = packages.map((pkg: any) => ({
          _id: pkg._id,
          type: pkg.titre,
          price: pkg.prix,
          text: pkg.description,
          benefits: pkg.modules?.map((m: any) => m.nom) || [],
          avantages: pkg.avantages || [],
          features: pkg.features || [],
          packageHeritage: pkg.packageHeritage?._id || null,
          modules: pkg.modules?.map((m: any) => m._id) || [],
        }));

        setMonthlyPlans(mapped);
        setyearlyPlans(mapped);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async () => {
    try {
      const result = await getModules();
      if (result.success && result.data) {
        setAllModules(result.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des modules:", error);
    }
  };

  const plans = enabled ? yearlyPlans : MonthlyPlans;

  const openModal = (plan: Plan) => {
    if (onSelectPackage) {
      onSelectPackage(plan);
    } else {
      setSelectedPlan(plan);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      titre: "",
      prix: 0,
      description: "",
      packageHeritage: "",
      modules: [],
      benefices: "",
      avantages: "",
      features: "",
    });
    setIsAdminModalOpen(true);
  };

  const handleEdit = (pkg: any) => {
    setEditingId(pkg._id);
    setForm({
      titre: pkg.type,
      prix: pkg.price,
      description: pkg.text,
      packageHeritage: pkg.packageHeritage || "",
      modules: pkg.modules || [],
      benefices: (pkg.benefits || []).join(", "),
      avantages: (pkg.avantages || []).join(", "),
      features: (pkg.features || []).join(", "),
    });
    setIsAdminModalOpen(true);
  };

  const handleCancel = () => {
    setIsAdminModalOpen(false);
    setEditingId(null);
    setForm({
      titre: "",
      prix: 0,
      description: "",
      packageHeritage: "",
      modules: [],
      benefices: "",
      avantages: "",
      features: "",
    });
  };

  const handleSave = async () => {
    if (!form.titre || !form.description || form.prix <= 0) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        titre: form.titre,
        description: form.description,
        prix: form.prix,
        packageHeritage: form.packageHeritage || undefined,
        modules: form.modules,
        benefices: form.benefices
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean),
        avantages: form.avantages
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        features: form.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
      };

      let result;
      if (editingId) {
        result = await updatePackage(editingId, payload);
      } else {
        result = await createPackage(payload);
      }

      if (result.success) {
        await loadPackages();
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
    if (!confirm("Supprimer ce package ?")) return;
    try {
      const result = await deletePackage(id);
      if (result.success) {
        await loadPackages();
      } else {
        alert(result.error || "Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Une erreur est survenue.");
    }
  };

  const handleModuleToggle = (moduleId: string) => {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.includes(moduleId)
        ? prev.modules.filter((id) => id !== moduleId)
        : [...prev.modules, moduleId],
    }));
  };

  return (
    <section
      id={ref}
      className="relative bg-contain bg-no-repeat bg-[url('/images/plan/price-plan-background-icons.svg')] bg-center dark:bg-darkmode"
    >
      <div className="container mx-auto lg:max-w-xl md:max-w-screen-md px-4">
        <div className="text-center">
          <p className="text-lg text-black/50 dark:text-white/50 mb-1.875">
            Pricing Plan
          </p>
          <h3 className="md:text-6xl sm:text-40 text-3xl font-semibold text-dark dark:text-white">
            What’s About Our
            <br /> Pricing Subscription
          </h3>
          <div className="mt-17 mb-5">
            <div className="flex justify-center items-center gap-4">
              <label
                htmlFor="switch"
                className="text-lg font-semibold text-black dark:text-white"
              >
                Monthly
              </label>
              <Switch
                checked={enabled}
                id="switch"
                onChange={setEnabled}
                className="group inline-flex h-6 w-3.125 items-center rounded-full border border-black dark:border-white/25 transition data-[checked]:bg-lightyellow data-[checked]:border-transparent"
              >
                <span className="size-4 translate-x-1 rounded-full bg-black dark:bg-white/25 transition group-data-[checked]:translate-x-7 group-data-[checked]:bg-white" />
              </Switch>
              <label
                htmlFor="switch"
                className="text-lg font-semibold text-black dark:text-white"
              >
                Yearly
              </label>
            </div>
          </div>
          <div className="inline-block relative">
            <p className="text-primary font-medium text-sm">Save Up To 58%</p>
            <Icon
              icon="ph:arrow-bend-right-up"
              width="24"
              height="24"
              className="absolute -top-3 -right-1.875"
            />
          </div>
          <div className="grid grid-cols-12 pt-17 sm:gap-1.875 gap-y-1.875">
            {loading ? (
              <div className="col-span-12 text-center py-10">
                <p className="text-black/50 dark:text-white/50">
                  Chargement...
                </p>
              </div>
            ) : null}

            {!loading && plans.length === 0 && !isAdmin ? (
              <div className="col-span-12 text-center py-10">
                <p className="text-black/50 dark:text-white/50">
                  Aucun package disponible.
                </p>
              </div>
            ) : null}

            {!loading && isAdmin && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="xl:col-span-4 md:col-span-6 col-span-12"
              >
                <div className="h-full border-2 border-dashed border-black/10 dark:border-white/10 rounded-3xl p-10 bg-white/70 dark:bg-darklight/60 hover:border-primary transition-colors min-h-[400px]">
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-black/60 dark:text-white/60">
                    <span className="w-12 h-12 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center">
                      <Icon icon="mdi:plus" width={24} />
                    </span>
                    <span className="font-semibold">Ajouter un package</span>
                  </div>
                </div>
              </button>
            )}

            {!loading &&
              plans.map((item: any, index: number) => (
                <div
                  key={item._id || index}
                  className="xl:col-span-4 md:col-span-6 col-span-12 relative"
                >
                  <SinglePlan plan={item} onSelect={openModal} />
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
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
      </div>
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
          <div className="bg-white dark:bg-darkmode p-6 rounded-lg h-auto max-h-[800px] overflow-y-auto relative">
            <div className="flex items-center mb-10">
              <div className="text-center mx-auto inline-block max-w-40">
                <Logo />
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-5 h-5 absolute right-0 top-0 mr-8 mt-8 text-black/50 dark:text-white/50"
                aria-label="Close Sign Up Modal"
              >
                <Icon icon="ph:x-circle" width="24" height="24" />
              </button>
            </div>

            <div className="z-1 relative my-8 text-center">
              <span className="-z-1 absolute left-0 top-1/2 block h-px w-full bg-stroke dark:bg-border_color"></span>
              <span className="text-body-secondary relative z-10 inline-block bg-white px-3 text-base dark:bg-darkmode">
                Checkout
              </span>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-6">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-lg border border-stroke border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-border_color dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-lg border border-stroke border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-border_color dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Street Address"
                  className="w-full rounded-lg border border-stroke border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-border_color dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="City"
                  className="w-full rounded-lg border border-stroke border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-border_color dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Credit Card Number"
                  className="w-full rounded-lg border border-stroke border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-border_color dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="flex gap-2 mb-6">
                <div className="w-1/2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full rounded-lg border border-stroke border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-border_color dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    placeholder="CVV"
                    className="w-full rounded-lg border border-stroke border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-border_color dark:text-white dark:focus:border-primary"
                  />
                </div>
              </div>

              <div className="mb-6 flex flex-col gap-3">
                <div className="flex justify-between text-xs">
                  <p className="text-base">Plan Type:</p>
                  <p className="text-base font-semibold">{selectedPlan.type}</p>
                </div>
                <div className="flex justify-between text-xs">
                  <p className="text-base">Total Price:</p>
                  <p className="text-base font-semibold">
                    ${selectedPlan.price}
                  </p>
                </div>
              </div>
              <div className="">
                <button
                  type="submit"
                  onClick={closeModal}
                  className="px-5 py-3 w-full rounded-lg bg-primary text-white text-base transition duration-300 ease-in-out hover:bg-orange-600"
                >
                  Complete Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      {isAdmin && isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-darklight p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-black dark:text-white">
                {editingId ? "Modifier un package" : "Ajouter un package"}
              </h3>
              <button
                onClick={handleCancel}
                className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
              >
                <Icon icon="mdi:close" width={22} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Titre */}
              <div>
                <label className="text-sm text-black/60 dark:text-white/60 mb-1 block">
                  Titre du package *
                </label>
                <input
                  type="text"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  placeholder="Nom du package"
                  className="w-full px-4 py-2 border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-darkmode text-black dark:text-white"
                />
              </div>

              {/* Prix */}
              <div>
                <label className="text-sm text-black/60 dark:text-white/60 mb-1 block">
                  Prix (USD) *
                </label>
                <input
                  type="number"
                  value={form.prix}
                  onChange={(e) =>
                    setForm({ ...form, prix: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Prix en dollars"
                  className="w-full px-4 py-2 border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-darkmode text-black dark:text-white"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="text-sm text-black/60 dark:text-white/60 mb-1 block">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Description du package"
                  rows={3}
                  className="w-full px-4 py-2 border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-darkmode text-black dark:text-white"
                />
              </div>

              {/* Package Héritage */}
              <div className="md:col-span-2">
                <label className="text-sm text-black/60 dark:text-white/60 mb-1 block">
                  Package hérité (optionnel)
                </label>
                <select
                  value={form.packageHeritage}
                  onChange={(e) =>
                    setForm({ ...form, packageHeritage: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-darkmode text-black dark:text-white"
                >
                  <option value="">Aucun</option>
                  {allPackages
                    .filter((pkg) => pkg._id !== editingId)
                    .map((pkg) => (
                      <option key={pkg._id} value={pkg._id}>
                        {pkg.titre}
                      </option>
                    ))}
                </select>
              </div>

              {/* Modules (Select Multiple) */}
              <div className="md:col-span-2">
                <label className="text-sm text-black/60 dark:text-white/60 mb-2 block">
                  Modules inclus
                </label>
                <div className="border border-black/10 dark:border-white/10 rounded-lg p-3 max-h-48 overflow-y-auto bg-white dark:bg-darkmode">
                  {allModules.length === 0 ? (
                    <p className="text-sm text-black/50 dark:text-white/50">
                      Aucun module disponible
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {allModules.map((module) => (
                        <label
                          key={module._id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={form.modules.includes(module._id)}
                            onChange={() => handleModuleToggle(module._id)}
                            className="w-4 h-4 text-primary border-black/10 dark:border-white/10 rounded focus:ring-primary"
                          />
                          <span className="text-sm text-black dark:text-white">
                            {module.nom}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bénéfices */}
              <div className="md:col-span-2">
                <label className="text-sm text-black/60 dark:text-white/60 mb-1 block">
                  Bénéfices (séparés par des virgules)
                </label>
                <textarea
                  value={form.benefices}
                  onChange={(e) =>
                    setForm({ ...form, benefices: e.target.value })
                  }
                  placeholder="Basic CRM features, Email Power Tools, etc."
                  rows={2}
                  className="w-full px-4 py-2 border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-darkmode text-black dark:text-white"
                />
              </div>

              {/* Avantages */}
              <div className="md:col-span-2">
                <label className="text-sm text-black/60 dark:text-white/60 mb-1 block">
                  Avantages (séparés par des virgules)
                </label>
                <textarea
                  value={form.avantages}
                  onChange={(e) =>
                    setForm({ ...form, avantages: e.target.value })
                  }
                  placeholder="Support 24/7, Formation incluse, etc."
                  rows={2}
                  className="w-full px-4 py-2 border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-darkmode text-black dark:text-white"
                />
              </div>

              {/* Features */}
              <div className="md:col-span-2">
                <label className="text-sm text-black/60 dark:text-white/60 mb-1 block">
                  Fonctionnalités (séparées par des virgules)
                </label>
                <textarea
                  value={form.features}
                  onChange={(e) =>
                    setForm({ ...form, features: e.target.value })
                  }
                  placeholder="API Access, Custom Domain, etc."
                  rows={2}
                  className="w-full px-4 py-2 border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-darkmode text-black dark:text-white"
                />
              </div>
            </div>

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

export default Plan;
