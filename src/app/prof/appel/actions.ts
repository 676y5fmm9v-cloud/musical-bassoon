"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { enseignantEstAffecte } from "@/lib/repo/affectations";
import { enregistrerAppel, type AppelEntree } from "@/lib/repo/absences";
import { listElevesParClasse } from "@/lib/repo/eleves";
import type { StatutAbsence } from "@/lib/types";

export type FormState = { error?: string } | undefined;

export async function enregistrerAppelAction(
  classeId: number,
  matiereId: number,
  date: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireRole("prof");
  const enseignantId = session.enseignantId!;

  if (!enseignantEstAffecte(enseignantId, classeId, matiereId)) {
    return { error: "Vous n'êtes pas affecté à cette classe pour cette matière." };
  }

  const eleves = listElevesParClasse(classeId);
  const entrees: AppelEntree[] = eleves.map((e) => {
    const statut = String(formData.get(`statut_${e.id}`) ?? "present");
    return {
      eleveId: e.id,
      statut: statut === "absent" || statut === "retard" ? (statut as StatutAbsence) : null,
    };
  });

  enregistrerAppel(classeId, matiereId, enseignantId, date, entrees);
  revalidatePath("/prof/appel");
  redirect(`/prof/appel?classe=${classeId}&matiere=${matiereId}&date=${date}&saved=1`);
}
