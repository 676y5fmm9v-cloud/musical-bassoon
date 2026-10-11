import Link from "next/link";
import { notFound } from "next/navigation";
import { getEleve } from "@/lib/repo/eleves";
import { calculerBulletin } from "@/lib/repo/notes";
import { deleteEleveAction } from "../actions";
import { Badge, Card, PageHeader, btnSecondary } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { IconArrowLeft, IconEdit } from "@/components/icons";

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("fr-FR");
  } catch {
    return value;
  }
}

export default async function EleveDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ trimestre?: string }>;
}) {
  const { id } = await params;
  const eleveId = Number(id);
  const eleve = getEleve(eleveId);
  if (!eleve) notFound();

  const sp = await searchParams;
  const trimestre = [1, 2, 3].includes(Number(sp.trimestre))
    ? Number(sp.trimestre)
    : 1;
  const bulletin = calculerBulletin(eleveId, trimestre);

  return (
    <div>
      <Link
        href="/eleves"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <IconArrowLeft className="h-4 w-4" />
        Retour aux élèves
      </Link>

      <PageHeader
        title={`${eleve.prenom} ${eleve.nom}`}
        description={`Matricule ${eleve.matricule}`}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/eleves/${eleve.id}/modifier`} className={btnSecondary}>
              <IconEdit className="h-4 w-4" />
              Modifier
            </Link>
            <DeleteButton
              action={deleteEleveAction}
              confirmMessage={`Supprimer définitivement ${eleve.prenom} ${eleve.nom} ? Cette action supprimera aussi ses notes.`}
            >
              <input type="hidden" name="id" value={eleve.id} />
            </DeleteButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Informations
          </h2>
          <dl className="space-y-3 text-sm">
            <Row label="Statut">
              <Badge tone={eleve.statut === "actif" ? "green" : "red"}>
                {eleve.statut === "actif" ? "Actif" : "Inactif"}
              </Badge>
            </Row>
            <Row label="Genre">{eleve.genre === "M" ? "Masculin" : "Féminin"}</Row>
            <Row label="Date de naissance">{formatDate(eleve.date_naissance)}</Row>
            <Row label="Classe">
              {eleve.classe_id ? (
                <Link
                  href={`/classes/${eleve.classe_id}`}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {eleve.classe_nom}
                </Link>
              ) : (
                <span className="text-slate-400">Non assignée</span>
              )}
            </Row>
            <Row label="Date d'inscription">{formatDate(eleve.date_inscription)}</Row>
          </dl>

          <h2 className="mb-4 mt-6 text-base font-semibold text-slate-900">
            Parent / tuteur
          </h2>
          <dl className="space-y-3 text-sm">
            <Row label="Nom">{eleve.nom_parent || "—"}</Row>
            <Row label="Téléphone">{eleve.telephone_parent || "—"}</Row>
            <Row label="Email">{eleve.email_parent || "—"}</Row>
            <Row label="Adresse">{eleve.adresse || "—"}</Row>
          </dl>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Bulletin</h2>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              {[1, 2, 3].map((t) => (
                <Link
                  key={t}
                  href={`/eleves/${eleve.id}?trimestre=${t}`}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    trimestre === t
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Trimestre {t}
                </Link>
              ))}
            </div>
          </div>

          {bulletin.matieres.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Aucune note enregistrée pour ce trimestre.
            </p>
          ) : (
            <>
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">
                      Matière
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold text-slate-600">
                      Coef.
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold text-slate-600">
                      Devoir
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold text-slate-600">
                      Composition
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold text-slate-600">
                      Moyenne
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bulletin.matieres.map((m) => (
                    <tr key={m.matiereId}>
                      <td className="px-3 py-2.5 font-medium text-slate-800">
                        {m.matiereNom}
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-500">
                        {m.coefficient}
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-700">
                        {m.devoir ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-700">
                        {m.composition ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-center font-semibold text-slate-900">
                        {m.moyenne}/20
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-5 flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3">
                <span className="text-sm font-medium text-slate-200">
                  Moyenne générale du trimestre {trimestre}
                </span>
                <span className="text-lg font-bold text-amber-400">
                  {bulletin.moyenneGenerale}/20
                </span>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{children}</dd>
    </div>
  );
}
