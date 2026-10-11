import { verifySession } from "@/lib/auth/dal";
import { listClassesEnseignees } from "@/lib/repo/affectations";
import { listMatieres } from "@/lib/repo/matieres";
import { listCahierParEnseignant } from "@/lib/repo/cahier";
import { CahierForm } from "./CahierForm";
import { deleteEntreeCahierAction } from "./actions";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("fr-FR");
  } catch {
    return value;
  }
}

export default async function ProfCahierPage() {
  const session = await verifySession();
  const classes = listClassesEnseignees(session.enseignantId!);
  const matieres = listMatieres();
  const entrees = listCahierParEnseignant(session.enseignantId!);

  return (
    <div>
      <PageHeader title="Cahier de textes" description="Consulté par la direction et visible par les élèves." />

      <Card className="mb-6 p-6">
        <CahierForm classes={classes} matieres={matieres} />
      </Card>

      {entrees.length === 0 ? (
        <EmptyState title="Aucune séance enregistrée" />
      ) : (
        <div className="space-y-3">
          {entrees.map((e) => (
            <Card key={e.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-kalan-green">
                    {e.classe_nom} · {e.matiere_nom} · {formatDate(e.date)}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-800">{e.contenu_seance}</p>
                  {e.travail_donne && (
                    <p className="mt-1.5 text-sm text-slate-500">
                      <span className="font-medium">Travail donné : </span>
                      {e.travail_donne}
                    </p>
                  )}
                </div>
                <DeleteButton action={deleteEntreeCahierAction} confirmMessage="Supprimer cette séance ?" label="">
                  <input type="hidden" name="id" value={e.id} />
                </DeleteButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
