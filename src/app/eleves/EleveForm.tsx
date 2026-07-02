"use client";

import { useActionState } from "react";
import type { Classe } from "@/lib/types";
import type { Eleve } from "@/lib/types";
import type { FormState } from "./actions";
import { btnPrimary, btnSecondary, inputClass, labelClass, FormError } from "@/components/ui";
import Link from "next/link";

export function EleveForm({
  action,
  classes,
  eleve,
  defaultMatricule,
  cancelHref,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  classes: Classe[];
  eleve?: Eleve;
  defaultMatricule?: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <FormError message={state?.error} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="matricule" className={labelClass}>
            Matricule
          </label>
          <input
            id="matricule"
            name="matricule"
            defaultValue={eleve?.matricule ?? defaultMatricule}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="genre" className={labelClass}>
            Genre
          </label>
          <select
            id="genre"
            name="genre"
            defaultValue={eleve?.genre ?? "M"}
            className={inputClass}
          >
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
        </div>

        <div>
          <label htmlFor="nom" className={labelClass}>
            Nom
          </label>
          <input
            id="nom"
            name="nom"
            defaultValue={eleve?.nom}
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
            defaultValue={eleve?.prenom}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="date_naissance" className={labelClass}>
            Date de naissance
          </label>
          <input
            id="date_naissance"
            name="date_naissance"
            type="date"
            defaultValue={eleve?.date_naissance ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="classe_id" className={labelClass}>
            Classe
          </label>
          <select
            id="classe_id"
            name="classe_id"
            defaultValue={eleve?.classe_id ?? ""}
            className={inputClass}
          >
            <option value="">Aucune classe</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom} ({c.annee_scolaire})
              </option>
            ))}
          </select>
        </div>

        {eleve && (
          <div>
            <label htmlFor="statut" className={labelClass}>
              Statut
            </label>
            <select
              id="statut"
              name="statut"
              defaultValue={eleve.statut}
              className={inputClass}
            >
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
        )}
        <div>
          <label htmlFor="date_inscription" className={labelClass}>
            Date d&apos;inscription
          </label>
          <input
            id="date_inscription"
            name="date_inscription"
            type="date"
            defaultValue={eleve?.date_inscription ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          Contact du parent / tuteur
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nom_parent" className={labelClass}>
              Nom du parent / tuteur
            </label>
            <input
              id="nom_parent"
              name="nom_parent"
              defaultValue={eleve?.nom_parent ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="telephone_parent" className={labelClass}>
              Téléphone
            </label>
            <input
              id="telephone_parent"
              name="telephone_parent"
              defaultValue={eleve?.telephone_parent ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="email_parent" className={labelClass}>
              Email
            </label>
            <input
              id="email_parent"
              name="email_parent"
              type="email"
              defaultValue={eleve?.email_parent ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="adresse" className={labelClass}>
              Adresse
            </label>
            <input
              id="adresse"
              name="adresse"
              defaultValue={eleve?.adresse ?? ""}
              className={inputClass}
            />
          </div>
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
