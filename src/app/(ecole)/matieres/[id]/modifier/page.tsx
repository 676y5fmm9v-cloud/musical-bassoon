import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatiere } from "@/lib/repo/matieres";
import { MatiereForm } from "../../MatiereForm";
import { updateMatiereAction } from "../../actions";
import { Card, PageHeader } from "@/components/ui";
import { IconArrowLeft } from "@/components/icons";

export default async function ModifierMatierePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matiereId = Number(id);
  const matiere = getMatiere(matiereId);
  if (!matiere) notFound();

  const action = updateMatiereAction.bind(null, matiereId);

  return (
    <div>
      <Link
        href="/matieres"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <IconArrowLeft className="h-4 w-4" />
        Retour aux matières
      </Link>
      <PageHeader title={`Modifier ${matiere.nom}`} />
      <Card className="p-6">
        <MatiereForm action={action} matiere={matiere} cancelHref="/matieres" />
      </Card>
    </div>
  );
}
