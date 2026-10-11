import { verifySession } from "@/lib/auth/dal";
import { getEleve } from "@/lib/repo/eleves";
import { listDevoirsPourEleve } from "@/lib/repo/devoirs";
import { rendreDevoirAction } from "./actions";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("fr-FR");
  } catch {
    return value;
  }
}

export default async function EleveDevoirsPage() {
  const session = await verifySession();
  const eleve = getEleve(session.eleveId!);
  const devoirs = eleve?.classe_id ? listDevoirsPourEleve(session.eleveId!, eleve.classe_id) : [];

  return (
    <div>
      <PageHeader title="Devoirs" description={`${devoirs.length} devoir(s) assigné(s) à ta classe.`} />

      {devoirs.length === 0 ? (
        <EmptyState title="Aucun devoir pour le moment" />
      ) : (
        <div className="space-y-3">
          {devoirs.map((d) => {
            const enRetard = !d.rendu_le && new Date(d.date_limite) < new Date();
            return (
              <Card key={d.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{d.titre}</h3>
                    <p className="text-sm text-slate-500">
                      {d.matiere_nom} · à rendre avant le {formatDate(d.date_limite)}
                    </p>
                    {d.consignes && <p className="mt-2 text-sm text-slate-600">{d.consignes}</p>}
                    {d.note_rendu !== null && (
                      <p className="mt-2 text-sm font-semibold text-kalan-green">
                        Note obtenue : {d.note_rendu}/20
                      </p>
                    )}
                  </div>
                  <Badge tone={d.rendu_le ? "green" : enRetard ? "red" : "amber"}>
                    {d.rendu_le ? "Rendu" : enRetard ? "En retard" : "À faire"}
                  </Badge>
                </div>

                {!d.rendu_le && (
                  <form action={rendreDevoirAction} className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                    <input type="hidden" name="devoir_id" value={d.id} />
                    <input
                      type="text"
                      name="commentaire"
                      placeholder="Commentaire pour le professeur (optionnel)"
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-kalan-green px-4 py-2 text-sm font-semibold text-white hover:bg-kalan-green-dark"
                    >
                      📤 Rendre
                    </button>
                  </form>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
