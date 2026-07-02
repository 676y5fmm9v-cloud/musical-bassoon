import Link from "next/link";
import { notFound } from "next/navigation";
import { getEnseignant } from "@/lib/repo/enseignants";
import { listClasses } from "@/lib/repo/classes";
import { deleteEnseignantAction } from "../actions";
import { Card, PageHeader, btnSecondary } from "@/components/ui";
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

export default async function EnseignantDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const enseignantId = Number(id);
  const enseignant = getEnseignant(enseignantId);
  if (!enseignant) notFound();

  const { error } = await searchParams;
  const classesTitulaire = listClasses().filter(
    (c) => c.enseignant_principal_id === enseignantId
  );

  return (
    <div>
      <Link
        href="/enseignants"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <IconArrowLeft className="h-4 w-4" />
        Retour aux enseignants
      </Link>

      <PageHeader
        title={`${enseignant.prenom} ${enseignant.nom}`}
        description={enseignant.specialite || "Enseignant"}
        action={
          <div className="flex items-center gap-2">
            <Link
              href={`/enseignants/${enseignant.id}/modifier`}
              className={btnSecondary}
            >
              <IconEdit className="h-4 w-4" />
              Modifier
            </Link>
            <DeleteButton
              action={deleteEnseignantAction}
              confirmMessage={`Supprimer définitivement ${enseignant.prenom} ${enseignant.nom} ?`}
            >
              <input type="hidden" name="id" value={enseignant.id} />
            </DeleteButton>
          </div>
        }
      />

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Informations
          </h2>
          <dl className="space-y-3 text-sm">
            <Row label="Spécialité">{enseignant.specialite || "—"}</Row>
            <Row label="Téléphone">{enseignant.telephone || "—"}</Row>
            <Row label="Email">{enseignant.email || "—"}</Row>
            <Row label="Date d'embauche">
              {formatDate(enseignant.date_embauche)}
            </Row>
          </dl>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Classes dont il est titulaire
          </h2>
          {classesTitulaire.length === 0 ? (
            <p className="text-sm text-slate-500">
              Cet enseignant n&apos;est titulaire d&apos;aucune classe.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {classesTitulaire.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2.5">
                  <Link
                    href={`/classes/${c.id}`}
                    className="font-medium text-slate-800 hover:underline"
                  >
                    {c.nom}
                  </Link>
                  <span className="text-sm text-slate-500">
                    {c.effectif} élève{c.effectif > 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
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
