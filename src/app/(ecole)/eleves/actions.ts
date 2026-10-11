"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import {
  createEleve,
  updateEleve,
  deleteEleve,
  matriculeExiste,
  type EleveInput,
} from "@/lib/repo/eleves";
import type { Genre, StatutEleve } from "@/lib/types";

export type FormState = { error?: string } | undefined;

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function readInput(formData: FormData): EleveInput {
  const classeIdRaw = str(formData, "classe_id");
  return {
    matricule: str(formData, "matricule"),
    nom: str(formData, "nom"),
    prenom: str(formData, "prenom"),
    date_naissance: str(formData, "date_naissance") || null,
    genre: (str(formData, "genre") || "M") as Genre,
    classe_id: classeIdRaw ? Number(classeIdRaw) : null,
    nom_parent: str(formData, "nom_parent") || null,
    telephone_parent: str(formData, "telephone_parent") || null,
    email_parent: str(formData, "email_parent") || null,
    adresse: str(formData, "adresse") || null,
    date_inscription: str(formData, "date_inscription") || null,
    statut: (str(formData, "statut") || "actif") as StatutEleve,
  };
}

function validate(input: EleveInput, excludeId?: number): string | null {
  if (!input.nom) return "Le nom est obligatoire.";
  if (!input.prenom) return "Le prénom est obligatoire.";
  if (!input.matricule) return "Le matricule est obligatoire.";
  if (input.genre !== "M" && input.genre !== "F")
    return "Le genre doit être M ou F.";
  if (matriculeExiste(input.matricule, excludeId))
    return `Le matricule "${input.matricule}" est déjà utilisé par un autre élève.`;
  return null;
}

export async function createEleveAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireRole("ecole");
  const input = readInput(formData);
  const error = validate(input);
  if (error) return { error };

  const id = createEleve(input);
  revalidatePath("/eleves");
  revalidatePath("/");
  redirect(`/eleves/${id}`);
}

export async function updateEleveAction(
  id: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireRole("ecole");
  const input = readInput(formData);
  const error = validate(input, id);
  if (error) return { error };

  updateEleve(id, input);
  revalidatePath("/eleves");
  revalidatePath(`/eleves/${id}`);
  revalidatePath("/");
  redirect(`/eleves/${id}`);
}

export async function deleteEleveAction(formData: FormData): Promise<void> {
  await requireRole("ecole");
  const id = Number(formData.get("id"));
  deleteEleve(id);
  revalidatePath("/eleves");
  revalidatePath("/");
  redirect("/eleves");
}
