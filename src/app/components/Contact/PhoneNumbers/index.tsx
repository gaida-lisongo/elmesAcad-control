"use client";
import React, { useState } from "react";
import { updateContact } from "@/lib/actions/contact-actions";
import { useAuthStore } from "@/store/authStore";

interface PhoneItem {
  service: string;
  mission: string;
  email: string;
  phone: string;
}

const PhoneNumbers = ({ data }: { data: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [phones, setPhones] = useState<PhoneItem[]>(data?.telephones || []);
  const [editingMission, setEditingMission] = useState(data?.mission || "");
  const [editingPhoneIndex, setEditingPhoneIndex] = useState<number | null>(
    null,
  );
  const [editingPhone, setEditingPhone] = useState<PhoneItem | null>(null);
  const [newPhone, setNewPhone] = useState<PhoneItem>({
    service: "",
    mission: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const handleAddPhone = () => {
    if (
      newPhone.service &&
      newPhone.mission &&
      newPhone.email &&
      newPhone.phone
    ) {
      setPhones([...phones, newPhone]);
      setNewPhone({
        service: "",
        mission: "",
        email: "",
        phone: "",
      });
    }
  };

  const handleRemovePhone = (index: number) => {
    setPhones(phones.filter((_, i) => i !== index));
  };

  const handleEditPhone = (index: number) => {
    setEditingPhoneIndex(index);
    setEditingPhone({ ...phones[index] });
  };

  const handleSavePhoneEdit = () => {
    if (editingPhoneIndex !== null && editingPhone) {
      const updatedPhones = [...phones];
      updatedPhones[editingPhoneIndex] = editingPhone;
      setPhones(updatedPhones);
      setEditingPhoneIndex(null);
      setEditingPhone(null);
    }
  };

  const handleCancelPhoneEdit = () => {
    setEditingPhoneIndex(null);
    setEditingPhone(null);
  };

  const handleSave = async () => {
    setLoading(true);
    const result = await updateContact({
      email: data.email,
      adresse: data.adresse,
      photoUrl: data.photoUrl,
      mission: editingMission,
      telephones: phones,
    });

    if (result.success) {
      setIsEditing(false);
    }
    setLoading(false);
  };

  if (!data?.telephones || data.telephones.length === 0) {
    // Pour l'admin, afficher le formulaire même s'il n'y a pas de numéros
    if (!isAdmin) {
      return null;
    }
  }

  if (isEditing && isAdmin) {
    return (
      <section className="dark:bg-darkmode py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-bold mb-6">
            Gérer les numéros et la mission
          </h2>

          <div className="space-y-6">
            {/* Mission globale */}
            <div className="border border-border dark:border-darkborder rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold">Mission générale</h3>
              <textarea
                value={editingMission}
                onChange={(e) => setEditingMission(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border dark:border-darkborder dark:bg-darkmode dark:text-white h-24"
                placeholder="Décrivez votre mission..."
              />
            </div>

            {/* Liste des numéros existants */}
            {phones.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Numéros existants</h3>
                {phones.map((phone, index) => (
                  <div
                    key={index}
                    className="border border-border dark:border-darkborder rounded-lg p-4 space-y-3"
                  >
                    {editingPhoneIndex === index && editingPhone ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Service
                          </label>
                          <input
                            type="text"
                            value={editingPhone.service}
                            onChange={(e) =>
                              setEditingPhone({
                                ...editingPhone,
                                service: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 rounded-lg border border-border dark:border-darkborder dark:bg-transparent dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Mission
                          </label>
                          <input
                            type="text"
                            value={editingPhone.mission}
                            onChange={(e) =>
                              setEditingPhone({
                                ...editingPhone,
                                mission: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 rounded-lg border border-border dark:border-darkborder dark:bg-transparent dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={editingPhone.email}
                            onChange={(e) =>
                              setEditingPhone({
                                ...editingPhone,
                                email: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 rounded-lg border border-border dark:border-darkborder dark:bg-transparent dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            value={editingPhone.phone}
                            onChange={(e) =>
                              setEditingPhone({
                                ...editingPhone,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 rounded-lg border border-border dark:border-darkborder dark:bg-transparent dark:text-white"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSavePhoneEdit}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Valider
                          </button>
                          <button
                            onClick={handleCancelPhoneEdit}
                            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              Service
                            </label>
                            <p className="text-sm">{phone.service}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Mission
                            </label>
                            <p className="text-sm">{phone.mission}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Email</label>
                            <p className="text-sm">{phone.email}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Téléphone
                            </label>
                            <p className="text-sm">{phone.phone}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPhone(index)}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleRemovePhone(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Formulaire pour ajouter un numéro */}
            <div className="border border-border dark:border-darkborder rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold">Ajouter un numéro</h3>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Service*
                </label>
                <input
                  type="text"
                  value={newPhone.service}
                  onChange={(e) =>
                    setNewPhone({ ...newPhone, service: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-border dark:border-darkborder dark:bg-transparent dark:text-white"
                  placeholder="Ex: Support technique"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mission
                </label>
                <input
                  type="text"
                  value={newPhone.mission}
                  onChange={(e) =>
                    setNewPhone({ ...newPhone, mission: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-border dark:border-darkborder dark:bg-transparent dark:text-white"
                  placeholder="Ex: Support"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email*</label>
                <input
                  type="email"
                  value={newPhone.email}
                  onChange={(e) =>
                    setNewPhone({ ...newPhone, email: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-border dark:border-darkborder dark:bg-transparent dark:text-white"
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Téléphone*
                </label>
                <input
                  type="tel"
                  value={newPhone.phone}
                  onChange={(e) =>
                    setNewPhone({ ...newPhone, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-border dark:border-darkborder dark:bg-transparent dark:text-white"
                  placeholder="+243 ..."
                />
              </div>
              <button
                onClick={handleAddPhone}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Ajouter
              </button>
            </div>

            {/* Boutons de sauvegarde */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-6 py-2 border border-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Display mode
  return (
    <>
      {(phones.length > 0 || isAdmin) && (
        <section className="dark:bg-darkmode py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Mission section - side-by-side */}
              <div className="lg:col-span-1">
                <h3 className="text-2xl font-bold mb-4 text-midnight_text dark:text-white">
                  Notre Mission
                </h3>
                <p className="text-black/70 dark:text-white/70 text-lg leading-relaxed whitespace-pre-wrap">
                  {data?.mission || "Mission not defined"}
                </p>
              </div>

              {/* Phone numbers section */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-midnight_text dark:text-white">
                    Nos Contacts
                  </h3>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
                    >
                      Gérer les numéros
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {phones.map((phone, index) => (
                    <div
                      key={index}
                      className="border border-border dark:border-darkborder rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/20 w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0">
                          <i className="bg-[url('/images/contact-page/Career.svg')] bg-no-repeat bg-contain w-6 h-6 inline-block"></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-midnight_text dark:text-white mb-2">
                            {phone.service}
                          </h4>
                          <div className="space-y-2 text-sm text-black/60 dark:text-white/60">
                            <p>
                              <span className="font-semibold">Mission:</span>{" "}
                              {phone.mission}
                            </p>
                            <p>
                              <span className="font-semibold">Email:</span>{" "}
                              <a
                                href={`mailto:${phone.email}`}
                                className="text-primary hover:underline font-medium"
                              >
                                {phone.email}
                              </a>
                            </p>
                            <p>
                              <span className="font-semibold">Téléphone:</span>{" "}
                              <a
                                href={`tel:${phone.phone}`}
                                className="text-primary hover:underline font-medium"
                              >
                                {phone.phone}
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default PhoneNumbers;
