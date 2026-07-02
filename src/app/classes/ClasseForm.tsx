"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Classe, Enseignant } from "@/lib/types";
import type { FormState } from "./actions";
import {
  btnPrimary,
  btnSecondary,
  inputClass,
  labelClass,
  FormError,
} from "@/components/ui";

export function ClasseForm({
  action,
  enseignants,
  classe,
  cancelHref,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  enseignants: Enseignant[];
  classe?: Classe;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <FormError message={state?.error} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nom" className={labelClass}>
            Nom de la classe
          </label>
          <input
            id="nom"
            name="nom"
            placeholder="ex : 6ème A"
            defaultValue={classe?.nom}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="niveau" className={labelClass}>
            Niveau
          </label>
          <input
            id="niveau"
            name="niveau"
            placeholder="ex : 6ème"
            defaultValue={classe?.niveau}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="annee_scolaire" className={labelClass}>
            Année scolaire
          </label>
          <input
            id="annee_scolaire"
            name="annee_scolaire"
            placeholder="ex : 2025-2026"
            defaultValue={classe?.annee_scolaire ?? "2025-2026"}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="capacite" className={labelClass}>
            Capacité (optionnel)
          </label>
          <input
            id="capacite"
            name="capacite"
            type="number"
            min={1}
            defaultValue={classe?.capacite ?? ""}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="enseignant_principal_id" className={labelClass}>
            Enseignant titulaire
          </label>
          <select
            id="enseignant_principal_id"
            name="enseignant_principal_id"
            defaultValue={classe?.enseignant_principal_id ?? ""}
            className={inputClass}
          >
            <option value="">Aucun</option>
            {enseignants.map((e) => (
              <option key={e.id} value={e.id}>
                {e.prenom} {e.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <Link href={cancelHref} className={btnSecondary}>
          Annuler
        </Link>
      </div>
    </form>
  );
}
