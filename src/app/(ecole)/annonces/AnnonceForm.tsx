"use client";

import { useActionState, useState } from "react";
import type { Classe } from "@/lib/types";
import { creerAnnonceAction } from "./actions";
import { btnPrimary, inputClass, labelClass, FormError } from "@/components/ui";

export function AnnonceForm({ classes }: { classes: Classe[] }) {
  const [state, formAction, pending] = useActionState(creerAnnonceAction, undefined);
  const [cible, setCible] = useState("ecole");

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />
      <div>
        <label htmlFor="titre" className={labelClass}>Titre</label>
        <input id="titre" name="titre" required className={inputClass} placeholder="Ex : Réunion parents-professeurs" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cible" className={labelClass}>Destinataires</label>
          <select
            id="cible"
            name="cible"
            className={inputClass}
            value={cible}
            onChange={(e) => setCible(e.target.value)}
          >
            <option value="ecole">Toute l&apos;école</option>
            <option value="classe">Une classe précise</option>
            <option value="parents">Parents uniquement</option>
            <option value="profs">Professeurs uniquement</option>
          </select>
        </div>
        {cible === "classe" && (
          <div>
            <label htmlFor="classe_id" className={labelClass}>Classe</label>
            <select id="classe_id" name="classe_id" className={inputClass} required>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div>
        <label htmlFor="message" className={labelClass}>Message</label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className={inputClass}
          placeholder="Contenu de l'annonce…"
        />
      </div>
      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Publication…" : "📢 Publier l'annonce"}
      </button>
    </form>
  );
}
