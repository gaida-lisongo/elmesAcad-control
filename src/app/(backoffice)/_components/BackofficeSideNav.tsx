"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import toast, { Toaster } from "react-hot-toast";

const NAV_GROUPS = [
  {
    label: "Général",
    items: [
      {
        label: "Tableau de bord",
        href: "/dashboard",
        icon: "heroicons:home-20-solid",
      },
      { label: "Profil", href: "/profil", icon: "heroicons:user-20-solid" },
      {
        label: "Réglages",
        href: "/reglages",
        icon: "heroicons:cog-6-tooth-20-solid",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Clients", href: "/clients", icon: "heroicons:users-20-solid" },
      {
        label: "Payouts",
        href: "/payouts",
        icon: "heroicons:banknotes-20-solid",
      },
    ],
  },
  {
    label: "Portail",
    items: [
      {
        label: "Factures",
        href: "/factures",
        icon: "heroicons:document-text-20-solid",
      },
      {
        label: "Transactions",
        href: "/transactions",
        icon: "heroicons:arrows-right-left-20-solid",
      },
    ],
  },
];

export default function BackofficeSideNav() {
  const pathname = usePathname();

  function handleLogout() {
    // TODO: signOut() from next-auth → signOut({ callbackUrl: "/signin" })
    toast("Déconnexion simulée — TODO: brancher next-auth signOut()", {
      icon: "🔒",
    });
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-col gap-4 mt-4 fixed pe-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold uppercase tracking-widest text-dark/40 dark:text-white/30 px-4 mb-1">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 py-2.5 xl:min-w-60 lg:min-w-52 min-w-full px-4 rounded-md text-base font-medium transition-colors duration-150
                    ${
                      isActive
                        ? "bg-primary text-white hover:bg-primary"
                        : "text-midnight_text dark:text-white dark:text-opacity-60 hover:bg-primary/20 hover:text-primary dark:hover:text-primary"
                    }`}
                  >
                    <Icon icon={item.icon} className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div className="pt-3 mt-1 border-t border-gray-200 dark:border-darkborder">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 py-2.5 xl:min-w-60 lg:min-w-52 min-w-full px-4 rounded-md text-base font-medium transition-colors duration-150 text-red-500 hover:bg-red-500/10"
          >
            <Icon
              icon="heroicons:arrow-right-on-rectangle-20-solid"
              className="w-4 h-4 flex-shrink-0"
            />
            Se déconnecter
          </button>
        </div>
      </div>
    </>
  );
}
