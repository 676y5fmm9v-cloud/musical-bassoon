"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Matiere } from "@/lib/types";
import type { FormState } from "./actions";
import {
  btnPrimary,
  btnSecondary,
  inputClass,
  labelClass,
  FormError,
} from "@/components/ui";

export function MatiereForm({
  action,
  matiere,
  cancelHref,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  matiere?: Matiere;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <FormError message={state?.error} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nom" className={labelClass}>
            Nom de la matière
          </label>
          <input
            id="nom"
            name="nom"
            placeholder="ex : Mathématiques"
            defaultValue={matiere?.nom}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="coefficient" className={labelClass}>
            Coefficient
          </label>
          <input
            id="coefficient"
            name="coefficient"
            type="number"
            min={1}
            step={1}
            defaultValue={matiere?.coefficient ?? 1}
            required
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
