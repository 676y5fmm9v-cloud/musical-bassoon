"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import { envoyerMessage } from "@/lib/repo/messages";

export async function envoyerMessageAction(
  basePath: string,
  formData: FormData
): Promise<void> {
  const session = await verifySession();
  const destinataireId = Number(formData.get("destinataire_id"));
  const contenu = String(formData.get("contenu") ?? "").trim();

  if (!contenu || !destinataireId) {
    redirect(basePath);
  }

  envoyerMessage(session.compteId, destinataireId, contenu);
  revalidatePath(basePath);
  redirect(`${basePath}?avec=${destinataireId}`);
}
