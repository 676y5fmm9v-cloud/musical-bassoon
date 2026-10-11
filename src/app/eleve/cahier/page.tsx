import { verifySession } from "@/lib/auth/dal";
import { getEleve } from "@/lib/repo/eleves";
import { listCahierParClasse } from "@/lib/repo/cahier";
import { Card, EmptyState, PageHeader } from "@/components/ui";

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("fr-FR");
  } catch {
    return value;
  }
}

export default async function EleveCahierPage() {
  const session = await verifySession();
  const eleve = getEleve(session.eleveId!);
  const entrees = eleve?.classe_id ? listCahierParClasse(eleve.classe_id) : [];

  return (
    <div>
      <PageHeader
        title="Cahier de textes"
        description="Ce qui a été fait en classe et le travail donné, même si tu étais absent."
      />
      {entrees.length === 0 ? (
        <EmptyState title="Aucune séance enregistrée" />
      ) : (
        <div className="space-y-3">
          {entrees.map((e) => (
            <Card key={e.id} className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-kalan-green">
                {e.matiere_nom} · {formatDate(e.date)}
              </p>
              <p className="mt-1.5 text-sm text-slate-800">{e.contenu_seance}</p>
              {e.travail_donne && (
                <p className="mt-1.5 text-sm text-slate-500">
                  <span className="font-medium">Travail donné : </span>
                  {e.travail_donne}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
