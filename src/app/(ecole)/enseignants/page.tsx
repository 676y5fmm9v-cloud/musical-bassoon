import Link from "next/link";
import { listEnseignants } from "@/lib/repo/enseignants";
import { Card, EmptyState, PageHeader, btnPrimary } from "@/components/ui";
import { IconPlus } from "@/components/icons";

export default function EnseignantsPage() {
  const enseignants = listEnseignants();

  return (
    <div>
      <PageHeader
        title="Enseignants"
        description={`${enseignants.length} enseignant${enseignants.length > 1 ? "s" : ""} au sein de l'école.`}
        action={
          <Link href="/enseignants/nouveau" className={btnPrimary}>
            <IconPlus className="h-4 w-4" />
            Nouvel enseignant
          </Link>
        }
      />

      {enseignants.length === 0 ? (
        <EmptyState
          title="Aucun enseignant enregistré"
          description="Ajoutez un enseignant pour commencer à organiser les classes et les notes."
          action={
            <Link href="/enseignants/nouveau" className={btnPrimary}>
              <IconPlus className="h-4 w-4" />
              Nouvel enseignant
            </Link>
          }
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Nom et prénom
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Spécialité
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Téléphone
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enseignants.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/enseignants/${e.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {e.prenom} {e.nom}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {e.specialite || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {e.telephone || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{e.email || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
