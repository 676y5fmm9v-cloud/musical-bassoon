import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { lireSessionCookie } from "./cookie";
import { getCompteById } from "@/lib/repo/comptes";
import type { Role } from "@/lib/types";
import type { SessionPayload } from "./session";

export function roleHome(role: Role): string {
  switch (role) {
    case "eleve":
      return "/eleve";
    case "prof":
      return "/prof";
    case "parent":
      return "/parent";
    case "ecole":
      return "/";
  }
}

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await lireSessionCookie();
  if (!session) redirect("/login");

  const compte = getCompteById(session.compteId);
  if (!compte || !compte.actif) redirect("/login");

  return session;
});

export async function requireRole(...roles: Role[]): Promise<SessionPayload> {
  const session = await verifySession();
  if (!roles.includes(session.role)) {
    redirect(roleHome(session.role));
  }
  return session;
}
