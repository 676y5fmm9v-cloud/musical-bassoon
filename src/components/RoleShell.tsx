"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { KalanMark, KalanWordmark } from "@/components/KalanLogo";
import { IconMenu, IconX } from "@/components/icons";
import { logoutAction } from "@/app/login/actions";

export interface NavItem {
  href: string;
  label: string;
  // Pre-rendered JSX, not a component reference: server layouts pass this
  // across the Server→Client boundary, where a bare function reference
  // (the component itself) cannot be serialized.
  icon: ReactNode;
  exact?: boolean;
}

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

export function RoleShell({
  brandLabel,
  userName,
  userSubLabel,
  accent = "green",
  navItems,
  children,
}: {
  brandLabel: string;
  userName: string;
  userSubLabel?: string;
  accent?: "green" | "red";
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const activeClass =
    accent === "red"
      ? "bg-kalan-red text-white"
      : "bg-kalan-yellow text-slate-900";

  const links = (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {navItems.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? activeClass : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-slate-800 px-4 py-3">
      <div className="mb-2 px-1">
        <div className="truncate text-sm font-semibold text-white">{userName}</div>
        {userSubLabel && (
          <div className="truncate text-xs text-slate-400">{userSubLabel}</div>
        )}
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-300 hover:bg-slate-800"
        >
          🚪 Se déconnecter
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex h-full min-h-screen flex-col lg:flex-row">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <KalanMark className="h-7 w-7" />
          <div>
            <KalanWordmark className="text-base" tone="dark" />
            <div className="text-[9px] font-bold tracking-wider text-slate-400">
              {brandLabel}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-slate-300 hover:bg-slate-800"
          aria-label="Ouvrir le menu"
        >
          <IconMenu />
        </button>
      </div>

      <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 lg:flex">
        <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-5">
          <KalanMark className="h-9 w-9" />
          <div>
            <KalanWordmark className="text-xl" tone="dark" />
            <div className="text-[10px] font-bold tracking-wider text-slate-400">
              {brandLabel}
            </div>
          </div>
        </div>
        {links}
        {footer}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">
              <div className="flex items-center gap-2">
                <KalanMark className="h-7 w-7" />
                <KalanWordmark className="text-base" tone="dark" />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-slate-300 hover:bg-slate-800"
                aria-label="Fermer le menu"
              >
                <IconX />
              </button>
            </div>
            {links}
            {footer}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
