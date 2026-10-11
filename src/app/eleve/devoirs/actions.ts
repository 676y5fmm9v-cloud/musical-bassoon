"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { soumettreRendu } from "@/lib/repo/devoirs";

export async function rendreDevoirAction(formData: FormData): Promise<void> {
  const session = await requireRole("eleve");
  const devoirId = Number(formData.get("devoir_id"));
  const commentaire = String(formData.get("commentaire") ?? "").trim();

  soumettreRendu(devoirId, session.eleveId!, commentaire || null, "devoir_rendu.pdf");
  revalidatePath("/eleve/devoirs");
  redirect("/eleve/devoirs");
}
