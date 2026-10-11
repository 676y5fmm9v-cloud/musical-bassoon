"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { enseignantEstAffecte } from "@/lib/repo/affectations";
import { creerDevoir, deleteDevoir, noterRendu } from "@/lib/repo/devoirs";

export type FormState = { error?: string } | undefined;

export async function creerDevoirAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireRole("prof");
  const enseignantId = session.enseignantId!;

  const titre = String(formData.get("titre") ?? "").trim();
  const consignes = String(formData.get("consignes") ?? "").trim();
  const classeId = Number(formData.get("classe_id"));
  const matiereId = Number(formData.get("matiere_id"));
  const dateLimite = String(formData.get("date_limite") ?? "").trim();

  if (!titre) return { error: "Le titre est obligatoire." };
  if (!dateLimite) return { error: "La date limite est obligatoire." };
  if (!enseignantEstAffecte(enseignantId, classeId, matiereId)) {
    return { error: "Vous n'êtes pas affecté à cette classe pour cette matière." };
  }

  const id = creerDevoir({
    titre,
    consignes: consignes || null,
    classe_id: classeId,
    matiere_id: matiereId,
    enseignant_id: enseignantId,
    date_limite: dateLimite,
  });

  revalidatePath("/prof/devoirs");
  redirect(`/prof/devoirs/${id}`);
}

export async function deleteDevoirAction(formData: FormData): Promise<void> {
  await requireRole("prof");
  deleteDevoir(Number(formData.get("id")));
  revalidatePath("/prof/devoirs");
  redirect("/prof/devoirs");
}

export async function noterRenduAction(formData: FormData): Promise<void> {
  await requireRole("prof");
  const devoirId = Number(formData.get("devoir_id"));
  const eleveId = Number(formData.get("eleve_id"));
  const note = Number(formData.get("note"));
  if (Number.isFinite(note) && note >= 0 && note <= 20) {
    noterRendu(devoirId, eleveId, note);
  }
  revalidatePath(`/prof/devoirs/${devoirId}`);
  redirect(`/prof/devoirs/${devoirId}`);
}
