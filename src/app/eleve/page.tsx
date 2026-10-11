import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { getEleve } from "@/lib/repo/eleves";
import { calculerBulletin } from "@/lib/repo/notes";
import { listDevoirsParClasse } from "@/lib/repo/devoirs";
import { listCoursParClasse } from "@/lib/repo/cours";
import { Card, PageHeader } from "@/components/ui";

export default async function EleveAccueilPage() {
  const session = await verifySession();
  const eleve = getEleve(session.eleveId!);
  const bulletin = calculerBulletin(session.eleveId!, 1);

  const devoirs = eleve?.classe_id ? listDevoirsParClasse(eleve.classe_id) : [];
  const devoirsAVenir = devoirs
    .filter((d) => new Date(d.date_limite) >= new Date())
    .slice(0, 3);
  const cours = eleve?.classe_id ? listCoursParClasse(eleve.classe_id).slice(0, 4) : [];

  return (
    <div>
      <PageHeader title={`Bonjour, ${session.nom} 👋`} description="Prêt à apprendre ?" />

      <Link href="/eleve/notes">
        <Card className="mb-6 flex items-center gap-5 p-5 transition-shadow hover:shadow-md">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-kalan-green-light text-base font-bold text-kalan-green">
            {bulletin.moyenneGenerale !== null ? `${Math.round((bulletin.moyenneGenerale / 20) * 100)}%` : "—"}
          </div>
          <div>
            <p className="text-sm text-slate-500">Moyenne générale (Trimestre 1)</p>
            <p className="text-2xl font-bold text-slate-900">
              {bulletin.moyenneGenerale !== null ? `${bulletin.moyenneGenerale}/20` : "Pas encore de notes"}
            </p>
          </div>
        </Card>
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Devoirs à venir</h2>
          {devoirsAVenir.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun devoir en attente. 🎉</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {devoirsAVenir.map((d) => (
                <li key={d.id} className="py-2.5">
                  <Link href="/eleve/devoirs" className="font-medium text-slate-800 hover:underline">
                    {d.titre}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {d.matiere_nom} · à rendre avant le {new Date(d.date_limite).toLocaleDateString("fr-FR")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Fil de classe</h2>
          {cours.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun cours publié pour le moment.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {cours.map((c) => (
                <li key={c.id} className="py-2.5">
                  <p className="font-medium text-slate-800">{c.titre}</p>
                  <p className="text-xs text-slate-500">{c.matiere_nom} · {c.enseignant_nom}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
