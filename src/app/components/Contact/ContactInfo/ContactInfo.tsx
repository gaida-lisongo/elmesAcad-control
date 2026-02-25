"use client";
import React, { useState } from "react";
import { updateContact } from "@/lib/actions/contact-actions";
import { useAuthStore } from "@/store/authStore";

const ContactInfo = ({ data }: { data: any }) => {
  if (!data?.email || !data?.adresse) {
    return null;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: data.email,
    adresse: data.adresse,
  });
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";
  const contact = data;

  const handleSave = async () => {
    setLoading(true);
    const result = await updateContact({
      email: formData.email,
      adresse: formData.adresse,
      photoUrl: data.photoUrl,
      mission: data.mission,
      telephones: data.telephones || [],
    });

    if (result.success) {
      setIsEditing(false);
    }
    setLoading(false);
  };

  if (isEditing && isAdmin) {
    return (
      <section className="dark:bg-darkmode py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-bold mb-6">Modifier Email & Adresse</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-border dark:border-darkborder dark:bg-transparent dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Adresse</label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) =>
                  setFormData({ ...formData, adresse: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-border dark:border-darkborder dark:bg-transparent dark:text-white"
                required
              />
            </div>
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
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="dark:bg-darkmode">
      <div className="container mx-auto px-4">
        {isAdmin && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Modifier
            </button>
          </div>
        )}
        <div className="flex md:flex-row flex-col items-stretch justify-center sm:gap-28 gap-8">
          <div className="flex sm:flex-row flex-col items-start sm:gap-8 gap-4">
            <div className="bg-primary/20 w-15 h-15 flex items-center justify-center rounded-full">
              <i className="bg-[url('/images/contact-page/email.svg')] bg-no-repeat bg-contain w-8 h-8 inline-block"></i>
            </div>
            <div>
              <span className="text-midnight_text dark:text-white text-xl font-bold">
                Envoyez-nous un email
              </span>
              <p className="text-black/50 dark:text-white/50 font-normal text-lg max-w-80 pt-3 pb-7">
                N'hésitez pas à nous contacter à {contact.email}, nous vous
                répondrons rapidement
              </p>
            </div>
          </div>
          <div className="flex sm:flex-row flex-col items-start sm:gap-8 gap-4">
            <div className="bg-primary/20 w-15 h-15 flex items-center justify-center rounded-full">
              <i className="bg-[url('/images/contact-page/Career.svg')] bg-no-repeat bg-contain w-9 h-9 inline-block"></i>
            </div>
            <div className="flex flex-col h-full justify-between">
              <div>
                <span className="text-midnight_text dark:text-white text-xl font-bold">
                  Adresse
                </span>
                <p className="text-black/50 dark:text-white/50 font-normal text-lg max-w-80 pt-3 pb-7">
                  {contact.adresse}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-b border-solid border-border dark:border-darkborder mt-8"></div>
    </section>
  );
};

export default ContactInfo;
