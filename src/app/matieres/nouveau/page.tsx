import Link from "next/link";
import { MatiereForm } from "../MatiereForm";
import { createMatiereAction } from "../actions";
import { Card, PageHeader } from "@/components/ui";
import { IconArrowLeft } from "@/components/icons";

export default function NouvelleMatierePage() {
  return (
    <div>
      <Link
        href="/matieres"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <IconArrowLeft className="h-4 w-4" />
        Retour aux matières
      </Link>
      <PageHeader
        title="Ajouter une matière"
        description="Le coefficient est utilisé pour calculer la moyenne générale."
      />
      <Card className="p-6">
        <MatiereForm action={createMatiereAction} cancelHref="/matieres" />
      </Card>
    </div>
  );
}
