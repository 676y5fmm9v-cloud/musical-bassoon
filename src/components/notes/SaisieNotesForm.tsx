"use client";

import { useActionState } from "react";
import type { Eleve, Enseignant, TypeNote } from "@/lib/types";
import { btnPrimary, inputClass, labelClass, FormError } from "@/components/ui";

export type SaisieNotesFormState = { error?: string } | undefined;

export function SaisieNotesForm({
  action,
  eleves,
  valeurs,
  enseignants,
  enseignantFixe,
  type,
}: {
  action: (
    prevState: SaisieNotesFormState,
    formData: FormData
  ) => Promise<SaisieNotesFormState>;
  eleves: Eleve[];
  valeurs: Record<number, number>;
  enseignants?: Enseignant[];
  enseignantFixe?: { id: number; nom: string };
  type: TypeNote;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction}>
      <FormError message={state?.error} />

      {enseignantFixe ? (
        <input type="hidden" name="enseignant_id" value={enseignantFixe.id} />
      ) : (
        <div className="mb-4 max-w-xs">
          <label htmlFor="enseignant_id" className={labelClass}>
            Enseignant ayant saisi les notes (optionnel)
          </label>
          <select id="enseignant_id" name="enseignant_id" className={inputClass}>
            <option value="">—</option>
            {enseignants?.map((e) => (
              <option key={e.id} value={e.id}>
                {e.prenom} {e.nom}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Élève
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Note {type === "devoir" ? "de devoir" : "de composition"} (/20)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {eleves.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-2.5 font-medium text-slate-800">
                  {e.prenom} {e.nom}
                </td>
                <td className="px-4 py-2.5">
                  <input
                    type="number"
                    name={`note_${e.id}`}
                    min={0}
                    max={20}
                    step={0.25}
                    defaultValue={valeurs[e.id] ?? ""}
                    className="w-28 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Enregistrement…" : "Enregistrer les notes"}
        </button>
      </div>
    </form>
  );
}
