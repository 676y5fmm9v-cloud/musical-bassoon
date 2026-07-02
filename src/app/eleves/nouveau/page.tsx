import Link from "next/link";
import { listAllClasses } from "@/lib/repo/classes";
import { genererMatricule } from "@/lib/repo/eleves";
import { EleveForm } from "../EleveForm";
import { createEleveAction } from "../actions";
import { Card, PageHeader } from "@/components/ui";
import { IconArrowLeft } from "@/components/icons";

export default function NouvelElevePage() {
  const classes = listAllClasses();
  const matricule = genererMatricule();

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
        title="Inscrire un nouvel élève"
        description="Renseignez les informations de l'élève et de son parent ou tuteur."
      />
      <Card className="p-6">
        <EleveForm
          action={createEleveAction}
          classes={classes}
          defaultMatricule={matricule}
          cancelHref="/eleves"
        />
      </Card>
    </div>
  );
}
