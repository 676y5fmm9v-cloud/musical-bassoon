"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { creerAnnonce, deleteAnnonce, type AnnonceInput } from "@/lib/repo/annonces";

export type FormState = { error?: string } | undefined;

export async function creerAnnonceAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireRole("ecole");

  const titre = String(formData.get("titre") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const cible = String(formData.get("cible") ?? "ecole") as AnnonceInput["cible"];
  const classeIdRaw = String(formData.get("classe_id") ?? "").trim();

  if (!titre || !message) {
    return { error: "Le titre et le message sont obligatoires." };
  }
  if (cible === "classe" && !classeIdRaw) {
    return { error: "Veuillez choisir une classe." };
  }

  creerAnnonce(session.compteId, {
    titre,
    message,
    cible,
    classe_id: classeIdRaw ? Number(classeIdRaw) : null,
  });

  revalidatePath("/annonces");
  redirect("/annonces");
}

export async function deleteAnnonceAction(formData: FormData): Promise<void> {
  await requireRole("ecole");
  deleteAnnonce(Number(formData.get("id")));
  revalidatePath("/annonces");
  redirect("/annonces");
}
