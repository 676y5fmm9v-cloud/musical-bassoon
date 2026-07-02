"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { enregistrerNotesEnMasse, deleteNote, type SaisieNote } from "@/lib/repo/notes";
import { listElevesParClasse } from "@/lib/repo/eleves";
import type { TypeNote } from "@/lib/types";

export type FormState = { error?: string; success?: string } | undefined;

export async function enregistrerNotesAction(
  classeId: number,
  matiereId: number,
  trimestre: number,
  type: TypeNote,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const eleves = listElevesParClasse(classeId);
  const enseignantRaw = String(formData.get("enseignant_id") ?? "").trim();
  const enseignantId = enseignantRaw ? Number(enseignantRaw) : null;

  const saisies: SaisieNote[] = [];
  for (const eleve of eleves) {
    const raw = String(formData.get(`note_${eleve.id}`) ?? "").trim();
    if (raw === "") {
      saisies.push({ eleveId: eleve.id, valeur: null });
      continue;
    }
    const valeur = Number(raw.replace(",", "."));
    if (!Number.isFinite(valeur) || valeur < 0 || valeur > 20) {
      return {
        error: `La note de ${eleve.prenom} ${eleve.nom} doit être comprise entre 0 et 20.`,
      };
    }
    saisies.push({ eleveId: eleve.id, valeur });
  }

  enregistrerNotesEnMasse(matiereId, trimestre, type, enseignantId, saisies);
  revalidatePath("/notes");
  revalidatePath("/eleves");
  revalidatePath("/");
  redirect(
    `/notes/saisir?classe=${classeId}&matiere=${matiereId}&trimestre=${trimestre}&type=${type}&saved=1`
  );
}

export async function deleteNoteAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  deleteNote(id);
  revalidatePath("/notes");
  revalidatePath("/eleves");
  revalidatePath("/");
  redirect("/notes");
}
