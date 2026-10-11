import { verifySession } from "@/lib/auth/dal";
import { listAbsencesParEleve } from "@/lib/repo/absences";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("fr-FR");
  } catch {
    return value;
  }
}

export default async function EleveAbsencesPage() {
  const session = await verifySession();
  const absences = listAbsencesParEleve(session.eleveId!);

  return (
    <div>
      <PageHeader title="Mes absences" description={`${absences.length} absence(s) ou retard(s) enregistré(s).`} />
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
                    <Badge tone={a.justifiee ? "green" : "slate"}>
                      {a.justifiee ? "Oui" : "Non"}
                    </Badge>
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
