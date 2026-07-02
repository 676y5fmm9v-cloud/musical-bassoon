import Link from "next/link";
import { notFound } from "next/navigation";
import { getEleve } from "@/lib/repo/eleves";
import { listAllClasses } from "@/lib/repo/classes";
import { EleveForm } from "../../EleveForm";
import { updateEleveAction } from "../../actions";
import { Card, PageHeader } from "@/components/ui";
import { IconArrowLeft } from "@/components/icons";

export default async function ModifierElevePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eleveId = Number(id);
  const eleve = getEleve(eleveId);
  if (!eleve) notFound();

  const classes = listAllClasses();
  const action = updateEleveAction.bind(null, eleveId);

  return (
    <div>
      <Link
        href={`/eleves/${eleveId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <IconArrowLeft className="h-4 w-4" />
        Retour à la fiche élève
      </Link>
      <PageHeader
        title={`Modifier ${eleve.prenom} ${eleve.nom}`}
        description={`Matricule ${eleve.matricule}`}
      />
      <Card className="p-6">
        <EleveForm
          action={action}
          classes={classes}
          eleve={eleve}
          cancelHref={`/eleves/${eleveId}`}
        />
      </Card>
    </div>
  );
}
