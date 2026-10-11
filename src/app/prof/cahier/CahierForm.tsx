"use client";

import { useActionState } from "react";
import type { Classe, Matiere } from "@/lib/types";
import type { FormState } from "./actions";
import { creerEntreeCahierAction } from "./actions";
import { btnPrimary, inputClass, labelClass, FormError } from "@/components/ui";

export function CahierForm({ classes, matieres }: { classes: Classe[]; matieres: Matiere[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    creerEntreeCahierAction,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="classe_id" className={labelClass}>Classe</label>
          <select id="classe_id" name="classe_id" required className={inputClass}>
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
        <div>
          <label htmlFor="date" className={labelClass}>Date</label>
          <input id="date" name="date" type="date" className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="contenu_seance" className={labelClass}>Contenu de la séance</label>
        <textarea id="contenu_seance" name="contenu_seance" required rows={3} className={inputClass} placeholder="Ce qui a été fait pendant le cours…" />
      </div>
      <div>
        <label htmlFor="travail_donne" className={labelClass}>Travail donné aux élèves</label>
        <textarea id="travail_donne" name="travail_donne" rows={2} className={inputClass} placeholder="Exercices, leçons à réviser…" />
      </div>
      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Enregistrement…" : "💾 Enregistrer la séance"}
      </button>
    </form>
  );
}
