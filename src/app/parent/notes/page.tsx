import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { listEnfantsDuParent } from "@/lib/repo/comptes";
import { getEleve } from "@/lib/repo/eleves";
import { calculerBulletin } from "@/lib/repo/notes";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export default async function ParentNotesPage({
  searchParams,
}: {
  searchParams: Promise<{ enfant?: string; trimestre?: string }>;
}) {
  const session = await verifySession();
  const sp = await searchParams;

  const enfantIds = listEnfantsDuParent(session.compteId);
  const enfants = enfantIds.map((id) => getEleve(id)).filter((e) => e !== undefined);
  if (enfants.length === 0) {
    return (
      <div>
        <PageHeader title="Notes" />
        <EmptyState title="Aucun enfant lié à votre compte" />
      </div>
    );
  }

  const enfant = enfants.find((e) => e.id === Number(sp.enfant)) ?? enfants[0]!;
  const trimestre = [1, 2, 3].includes(Number(sp.trimestre)) ? Number(sp.trimestre) : 1;
  const bulletin = calculerBulletin(enfant.id, trimestre);

  return (
    <div>
      <PageHeader title={`Notes — ${enfant.prenom} ${enfant.nom}`} description={enfant.classe_nom ?? ""} />

      {enfants.length > 1 && (
        <div className="mb-5 flex gap-2">
          {enfants.map((e) => (
            <Link
              key={e.id}
              href={`/parent/notes?enfant=${e.id}&trimestre=${trimestre}`}
              className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold ${
                e.id === enfant.id
                  ? "border-kalan-red bg-kalan-red-light text-kalan-red"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {e.prenom}
            </Link>
          ))}
        </div>
      )}

      <Card className="p-5">
        <div className="mb-4 flex justify-end">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {[1, 2, 3].map((t) => (
              <Link
                key={t}
                href={`/parent/notes?enfant=${enfant.id}&trimestre=${t}`}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  trimestre === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Trimestre {t}
              </Link>
            ))}
          </div>
        </div>

        {bulletin.matieres.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            Aucune note enregistrée pour ce trimestre.
          </p>
        ) : (
          <>
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Matière</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-slate-600">Coef.</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-slate-600">Devoir</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-slate-600">Composition</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-slate-600">Moyenne</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bulletin.matieres.map((m) => (
                  <tr key={m.matiereId}>
                    <td className="px-3 py-2.5 font-medium text-slate-800">{m.matiereNom}</td>
                    <td className="px-3 py-2.5 text-center text-slate-500">{m.coefficient}</td>
                    <td className="px-3 py-2.5 text-center text-slate-700">{m.devoir ?? "—"}</td>
                    <td className="px-3 py-2.5 text-center text-slate-700">{m.composition ?? "—"}</td>
                    <td className="px-3 py-2.5 text-center font-semibold text-slate-900">{m.moyenne}/20</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-5 flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3">
              <span className="text-sm font-medium text-slate-200">
                Moyenne générale du trimestre {trimestre}
              </span>
              <span className="text-lg font-bold text-kalan-yellow">{bulletin.moyenneGenerale}/20</span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
