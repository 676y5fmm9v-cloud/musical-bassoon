import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { listCoursParEnseignant } from "@/lib/repo/cours";
import { Card, EmptyState, PageHeader, btnPrimary } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteCoursAction } from "./actions";
import { IconPlus } from "@/components/icons";

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("fr-FR");
  } catch {
    return value;
  }
}

export default async function ProfCoursPage() {
  const session = await verifySession();
  const cours = listCoursParEnseignant(session.enseignantId!);

  return (
    <div>
      <PageHeader
        title="Mes cours"
        description={`${cours.length} cours publié(s).`}
        action={
          <Link href="/prof/cours/nouveau" className={btnPrimary}>
            <IconPlus className="h-4 w-4" />
            Publier un cours
          </Link>
        }
      />

      {cours.length === 0 ? (
        <EmptyState title="Aucun cours publié" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Titre</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Classe</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Matière</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cours.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{c.titre}</td>
                  <td className="px-4 py-3 text-slate-600">{c.classe_nom}</td>
                  <td className="px-4 py-3 text-slate-600">{c.matiere_nom}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(c.date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <DeleteButton action={deleteCoursAction} confirmMessage={`Supprimer le cours "${c.titre}" ?`}>
                        <input type="hidden" name="id" value={c.id} />
                      </DeleteButton>
                    </div>
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
