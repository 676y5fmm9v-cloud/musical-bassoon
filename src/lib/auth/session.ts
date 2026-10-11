import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { SESSION_SECRET } from "./secret";
import type { Role, SousRoleEcole } from "@/lib/types";

const encodedKey = new TextEncoder().encode(SESSION_SECRET);

export const COOKIE_NAME = "kalan_session";

const DUREE_SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export interface SessionPayload {
  compteId: number;
  role: Role;
  sousRole: SousRoleEcole | null;
  nom: string;
  eleveId: number | null;
  enseignantId: number | null;
}

export async function signerSession(
  payload: SessionPayload
): Promise<{ token: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + DUREE_SESSION_MS);
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey);
  return { token, expiresAt };
}

export async function verifierToken(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
