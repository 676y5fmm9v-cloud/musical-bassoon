import "server-only";
import { cookies } from "next/headers";
import {
  signerSession,
  verifierToken,
  COOKIE_NAME,
  type SessionPayload,
} from "./session";

export async function creerSessionCookie(payload: SessionPayload): Promise<void> {
  const { token, expiresAt } = await signerSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function lireSessionCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return verifierToken(cookieStore.get(COOKIE_NAME)?.value);
}

export async function supprimerSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
