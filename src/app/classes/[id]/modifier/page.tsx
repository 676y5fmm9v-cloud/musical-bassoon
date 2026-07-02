import Link from "next/link";
import { notFound } from "next/navigation";
import { getClasse } from "@/lib/repo/classes";
import { listEnseignants } from "@/lib/repo/enseignants";
import { ClasseForm } from "../../ClasseForm";
import { updateClasseAction } from "../../actions";
import { Card, PageHeader } from "@/components/ui";
import { IconArrowLeft } from "@/components/icons";

export default async function ModifierClassePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const classeId = Number(id);
  const classe = getClasse(classeId);
  if (!classe) notFound();

  const enseignants = listEnseignants();
  const action = updateClasseAction.bind(null, classeId);

  return (
    <div>
      <Link
        href={`/classes/${classeId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <IconArrowLeft className="h-4 w-4" />
        Retour à la classe
      </Link>
      <PageHeader title={`Modifier ${classe.nom}`} />
      <Card className="p-6">
        <ClasseForm
          action={action}
          enseignants={enseignants}
          classe={classe}
          cancelHref={`/classes/${classeId}`}
        />
      </Card>
    </div>
  );
}
