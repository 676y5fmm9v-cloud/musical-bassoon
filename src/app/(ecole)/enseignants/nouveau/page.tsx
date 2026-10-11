import Link from "next/link";
import { EnseignantForm } from "../EnseignantForm";
import { createEnseignantAction } from "../actions";
import { Card, PageHeader } from "@/components/ui";
import { IconArrowLeft } from "@/components/icons";

export default function NouvelEnseignantPage() {
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
        title="Ajouter un enseignant"
        description="Renseignez les informations de l'enseignant."
      />
      <Card className="p-6">
        <EnseignantForm action={createEnseignantAction} cancelHref="/enseignants" />
      </Card>
    </div>
  );
}
