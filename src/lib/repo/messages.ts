import "server-only";
import { db, queryAll, queryOne } from "@/lib/db";
import type { Compte, ConversationApercu, MessageAvecNoms } from "@/lib/types";

export function listConversations(compteId: number): ConversationApercu[] {
  return queryAll<ConversationApercu>(
    `
    WITH correspondants AS (
      SELECT destinataire_id AS compte_id FROM messages WHERE expediteur_id = ?
      UNION
      SELECT expediteur_id AS compte_id FROM messages WHERE destinataire_id = ?
    )
    SELECT
      c.id AS compte_id,
      c.nom,
      c.role,
      (SELECT contenu FROM messages m
         WHERE (m.expediteur_id = ? AND m.destinataire_id = c.id)
            OR (m.expediteur_id = c.id AND m.destinataire_id = ?)
         ORDER BY m.created_at DESC LIMIT 1) AS dernier_message,
      (SELECT created_at FROM messages m
         WHERE (m.expediteur_id = ? AND m.destinataire_id = c.id)
            OR (m.expediteur_id = c.id AND m.destinataire_id = ?)
         ORDER BY m.created_at DESC LIMIT 1) AS dernier_message_date,
      (SELECT COUNT(*) FROM messages m
         WHERE m.expediteur_id = c.id AND m.destinataire_id = ? AND m.lu = 0) AS non_lus
    FROM correspondants cor
    JOIN comptes c ON c.id = cor.compte_id
    ORDER BY dernier_message_date DESC
    `,
    [compteId, compteId, compteId, compteId, compteId, compteId, compteId]
  );
}

export function listMessagesEntre(compteIdA: number, compteIdB: number): MessageAvecNoms[] {
  return queryAll<MessageAvecNoms>(
    `SELECT m.*, e.nom AS expediteur_nom, d.nom AS destinataire_nom
     FROM messages m
     JOIN comptes e ON e.id = m.expediteur_id
     JOIN comptes d ON d.id = m.destinataire_id
     WHERE (m.expediteur_id = ? AND m.destinataire_id = ?)
        OR (m.expediteur_id = ? AND m.destinataire_id = ?)
     ORDER BY m.created_at ASC`,
    [compteIdA, compteIdB, compteIdB, compteIdA]
  );
}

export function envoyerMessage(
  expediteurId: number,
  destinataireId: number,
  contenu: string
): void {
  db.prepare(
    `INSERT INTO messages (expediteur_id, destinataire_id, contenu) VALUES (?, ?, ?)`
  ).run(expediteurId, destinataireId, contenu);
}

export function marquerConversationLue(compteId: number, correspondantId: number): void {
  db.prepare(
    `UPDATE messages SET lu = 1 WHERE destinataire_id = ? AND expediteur_id = ? AND lu = 0`
  ).run(compteId, correspondantId);
}

export function compterMessagesNonLus(compteId: number): number {
  const row = queryOne<{ n: number }>(
    `SELECT COUNT(*) AS n FROM messages WHERE destinataire_id = ? AND lu = 0`,
    [compteId]
  );
  return row?.n ?? 0;
}

export interface Contact {
  id: number;
  nom: string;
  role: string;
}

export function listContactsPourCompte(compte: Compte): Contact[] {
  if (compte.role === "ecole") {
    return queryAll<Contact>(
      `SELECT id, nom, role FROM comptes WHERE id != ? AND actif = 1 ORDER BY role, nom`,
      [compte.id]
    );
  }

  if (compte.role === "prof" && compte.enseignant_id) {
    return queryAll<Contact>(
      `SELECT DISTINCT c.id, c.nom, c.role FROM comptes c
       WHERE c.actif = 1 AND c.id != ? AND (
         c.role = 'ecole'
         OR c.eleve_id IN (
           SELECT e.id FROM eleves e
           JOIN affectations a ON a.classe_id = e.classe_id
           WHERE a.enseignant_id = ?
         )
         OR c.id IN (
           SELECT pe.compte_id FROM parent_eleve pe
           JOIN eleves e ON e.id = pe.eleve_id
           JOIN affectations a ON a.classe_id = e.classe_id
           WHERE a.enseignant_id = ?
         )
       )
       ORDER BY c.role, c.nom`,
      [compte.id, compte.enseignant_id, compte.enseignant_id]
    );
  }

  if (compte.role === "eleve" && compte.eleve_id) {
    return queryAll<Contact>(
      `SELECT DISTINCT c.id, c.nom, c.role FROM comptes c
       WHERE c.actif = 1 AND c.id != ? AND (
         c.role = 'ecole'
         OR c.enseignant_id IN (
           SELECT a.enseignant_id FROM affectations a
           JOIN eleves e ON e.classe_id = a.classe_id
           WHERE e.id = ?
         )
       )
       ORDER BY c.role, c.nom`,
      [compte.id, compte.eleve_id]
    );
  }

  if (compte.role === "parent") {
    return queryAll<Contact>(
      `SELECT DISTINCT c.id, c.nom, c.role FROM comptes c
       WHERE c.actif = 1 AND c.id != ? AND (
         c.role = 'ecole'
         OR c.enseignant_id IN (
           SELECT a.enseignant_id FROM affectations a
           JOIN eleves e ON e.classe_id = a.classe_id
           JOIN parent_eleve pe ON pe.eleve_id = e.id
           WHERE pe.compte_id = ?
         )
       )
       ORDER BY c.role, c.nom`,
      [compte.id, compte.id]
    );
  }

  return [];
}
