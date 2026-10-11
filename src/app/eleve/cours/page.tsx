import { verifySession } from "@/lib/auth/dal";
import { getEleve } from "@/lib/repo/eleves";
import { listCoursParClasse } from "@/lib/repo/cours";
import { Card, EmptyState, PageHeader } from "@/components/ui";

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("fr-FR");
  } catch {
    return value;
  }
}

export default async function EleveCoursPage() {
  const session = await verifySession();
  const eleve = getEleve(session.eleveId!);
  const cours = eleve?.classe_id ? listCoursParClasse(eleve.classe_id) : [];

  return (
    <div>
      <PageHeader title="Cours" description="Cours publiés par tes professeurs." />
      {cours.length === 0 ? (
        <EmptyState title="Aucun cours publié" />
      ) : (
        <div className="space-y-3">
          {cours.map((c) => (
            <Card key={c.id} className="p-4">
              <h3 className="font-semibold text-slate-900">{c.titre}</h3>
              <p className="text-sm text-slate-500">
                {c.matiere_nom} · {c.enseignant_nom} · {formatDate(c.date)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
