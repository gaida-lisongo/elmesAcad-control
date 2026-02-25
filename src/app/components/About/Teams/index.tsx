"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {admins.map((admin, index) => (
            <div
              key={admin._id}
              className="group relative"
              style={{
                animation: `slideInUp 0.6s ease-out ${index * 0.1}s backwards`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              <div className="relative border border-border dark:border-darkborder rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group-hover:scale-105 bg-gradient-to-br from-white/50 to-white/30 dark:from-darkmode/50 dark:to-darkmode/30">
                {/* Image Header */}
                <div className="relative w-full h-56 bg-gradient-to-br from-primary/30 to-primary/10 dark:from-primary/20 dark:to-primary/5 overflow-hidden">
                  {admin.photoUrl ? (
                    <Image
                      src={admin.photoUrl}
                      alt={admin.nomComplet}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-28 h-28 rounded-full bg-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-5xl font-bold text-primary/70">
                          {admin.nomComplet.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-midnight_text dark:text-white mb-2 line-clamp-1">
                    {admin.nomComplet}
                  </h3>

                  <a
                    href={`mailto:${admin.email}`}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm mb-4 transition-colors group"
                  >
                    <Icon icon="mdi:email-outline" width="16" height="16" />
                    <span className="truncate">{admin.email}</span>
                  </a>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-black/60 dark:text-white/60 text-sm">
                      <Icon icon="mdi:calendar" width="14" height="14" />
                      <span>
                        Depuis{" "}
                        {new Date(admin.createdAt).toLocaleDateString("fr-FR", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-black/60 dark:text-white/60 text-sm">
                      <Icon icon="mdi:shield-account" width="14" height="14" />
                      <span>Administrateur</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-border dark:bg-darkborder my-4"></div>

                  {/* Social/Contact Actions */}
                  <div className="flex gap-2">
                    <a
                      href={`mailto:${admin.email}`}
                      className="flex-1 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Icon icon="mdi:email-send" width="16" height="16" />
                      <span>Contacter</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {admins.length === 0 && (
          <div className="text-center py-12">
            <Icon
              icon="mdi:account-multiple-outline"
              width="48"
              height="48"
              className="mx-auto text-gray-400 mb-4"
            />
            <p className="text-black/70 dark:text-white/70 text-lg">
              Aucun administrateur disponible
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default Teams;
