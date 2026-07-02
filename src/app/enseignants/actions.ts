"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createEnseignant,
  updateEnseignant,
  deleteEnseignant,
  countClassesForEnseignant,
  type EnseignantInput,
} from "@/lib/repo/enseignants";

export type FormState = { error?: string } | undefined;

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function readInput(formData: FormData): EnseignantInput {
  return {
    nom: str(formData, "nom"),
    prenom: str(formData, "prenom"),
    email: str(formData, "email") || null,
    telephone: str(formData, "telephone") || null,
    specialite: str(formData, "specialite") || null,
    date_embauche: str(formData, "date_embauche") || null,
  };
}

function validate(input: EnseignantInput): string | null {
  if (!input.nom) return "Le nom est obligatoire.";
  if (!input.prenom) return "Le prénom est obligatoire.";
  return null;
}

export async function createEnseignantAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const input = readInput(formData);
  const error = validate(input);
  if (error) return { error };

  const id = createEnseignant(input);
  revalidatePath("/enseignants");
  revalidatePath("/");
  redirect(`/enseignants/${id}`);
}

export async function updateEnseignantAction(
  id: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const input = readInput(formData);
  const error = validate(input);
  if (error) return { error };

  updateEnseignant(id, input);
  revalidatePath("/enseignants");
  revalidatePath(`/enseignants/${id}`);
  revalidatePath("/");
  redirect(`/enseignants/${id}`);
}

export async function deleteEnseignantAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (countClassesForEnseignant(id) > 0) {
    redirect(
      `/enseignants/${id}?error=${encodeURIComponent(
        "Impossible de supprimer : cet enseignant est titulaire d'au moins une classe."
      )}`
    );
  }
  deleteEnseignant(id);
  revalidatePath("/enseignants");
  revalidatePath("/");
  redirect("/enseignants");
}
