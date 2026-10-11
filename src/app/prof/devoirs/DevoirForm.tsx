"use client";

import { useActionState } from "react";
import type { Classe, Matiere } from "@/lib/types";
import type { FormState } from "./actions";
import { creerDevoirAction } from "./actions";
import { btnPrimary, inputClass, labelClass, FormError } from "@/components/ui";

export function DevoirForm({
  classes,
  matieres,
  classeIdDefaut,
}: {
  classes: Classe[];
  matieres: Matiere[];
  classeIdDefaut?: number;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    creerDevoirAction,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />
      <div>
        <label htmlFor="titre" className={labelClass}>Titre du devoir</label>
        <input id="titre" name="titre" required className={inputClass} placeholder="Ex : Exercices n°11 à 20" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        <div>
          <label htmlFor="date_limite" className={labelClass}>Date limite</label>
          <input id="date_limite" name="date_limite" type="date" required className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="consignes" className={labelClass}>Consignes</label>
        <textarea id="consignes" name="consignes" rows={4} className={inputClass} placeholder="Décrivez ce que les élèves doivent faire…" />
      </div>
      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Publication…" : "📤 Publier le devoir"}
      </button>
    </form>
  );
}
