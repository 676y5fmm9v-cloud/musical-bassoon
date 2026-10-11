"use client";

import { useActionState } from "react";
import type { Classe, Matiere } from "@/lib/types";
import type { FormState } from "./actions";
import { creerCoursAction } from "./actions";
import { btnPrimary, inputClass, labelClass, FormError } from "@/components/ui";

export function CoursForm({
  classes,
  matieres,
  classeIdDefaut,
}: {
  classes: Classe[];
  matieres: Matiere[];
  classeIdDefaut?: number;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    creerCoursAction,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />
      <div>
        <label htmlFor="titre" className={labelClass}>Titre du cours</label>
        <input id="titre" name="titre" required className={inputClass} placeholder="Ex : Les fractions — Partie 2" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="classe_id" className={labelClass}>Classe</label>
          <select id="classe_id" name="classe_id" required className={inputClass} defaultValue={classeIdDefaut ?? ""}>
            <option value="" disabled>Choisir…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="matiere_id" className={labelClass}>Matière</label>
          <select id="matiere_id" name="matiere_id" required className={inputClass}>
            <option value="" disabled>Choisir…</option>
            {matieres.map((m) => (
              <option key={m.id} value={m.id}>{m.nom}</option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Publication…" : "📤 Publier le cours"}
      </button>
    </form>
  );
}
