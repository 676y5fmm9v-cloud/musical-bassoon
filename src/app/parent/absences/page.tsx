import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { listEnfantsDuParent } from "@/lib/repo/comptes";
import { getEleve } from "@/lib/repo/eleves";
import { listAbsencesParEleve } from "@/lib/repo/absences";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("fr-FR");
  } catch {
    return value;
  }
}

export default async function ParentAbsencesPage({
  searchParams,
}: {
  searchParams: Promise<{ enfant?: string }>;
}) {
  const session = await verifySession();
  const sp = await searchParams;

  const enfantIds = listEnfantsDuParent(session.compteId);
  const enfants = enfantIds.map((id) => getEleve(id)).filter((e) => e !== undefined);
  if (enfants.length === 0) {
    return (
      <div>
        <PageHeader title="Absences" />
        <EmptyState title="Aucun enfant lié à votre compte" />
      </div>
    );
  }

  const enfant = enfants.find((e) => e.id === Number(sp.enfant)) ?? enfants[0]!;
  const absences = listAbsencesParEleve(enfant.id);

  return (
    <div>
      <PageHeader title={`Absences — ${enfant.prenom} ${enfant.nom}`} />

      {enfants.length > 1 && (
        <div className="mb-5 flex gap-2">
          {enfants.map((e) => (
            <Link
              key={e.id}
              href={`/parent/absences?enfant=${e.id}`}
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

      {absences.length === 0 ? (
        <EmptyState title="Aucune absence enregistrée 🎉" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Matière</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Statut</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Justifiée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {absences.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 text-slate-700">{formatDate(a.date)}</td>
                  <td className="px-4 py-3 text-slate-700">{a.matiere_nom ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={a.statut === "absent" ? "red" : "amber"}>
                      {a.statut === "absent" ? "Absent" : "Retard"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={a.justifiee ? "green" : "slate"}>{a.justifiee ? "Oui" : "Non"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
