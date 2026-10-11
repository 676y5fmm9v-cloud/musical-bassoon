import Link from "next/link";
import { listNotes } from "@/lib/repo/notes";
import { listAllClasses } from "@/lib/repo/classes";
import { listMatieres } from "@/lib/repo/matieres";
import { deleteNoteAction } from "./actions";
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  btnPrimary,
  inputClass,
} from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { IconPlus } from "@/components/icons";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ classe?: string; matiere?: string; trimestre?: string }>;
}) {
  const sp = await searchParams;
  const classeId = sp.classe ? Number(sp.classe) : undefined;
  const matiereId = sp.matiere ? Number(sp.matiere) : undefined;
  const trimestre = sp.trimestre ? Number(sp.trimestre) : undefined;

  const notes = listNotes({ classeId, matiereId, trimestre });
  const classes = listAllClasses();
  const matieres = listMatieres();

  return (
    <div>
      <PageHeader
        title="Notes"
        description={`${notes.length} note${notes.length > 1 ? "s" : ""} enregistrée${notes.length > 1 ? "s" : ""}.`}
        action={
          <Link href="/notes/saisir" className={btnPrimary}>
            <IconPlus className="h-4 w-4" />
            Saisir des notes
          </Link>
        }
      />

      <Card className="mb-5 p-4">
        <form className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <select name="classe" defaultValue={sp.classe ?? ""} className={inputClass}>
            <option value="">Toutes les classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
          <select name="matiere" defaultValue={sp.matiere ?? ""} className={inputClass}>
            <option value="">Toutes les matières</option>
            {matieres.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nom}
              </option>
            ))}
          </select>
          <select
            name="trimestre"
            defaultValue={sp.trimestre ?? ""}
            className={inputClass}
          >
            <option value="">Tous les trimestres</option>
            <option value="1">Trimestre 1</option>
            <option value="2">Trimestre 2</option>
            <option value="3">Trimestre 3</option>
          </select>
          <button type="submit" className={btnPrimary}>
            Filtrer
          </button>
        </form>
      </Card>

      {notes.length === 0 ? (
        <EmptyState
          title="Aucune note trouvée"
          description="Modifiez vos filtres ou commencez la saisie des notes pour une classe."
          action={
            <Link href="/notes/saisir" className={btnPrimary}>
              <IconPlus className="h-4 w-4" />
              Saisir des notes
            </Link>
          }
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Élève
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Matière
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Trimestre
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Type
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Note
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notes.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/eleves/${n.eleve_id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {n.eleve_prenom} {n.eleve_nom}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{n.matiere_nom}</td>
                  <td className="px-4 py-3 text-slate-700">T{n.trimestre}</td>
                  <td className="px-4 py-3">
                    <Badge tone={n.type === "devoir" ? "blue" : "amber"}>
                      {n.type === "devoir" ? "Devoir" : "Composition"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {n.valeur}/20
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <DeleteButton
                        action={deleteNoteAction}
                        confirmMessage={`Supprimer cette note de ${n.eleve_prenom} ${n.eleve_nom} en ${n.matiere_nom} ?`}
                      >
                        <input type="hidden" name="id" value={n.id} />
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
