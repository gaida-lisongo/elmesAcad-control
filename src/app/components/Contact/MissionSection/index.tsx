"use client";
import React, { useState } from "react";
import { updateContact } from "@/lib/actions/contact-actions";
import { useAuthStore } from "@/store/authStore";

const MissionSection = ({ data }: { data: any }) => {
  if (!data?.mission) {
    return null;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [mission, setMission] = useState(data.mission);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const handleSave = async () => {
    setLoading(true);
    const result = await updateContact({
      email: data.email,
      adresse: data.adresse,
      photoUrl: data.photoUrl,
      mission: mission,
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
          <h2 className="text-2xl font-bold mb-6">Modifier la Mission</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mission</label>
              <textarea
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border dark:border-darkborder dark:bg-transparent dark:text-white whitespace-pre-wrap"
                rows={4}
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

  const displayMission = data.mission;

  return (
    <section className="dark:bg-darkmode py-12">
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
        <div className="flex sm:flex-row flex-col items-start sm:gap-8 gap-4 max-w-2xl">
          <div className="bg-primary/20 w-15 h-15 flex items-center justify-center rounded-full flex-shrink-0">
            <i className="bg-[url('/images/contact-page/Career.svg')] bg-no-repeat bg-contain w-9 h-9 inline-block"></i>
          </div>
          <div className="flex flex-col">
            <span className="text-midnight_text dark:text-white text-xl font-bold">
              Notre mission
            </span>
            <p className="text-black/50 dark:text-white/50 font-normal text-lg pt-3 pb-7 whitespace-pre-wrap">
              {displayMission}
            </p>
          </div>
        </div>
      </div>
      <div className="border-b border-solid border-border dark:border-darkborder mt-8"></div>
    </section>
  );
};

export default MissionSection;
