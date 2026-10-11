"use server";

import { redirect } from "next/navigation";
import { getCompteByIdentifiant } from "@/lib/repo/comptes";
import { verifyPassword } from "@/lib/auth/password";
import { creerSessionCookie, supprimerSessionCookie } from "@/lib/auth/cookie";
import { roleHome } from "@/lib/auth/dal";

export type LoginState = { error?: string } | undefined;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const identifiant = String(formData.get("identifiant") ?? "").trim();
  const motDePasse = String(formData.get("mot_de_passe") ?? "");

  if (!identifiant || !motDePasse) {
    return { error: "Veuillez renseigner votre identifiant et votre mot de passe." };
  }

  const compte = getCompteByIdentifiant(identifiant);
  if (!compte) {
    return { error: "Identifiant ou mot de passe incorrect." };
  }

  const motDePasseValide = await verifyPassword(motDePasse, compte.mot_de_passe_hash);
  if (!motDePasseValide) {
    return { error: "Identifiant ou mot de passe incorrect." };
  }

  await creerSessionCookie({
    compteId: compte.id,
    role: compte.role,
    sousRole: compte.sous_role,
    nom: compte.nom,
    eleveId: compte.eleve_id,
    enseignantId: compte.enseignant_id,
  });

  redirect(roleHome(compte.role));
}

export async function logoutAction(): Promise<void> {
  await supprimerSessionCookie();
  redirect("/login");
}
