import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import { getClasse } from "@/lib/repo/classes";
import { listElevesParClasse } from "@/lib/repo/eleves";
import { listAffectationsParEnseignant } from "@/lib/repo/affectations";
import { Badge, Card, PageHeader, btnPrimary, btnSecondary } from "@/components/ui";

export default async function ProfClasseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const classeId = Number(id);
  const session = await verifySession();

  const affectations = listAffectationsParEnseignant(session.enseignantId!).filter(
    (a) => a.classe_id === classeId
  );
  if (affectations.length === 0) notFound();

  const classe = getClasse(classeId);
  if (!classe) notFound();
  const eleves = listElevesParClasse(classeId);

  return (
    <div>
      <PageHeader
        title={classe.nom}
        description={`${classe.niveau} · ${eleves.length} élève(s)`}
      />

      <Card className="mb-6 p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Mes matières dans cette classe
        </h2>
        <div className="flex flex-wrap gap-2">
          {affectations.map((a) => (
            <Badge key={a.id} tone="green">
              {a.matiere_nom}
            </Badge>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/prof/notes/saisir?classe=${classeId}`} className={btnPrimary}>
            🅰️ Saisir des notes
          </Link>
          <Link href={`/prof/appel?classe=${classeId}`} className={btnSecondary}>
            ✋ Faire l&apos;appel
          </Link>
          <Link href={`/prof/devoirs/nouveau?classe=${classeId}`} className={btnSecondary}>
            📝 Créer un devoir
          </Link>
          <Link href={`/prof/cours/nouveau?classe=${classeId}`} className={btnSecondary}>
            📖 Publier un cours
          </Link>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Liste des élèves</h2>
        </div>
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left font-semibold text-slate-600">Matricule</th>
              <th className="px-5 py-3 text-left font-semibold text-slate-600">Nom et prénom</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {eleves.map((e) => (
              <tr key={e.id}>
                <td className="px-5 py-3 font-medium text-slate-900">{e.matricule}</td>
                <td className="px-5 py-3 text-slate-700">{e.prenom} {e.nom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
