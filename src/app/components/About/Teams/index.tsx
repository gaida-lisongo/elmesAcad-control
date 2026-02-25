"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getAdmins } from "@/lib/actions/about-actions";

interface IAdmin {
  _id: string;
  nomComplet: string;
  email: string;
  photoUrl?: string;
  createdAt: string;
}

const Teams = () => {
  const [admins, setAdmins] = useState<IAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const result = await getAdmins();
    if (result.success) {
      setAdmins(result.data);
    }
    setLoading(false);
  };

  if (loading) {
    return <section className="dark:bg-darkmode py-12 md:py-17"></section>;
  }

  return (
    <section className="dark:bg-darkmode py-12 md:py-17">
      <div className="container mx-auto lg:max-w-xl md:max-w-screen-md px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-midnight_text dark:text-white">
            Notre Équipe
          </h2>
          <p className="text-black/70 dark:text-white/70 text-lg">
            Les experts qui font fonctionner ElmesAcad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {admins.map((admin) => (
            <div
              key={admin._id}
              className="border border-border dark:border-darkborder rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="w-full h-48 relative bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/10 dark:to-primary/5">
                {admin.photoUrl ? (
                  <Image
                    src={admin.photoUrl}
                    alt={admin.nomComplet}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-primary/30 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary">
                        {admin.nomComplet.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-midnight_text dark:text-white mb-2">
                  {admin.nomComplet}
                </h3>
                <a
                  href={`mailto:${admin.email}`}
                  className="text-primary hover:text-primary/90 text-sm mb-4 inline-block"
                >
                  {admin.email}
                </a>
                <p className="text-black/60 dark:text-white/60 text-sm">
                  Administrateur depuis{" "}
                  {new Date(admin.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          ))}
        </div>

        {admins.length === 0 && (
          <div className="text-center py-12">
            <p className="text-black/70 dark:text-white/70 text-lg">
              Aucun administrateur disponible
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Teams;
