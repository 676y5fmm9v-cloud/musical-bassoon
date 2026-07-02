import Link from "next/link";
import { notFound } from "next/navigation";
import { getClasse } from "@/lib/repo/classes";
import { listElevesParClasse } from "@/lib/repo/eleves";
import { deleteClasseAction } from "../actions";
import { Badge, Card, PageHeader, btnSecondary, btnPrimary } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { IconArrowLeft, IconEdit, IconPlus } from "@/components/icons";

export default async function ClasseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const classeId = Number(id);
  const classe = getClasse(classeId);
  if (!classe) notFound();

  const { error } = await searchParams;
  const eleves = listElevesParClasse(classeId);

  return (
    <div>
      <Link
        href="/classes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <IconArrowLeft className="h-4 w-4" />
        Retour aux classes
      </Link>

      <PageHeader
        title={classe.nom}
        description={`${classe.niveau} · Année scolaire ${classe.annee_scolaire}`}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/classes/${classe.id}/modifier`} className={btnSecondary}>
              <IconEdit className="h-4 w-4" />
              Modifier
            </Link>
            <DeleteButton
              action={deleteClasseAction}
              confirmMessage={`Supprimer définitivement la classe ${classe.nom} ?`}
            >
              <input type="hidden" name="id" value={classe.id} />
            </DeleteButton>
          </div>
        }
      />

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Titulaire</p>
          <p className="mt-1 font-semibold text-slate-900">
            {classe.enseignant_nom ? (
              <Link
                href={`/enseignants/${classe.enseignant_principal_id}`}
                className="hover:underline"
              >
                {classe.enseignant_nom}
              </Link>
            ) : (
              <span className="text-slate-400">Non assigné</span>
            )}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Effectif</p>
          <p className="mt-1 font-semibold text-slate-900">
            {classe.effectif} élève{classe.effectif > 1 ? "s" : ""}
            {classe.capacite ? ` / ${classe.capacite}` : ""}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Année scolaire</p>
          <p className="mt-1 font-semibold text-slate-900">
            {classe.annee_scolaire}
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Liste des élèves
          </h2>
          <Link href={`/eleves/nouveau`} className={btnPrimary}>
            <IconPlus className="h-4 w-4" />
            Ajouter un élève
          </Link>
        </div>
        {eleves.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            Aucun élève inscrit dans cette classe.
          </p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Matricule
                </th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Nom et prénom
                </th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Genre
                </th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eleves.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/eleves/${e.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {e.matricule}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-700">
                    {e.prenom} {e.nom}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {e.genre === "M" ? "Masculin" : "Féminin"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={e.statut === "actif" ? "green" : "red"}>
                      {e.statut === "actif" ? "Actif" : "Inactif"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
