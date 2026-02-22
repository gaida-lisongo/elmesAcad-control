"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Icon } from "@iconify/react";

// ─── Navigation items ────────────────────────────────────────────────────────
const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "heroicons:squares-2x2-20-solid",
  },
  {
    label: "Réglages",
    href: "/reglage",
    icon: "heroicons:cog-6-tooth-20-solid",
  },
  {
    label: "Profile",
    href: "/profile",
    icon: "heroicons:user-circle-20-solid",
  },
];

// ─── Page title map ───────────────────────────────────────────────────────────
function resolvePageTitle(pathname: string): string {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/reglage")) return "Réglages";
  if (pathname.startsWith("/profile")) return "Mon profil";
  return "Backoffice";
}

// ─── Sidebar content (reused for desktop + mobile drawer) ─────────────────────
// Sidebar stays dark-navy in both light & dark (mirrors the template hero/footer palette)
function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-midnight_text dark:bg-darklight">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Icon icon="heroicons:bolt-20-solid" className="w-4 h-4 text-white" />
        </span>
        <span className="text-base font-bold text-white tracking-tight">
          SaasControl
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest text-white/30">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium duration-300 transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon icon={item.icon} className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer hint */}
      <div className="px-5 py-4 border-t border-white/10">
        {/* TODO: display logged-in user info here (name + role) from session */}
        <p className="text-xs text-white/30 truncate">v1.0.0 — MVP</p>
      </div>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
export default function BackofficeShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = resolvePageTitle(pathname);

  return (
    <div className="flex h-screen bg-grey dark:bg-darkmode overflow-hidden">
      {/* ── Desktop sidebar ────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 flex-shrink-0">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* ── Mobile drawer (HeadlessUI Dialog) ─────────────────── */}
      <Dialog
        open={mobileOpen}
        onClose={setMobileOpen}
        className="relative z-50 lg:hidden"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-dark/70 backdrop-blur-sm"
          aria-hidden="true"
        />

        <div className="fixed inset-0 flex">
          <DialogPanel className="relative w-64 flex flex-col flex-shrink-0 max-w-xs">
            {/* Close button outside drawer */}
            <div className="absolute top-4 right-[-48px]">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-10 h-10 rounded-full bg-midnight_text text-white flex items-center justify-center"
                aria-label="Fermer le menu"
              >
                <Icon icon="heroicons:x-mark-20-solid" className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </DialogPanel>
        </div>
      </Dialog>

      {/* ── Main area ──────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between h-14 px-5 bg-white dark:bg-darklight border-b border-gray-200 dark:border-darkborder flex-shrink-0">
          {/* Left: hamburger (mobile) + page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-midnight_text dark:text-white/60 hover:text-midnight_text dark:hover:text-white hover:bg-grey dark:hover:bg-darkmode duration-300"
              aria-label="Ouvrir le menu"
            >
              <Icon icon="heroicons:bars-3-20-solid" className="w-5 h-5" />
            </button>
            <span className="text-base font-semibold text-midnight_text dark:text-white">
              {pageTitle}
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {/* TODO: notifications bell — connect to real alerts */}
            <button className="p-1.5 rounded-lg text-midnight_text/50 dark:text-white/50 hover:text-primary dark:hover:text-primary hover:bg-grey dark:hover:bg-darkmode duration-300">
              <Icon icon="heroicons:bell-20-solid" className="w-5 h-5" />
            </button>

            {/* TODO: replace with real session user from useSession() */}
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-grey dark:hover:bg-darkmode duration-300 text-sm font-medium text-midnight_text dark:text-white">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                A
              </span>
              <span className="hidden sm:block">Admin</span>
              <Icon
                icon="heroicons:chevron-down-20-solid"
                className="w-4 h-4 text-midnight_text/40 dark:text-white/40"
              />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
