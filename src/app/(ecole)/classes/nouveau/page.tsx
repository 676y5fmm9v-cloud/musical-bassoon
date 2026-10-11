import Link from "next/link";
import { listEnseignants } from "@/lib/repo/enseignants";
import { ClasseForm } from "../ClasseForm";
import { createClasseAction } from "../actions";
import { Card, PageHeader } from "@/components/ui";
import { IconArrowLeft } from "@/components/icons";

export default function NouvelleClassePage() {
  const enseignants = listEnseignants();

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
        title="Créer une classe"
        description="Définissez le niveau, l'année scolaire et le titulaire de la classe."
      />
      <Card className="p-6">
        <ClasseForm
          action={createClasseAction}
          enseignants={enseignants}
          cancelHref="/classes"
        />
      </Card>
    </div>
  );
}
