import Link from "next/link";
import { listMatieres } from "@/lib/repo/matieres";
import { deleteMatiereAction } from "./actions";
import { Card, EmptyState, PageHeader, btnPrimary } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { IconEdit, IconPlus } from "@/components/icons";

export default function MatieresPage() {
  const matieres = listMatieres();

  return (
    <div>
      <PageHeader
        title="Matières"
        description={`${matieres.length} matière${matieres.length > 1 ? "s" : ""} enseignées, avec leur coefficient.`}
        action={
          <Link href="/matieres/nouveau" className={btnPrimary}>
            <IconPlus className="h-4 w-4" />
            Nouvelle matière
          </Link>
        }
      />

      {matieres.length === 0 ? (
        <EmptyState
          title="Aucune matière enregistrée"
          description="Ajoutez les matières enseignées pour pouvoir y attacher des notes."
          action={
            <Link href="/matieres/nouveau" className={btnPrimary}>
              <IconPlus className="h-4 w-4" />
              Nouvelle matière
            </Link>
          }
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Matière
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Coefficient
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matieres.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {m.nom}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{m.coefficient}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/matieres/${m.id}/modifier`}
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                      >
                        <IconEdit className="h-4 w-4" />
                        Modifier
                      </Link>
                      <DeleteButton
                        action={deleteMatiereAction}
                        confirmMessage={`Supprimer la matière "${m.nom}" ? Toutes les notes associées seront également supprimées.`}
                      >
                        <input type="hidden" name="id" value={m.id} />
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
