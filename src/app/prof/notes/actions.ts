"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { enseignantEstAffecte } from "@/lib/repo/affectations";
import { enregistrerNotesEnMasse, type SaisieNote } from "@/lib/repo/notes";
import { listElevesParClasse } from "@/lib/repo/eleves";
import type { TypeNote } from "@/lib/types";

export type FormState = { error?: string } | undefined;

export async function enregistrerNotesProfAction(
  classeId: number,
  matiereId: number,
  trimestre: number,
  type: TypeNote,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireRole("prof");
  const enseignantId = session.enseignantId!;

  if (!enseignantEstAffecte(enseignantId, classeId, matiereId)) {
    return { error: "Vous n'êtes pas affecté à cette classe pour cette matière." };
  }

  const eleves = listElevesParClasse(classeId);
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
  revalidatePath("/prof/notes/saisir");
  redirect(
    `/prof/notes/saisir?classe=${classeId}&matiere=${matiereId}&trimestre=${trimestre}&type=${type}&saved=1`
  );
}
