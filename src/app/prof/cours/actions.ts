"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { enseignantEstAffecte } from "@/lib/repo/affectations";
import { creerCours, deleteCours } from "@/lib/repo/cours";

export type FormState = { error?: string } | undefined;

export async function creerCoursAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireRole("prof");
  const enseignantId = session.enseignantId!;

  const titre = String(formData.get("titre") ?? "").trim();
  const classeId = Number(formData.get("classe_id"));
  const matiereId = Number(formData.get("matiere_id"));

  if (!titre) return { error: "Le titre est obligatoire." };
  if (!enseignantEstAffecte(enseignantId, classeId, matiereId)) {
    return { error: "Vous n'êtes pas affecté à cette classe pour cette matière." };
  }

  creerCours({ titre, classe_id: classeId, matiere_id: matiereId, enseignant_id: enseignantId });
  revalidatePath("/prof/cours");
  redirect("/prof/cours");
}

export async function deleteCoursAction(formData: FormData): Promise<void> {
  await requireRole("prof");
  deleteCours(Number(formData.get("id")));
  revalidatePath("/prof/cours");
  redirect("/prof/cours");
}
