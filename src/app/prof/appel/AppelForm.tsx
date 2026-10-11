"use client";

import { useActionState } from "react";
import type { Eleve, StatutAbsence } from "@/lib/types";
import type { FormState } from "./actions";
import { btnPrimary, FormError } from "@/components/ui";

const OPTIONS: { value: "present" | StatutAbsence; label: string; className: string }[] = [
  { value: "present", label: "Présent", className: "pres" },
  { value: "absent", label: "Absent", className: "abs" },
  { value: "retard", label: "Retard", className: "retard" },
];

export function AppelForm({
  action,
  eleves,
  existant,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  eleves: Eleve[];
  existant: Record<number, StatutAbsence>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction}>
      <FormError message={state?.error} />
      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {eleves.map((e) => {
          const defaut = existant[e.id] ?? "present";
          return (
            <div key={e.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm font-medium text-slate-800">{e.prenom} {e.nom}</span>
              <div className="flex gap-1.5">
                {OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="relative inline-flex cursor-pointer items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 has-[:checked]:border-kalan-green has-[:checked]:bg-kalan-green-light has-[:checked]:text-kalan-green"
                  >
                    <input
                      type="radio"
                      name={`statut_${e.id}`}
                      value={opt.value}
                      defaultChecked={defaut === opt.value}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Enregistrement…" : "✅ Valider l'appel"}
        </button>
      </div>
    </form>
  );
}
