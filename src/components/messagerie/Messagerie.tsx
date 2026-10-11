import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { getCompteById } from "@/lib/repo/comptes";
import {
  listConversations,
  listMessagesEntre,
  listContactsPourCompte,
  marquerConversationLue,
} from "@/lib/repo/messages";
import { envoyerMessageAction } from "./actions";
import { Card, btnPrimary } from "@/components/ui";
import { IconSend } from "@/components/icons";

const ROLE_LABELS: Record<string, string> = {
  eleve: "Élève",
  prof: "Professeur",
  parent: "Parent",
  ecole: "École",
};

function formatHeure(value: string): string {
  try {
    return new Date(value + "Z").toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export async function Messagerie({
  basePath,
  searchParams,
}: {
  basePath: string;
  searchParams: Promise<{ avec?: string; nouveau?: string }>;
}) {
  const session = await verifySession();
  const compte = getCompteById(session.compteId);
  if (!compte) return null;

  const sp = await searchParams;
  const conversations = listConversations(compte.id);
  const avecId = sp.avec ? Number(sp.avec) : undefined;
  const afficherNouveau = sp.nouveau === "1";

  if (avecId) {
    marquerConversationLue(compte.id, avecId);
  }
  const fil = avecId ? listMessagesEntre(compte.id, avecId) : [];
  const correspondant = conversations.find((c) => c.compte_id === avecId);
  const contacts = afficherNouveau ? listContactsPourCompte(compte) : [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="overflow-hidden lg:col-span-1">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Conversations</h2>
          <Link href={`${basePath}?nouveau=1`} className="text-xs font-semibold text-kalan-green hover:underline">
            + Nouveau
          </Link>
        </div>
        {conversations.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            Aucune conversation pour le moment.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {conversations.map((c) => (
              <li key={c.compte_id}>
                <Link
                  href={`${basePath}?avec=${c.compte_id}`}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 ${
                    avecId === c.compte_id ? "bg-kalan-green-light" : ""
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                    {c.nom.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-slate-900">{c.nom}</span>
                      {c.non_lus > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-kalan-red px-1.5 text-[10px] font-bold text-white">
                          {c.non_lus}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-slate-500">{c.dernier_message}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="flex flex-col lg:col-span-2">
        {afficherNouveau ? (
          <div>
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">Choisir un contact</h2>
            </div>
            {contacts.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                Aucun contact disponible.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {contacts.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`${basePath}?avec=${c.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                    >
                      <span className="text-sm font-medium text-slate-900">{c.nom}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {ROLE_LABELS[c.role] ?? c.role}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : !avecId ? (
          <div className="flex flex-1 items-center justify-center py-16 text-sm text-slate-500">
            Sélectionnez une conversation pour l&apos;afficher.
          </div>
        ) : (
          <>
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">
                {correspondant?.nom ?? "Conversation"}
              </h2>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ maxHeight: 420 }}>
              {fil.length === 0 ? (
                <p className="text-center text-sm text-slate-500">
                  Aucun message. Lancez la conversation !
                </p>
              ) : (
                fil.map((m) => {
                  const estMoi = m.expediteur_id === compte.id;
                  return (
                    <div key={m.id} className={`flex ${estMoi ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                          estMoi
                            ? "rounded-br-sm bg-kalan-green text-white"
                            : "rounded-bl-sm bg-slate-100 text-slate-800"
                        }`}
                      >
                        <p>{m.contenu}</p>
                        <span
                          className={`mt-1 block text-[10px] ${estMoi ? "text-white/70" : "text-slate-400"}`}
                        >
                          {formatHeure(m.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form
              action={envoyerMessageAction.bind(null, basePath)}
              className="flex items-center gap-2 border-t border-slate-100 px-4 py-3"
            >
              <input type="hidden" name="destinataire_id" value={avecId} />
              <input
                type="text"
                name="contenu"
                placeholder="Écrire un message…"
                required
                className="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-kalan-green"
              />
              <button type="submit" className={`${btnPrimary} !w-auto !rounded-full !px-4`}>
                <IconSend className="h-4 w-4" />
              </button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
