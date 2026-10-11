"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { enseignantEstAffecte } from "@/lib/repo/affectations";
import { creerEntreeCahier, deleteEntreeCahier } from "@/lib/repo/cahier";

export type FormState = { error?: string } | undefined;

export async function creerEntreeCahierAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireRole("prof");
  const enseignantId = session.enseignantId!;

  const classeId = Number(formData.get("classe_id"));
  const matiereId = Number(formData.get("matiere_id"));
  const contenuSeance = String(formData.get("contenu_seance") ?? "").trim();
  const travailDonne = String(formData.get("travail_donne") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();

  if (!contenuSeance) return { error: "Le contenu de la séance est obligatoire." };
  if (!enseignantEstAffecte(enseignantId, classeId, matiereId)) {
    return { error: "Vous n'êtes pas affecté à cette classe pour cette matière." };
  }

  creerEntreeCahier({
    classe_id: classeId,
    matiere_id: matiereId,
    enseignant_id: enseignantId,
    date: date || undefined,
    contenu_seance: contenuSeance,
    travail_donne: travailDonne || null,
  });

  revalidatePath("/prof/cahier");
  redirect("/prof/cahier");
}

export async function deleteEntreeCahierAction(formData: FormData): Promise<void> {
  await requireRole("prof");
  deleteEntreeCahier(Number(formData.get("id")));
  revalidatePath("/prof/cahier");
  redirect("/prof/cahier");
}
