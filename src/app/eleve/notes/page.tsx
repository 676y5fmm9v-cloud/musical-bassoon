import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { calculerBulletin } from "@/lib/repo/notes";
import { Card, PageHeader } from "@/components/ui";

export default async function EleveNotesPage({
  searchParams,
}: {
  searchParams: Promise<{ trimestre?: string }>;
}) {
  const session = await verifySession();
  const sp = await searchParams;
  const trimestre = [1, 2, 3].includes(Number(sp.trimestre)) ? Number(sp.trimestre) : 1;
  const bulletin = calculerBulletin(session.eleveId!, trimestre);

  return (
    <div>
      <PageHeader title="Mes notes" description="Bulletin par trimestre, calculé automatiquement." />

      <Card className="p-5">
        <div className="mb-4 flex justify-end">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {[1, 2, 3].map((t) => (
              <Link
                key={t}
                href={`/eleve/notes?trimestre=${t}`}
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
