import Link from "next/link";
import { notFound } from "next/navigation";
import { getEnseignant } from "@/lib/repo/enseignants";
import { EnseignantForm } from "../../EnseignantForm";
import { updateEnseignantAction } from "../../actions";
import { Card, PageHeader } from "@/components/ui";
import { IconArrowLeft } from "@/components/icons";

export default async function ModifierEnseignantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const enseignantId = Number(id);
  const enseignant = getEnseignant(enseignantId);
  if (!enseignant) notFound();

  const action = updateEnseignantAction.bind(null, enseignantId);

  return (
    <div>
      <Link
        href={`/enseignants/${enseignantId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <IconArrowLeft className="h-4 w-4" />
        Retour à la fiche enseignant
      </Link>
      <PageHeader
        title={`Modifier ${enseignant.prenom} ${enseignant.nom}`}
      />
      <Card className="p-6">
        <EnseignantForm
          action={action}
          enseignant={enseignant}
          cancelHref={`/enseignants/${enseignantId}`}
        />
      </Card>
    </div>
  );
}
