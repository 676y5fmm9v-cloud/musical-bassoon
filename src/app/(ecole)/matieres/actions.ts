"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import {
  createMatiere,
  updateMatiere,
  deleteMatiere,
  type MatiereInput,
} from "@/lib/repo/matieres";

export type FormState = { error?: string } | undefined;

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function readInput(formData: FormData): MatiereInput {
  const coefficientRaw = str(formData, "coefficient");
  return {
    nom: str(formData, "nom"),
    coefficient: coefficientRaw ? Number(coefficientRaw) : 1,
  };
}

function validate(input: MatiereInput): string | null {
  if (!input.nom) return "Le nom de la matière est obligatoire.";
  if (!Number.isFinite(input.coefficient) || input.coefficient <= 0)
    return "Le coefficient doit être un nombre positif.";
  return null;
}

export async function createMatiereAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireRole("ecole");
  const input = readInput(formData);
  const error = validate(input);
  if (error) return { error };

  try {
    createMatiere(input);
  } catch {
    return { error: `La matière "${input.nom}" existe déjà.` };
  }
  revalidatePath("/matieres");
  revalidatePath("/");
  redirect("/matieres");
}

export async function updateMatiereAction(
  id: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireRole("ecole");
  const input = readInput(formData);
  const error = validate(input);
  if (error) return { error };

  try {
    updateMatiere(id, input);
  } catch {
    return { error: `La matière "${input.nom}" existe déjà.` };
  }
  revalidatePath("/matieres");
  revalidatePath("/");
  redirect("/matieres");
}

export async function deleteMatiereAction(formData: FormData): Promise<void> {
  await requireRole("ecole");
  const id = Number(formData.get("id"));
  deleteMatiere(id);
  revalidatePath("/matieres");
  revalidatePath("/");
  redirect("/matieres");
}
