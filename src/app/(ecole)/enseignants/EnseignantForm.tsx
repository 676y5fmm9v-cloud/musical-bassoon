"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Enseignant } from "@/lib/types";
import type { FormState } from "./actions";
import {
  btnPrimary,
  btnSecondary,
  inputClass,
  labelClass,
  FormError,
} from "@/components/ui";

export function EnseignantForm({
  action,
  enseignant,
  cancelHref,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  enseignant?: Enseignant;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <FormError message={state?.error} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nom" className={labelClass}>
            Nom
          </label>
          <input
            id="nom"
            name="nom"
            defaultValue={enseignant?.nom}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="prenom" className={labelClass}>
            Prénom
          </label>
          <input
            id="prenom"
            name="prenom"
            defaultValue={enseignant?.prenom}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="specialite" className={labelClass}>
            Spécialité / matière principale
          </label>
          <input
            id="specialite"
            name="specialite"
            defaultValue={enseignant?.specialite ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="date_embauche" className={labelClass}>
            Date d&apos;embauche
          </label>
          <input
            id="date_embauche"
            name="date_embauche"
            type="date"
            defaultValue={enseignant?.date_embauche ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={enseignant?.email ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="telephone" className={labelClass}>
            Téléphone
          </label>
          <input
            id="telephone"
            name="telephone"
            defaultValue={enseignant?.telephone ?? ""}
            className={inputClass}
          />
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
