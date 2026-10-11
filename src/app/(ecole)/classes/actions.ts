"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import {
  createClasse,
  updateClasse,
  deleteClasse,
  type ClasseInput,
} from "@/lib/repo/classes";
import { listElevesParClasse } from "@/lib/repo/eleves";

export type FormState = { error?: string } | undefined;

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function readInput(formData: FormData): ClasseInput {
  const enseignantRaw = str(formData, "enseignant_principal_id");
  const capaciteRaw = str(formData, "capacite");
  return {
    nom: str(formData, "nom"),
    niveau: str(formData, "niveau"),
    annee_scolaire: str(formData, "annee_scolaire"),
    enseignant_principal_id: enseignantRaw ? Number(enseignantRaw) : null,
    capacite: capaciteRaw ? Number(capaciteRaw) : null,
  };
}

function validate(input: ClasseInput): string | null {
  if (!input.nom) return "Le nom de la classe est obligatoire.";
  if (!input.niveau) return "Le niveau est obligatoire.";
  if (!input.annee_scolaire) return "L'année scolaire est obligatoire.";
  return null;
}

export async function createClasseAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireRole("ecole");
  const input = readInput(formData);
  const error = validate(input);
  if (error) return { error };

  const id = createClasse(input);
  revalidatePath("/classes");
  revalidatePath("/");
  redirect(`/classes/${id}`);
}

export async function updateClasseAction(
  id: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireRole("ecole");
  const input = readInput(formData);
  const error = validate(input);
  if (error) return { error };

  updateClasse(id, input);
  revalidatePath("/classes");
  revalidatePath(`/classes/${id}`);
  revalidatePath("/");
  redirect(`/classes/${id}`);
}

export async function deleteClasseAction(formData: FormData): Promise<void> {
  await requireRole("ecole");
  const id = Number(formData.get("id"));
  if (listElevesParClasse(id).length > 0) {
    redirect(
      `/classes/${id}?error=${encodeURIComponent(
        "Impossible de supprimer : des élèves sont encore assignés à cette classe."
      )}`
    );
  }
  deleteClasse(id);
  revalidatePath("/classes");
  revalidatePath("/");
  redirect("/classes");
}
