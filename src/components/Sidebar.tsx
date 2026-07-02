"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  IconDashboard,
  IconStudents,
  IconTeachers,
  IconClasses,
  IconSubjects,
  IconGrades,
  IconMenu,
  IconX,
  IconBook,
} from "@/components/icons";

const NAV_ITEMS = [
  { href: "/", label: "Tableau de bord", icon: IconDashboard },
  { href: "/eleves", label: "Élèves", icon: IconStudents },
  { href: "/enseignants", label: "Enseignants", icon: IconTeachers },
  { href: "/classes", label: "Classes", icon: IconClasses },
  { href: "/matieres", label: "Matières", icon: IconSubjects },
  { href: "/notes", label: "Notes", icon: IconGrades },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-amber-500 text-slate-900"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2 text-white">
          <IconBook className="h-6 w-6 text-amber-400" />
          <span className="text-lg font-bold">Kalan</span>
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
        <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-5 text-white">
          <IconBook className="h-7 w-7 text-amber-400" />
          <div>
            <div className="text-xl font-bold leading-tight">Kalan</div>
            <div className="text-xs text-slate-400">Gestion Scolaire</div>
          </div>
        </div>
        {links}
        <div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-500">
          Kalan · Année scolaire 2025-2026
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5 text-white">
              <div className="flex items-center gap-2">
                <IconBook className="h-6 w-6 text-amber-400" />
                <span className="text-lg font-bold">Kalan</span>
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
          </aside>
        </div>
      )}
    </>
  );
}
