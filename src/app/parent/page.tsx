import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { listEnfantsDuParent } from "@/lib/repo/comptes";
import { getEleve } from "@/lib/repo/eleves";
import { calculerBulletin } from "@/lib/repo/notes";
import { listAbsencesParEleve } from "@/lib/repo/absences";
import { listToutesAnnonces } from "@/lib/repo/annonces";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

export default async function ParentAccueilPage({
  searchParams,
}: {
  searchParams: Promise<{ enfant?: string }>;
}) {
  const session = await verifySession();
  const sp = await searchParams;

  const enfantIds = listEnfantsDuParent(session.compteId);
  const enfants = enfantIds.map((id) => getEleve(id)).filter((e) => e !== undefined);

  if (enfants.length === 0) {
    return (
      <div>
        <PageHeader title={`Bonjour, ${session.nom} 👋`} />
        <EmptyState title="Aucun enfant lié à votre compte" description="Contactez l'administration de l'école." />
      </div>
    );
  }

  const enfantSelectionne = sp.enfant ? Number(sp.enfant) : enfants[0]!.id;
  const enfant = enfants.find((e) => e.id === enfantSelectionne) ?? enfants[0]!;
  const bulletin = calculerBulletin(enfant.id, 1);
  const absencesRecentes = listAbsencesParEleve(enfant.id).slice(0, 5);
  const annonces = listToutesAnnonces()
    .filter((a) => a.cible === "ecole" || a.cible === "parents")
    .slice(0, 4);

  return (
    <div>
      <PageHeader title={`Bonjour, ${session.nom} 👋`} description="Voici le suivi de vos enfants." />

      {enfants.length > 1 && (
        <div className="mb-6 flex gap-2">
          {enfants.map((e) => (
            <Link
              key={e.id}
              href={`/parent?enfant=${e.id}`}
              className={`rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                e.id === enfant.id
                  ? "border-kalan-red bg-kalan-red-light text-kalan-red"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {e.prenom}
            </Link>
          ))}
        </div>
      )}

      <Link href={`/parent/notes?enfant=${enfant.id}`}>
        <Card className="mb-6 flex items-center gap-5 p-5 transition-shadow hover:shadow-md">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-kalan-red-light text-base font-bold text-kalan-red">
            {bulletin.moyenneGenerale !== null ? `${Math.round((bulletin.moyenneGenerale / 20) * 100)}%` : "—"}
          </div>
          <div>
            <p className="text-sm text-slate-500">Moyenne de {enfant.prenom} (Trimestre 1)</p>
            <p className="text-2xl font-bold text-slate-900">
              {bulletin.moyenneGenerale !== null ? `${bulletin.moyenneGenerale}/20` : "Pas encore de notes"}
            </p>
          </div>
        </Card>
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Absences récentes</h2>
          {absencesRecentes.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune absence récente. 🎉</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {absencesRecentes.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>{new Date(a.date).toLocaleDateString("fr-FR")} · {a.matiere_nom ?? "—"}</span>
                  <Badge tone={a.statut === "absent" ? "red" : "amber"}>
                    {a.statut === "absent" ? "Absent" : "Retard"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Annonces de l&apos;école</h2>
          {annonces.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune annonce pour le moment.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {annonces.map((a) => (
                <li key={a.id} className="py-2.5">
                  <p className="text-sm font-medium text-slate-800">{a.titre}</p>
                  <p className="text-xs text-slate-500">{a.message}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
