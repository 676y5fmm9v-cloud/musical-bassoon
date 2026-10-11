import Link from "next/link";
import { listAllClasses } from "@/lib/repo/classes";
import { listMatieres } from "@/lib/repo/matieres";
import { listEnseignants } from "@/lib/repo/enseignants";
import { listElevesParClasse } from "@/lib/repo/eleves";
import { getNotesPourSaisie } from "@/lib/repo/notes";
import { enregistrerNotesAction } from "../actions";
import { SaisieNotesForm } from "@/components/notes/SaisieNotesForm";
import { Card, EmptyState, PageHeader, btnPrimary, inputClass, labelClass } from "@/components/ui";
import { IconArrowLeft } from "@/components/icons";
import type { TypeNote } from "@/lib/types";

export default async function SaisirNotesPage({
  searchParams,
}: {
  searchParams: Promise<{
    classe?: string;
    matiere?: string;
    trimestre?: string;
    type?: string;
    saved?: string;
  }>;
}) {
  const sp = await searchParams;
  const classes = listAllClasses();
  const matieres = listMatieres();
  const enseignants = listEnseignants();

  const classeId = sp.classe ? Number(sp.classe) : undefined;
  const matiereId = sp.matiere ? Number(sp.matiere) : undefined;
  const trimestre = sp.trimestre ? Number(sp.trimestre) : undefined;
  const type: TypeNote = sp.type === "composition" ? "composition" : "devoir";

  const pretASaisir = Boolean(classeId && matiereId && trimestre);
  const eleves = pretASaisir ? listElevesParClasse(classeId!) : [];
  const valeurs = pretASaisir
    ? Object.fromEntries(
        getNotesPourSaisie(classeId!, matiereId!, trimestre!, type)
      )
    : {};

  return (
    <div>
      <Link
        href="/notes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <IconArrowLeft className="h-4 w-4" />
        Retour aux notes
      </Link>
      <PageHeader
        title="Saisir des notes"
        description="Sélectionnez une classe, une matière, un trimestre et un type de note pour commencer la saisie."
      />

      <Card className="mb-6 p-5">
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="classe" className={labelClass}>
              Classe
            </label>
            <select
              id="classe"
              name="classe"
              defaultValue={sp.classe ?? ""}
              required
              className={inputClass}
            >
              <option value="" disabled>
                Choisir…
              </option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="matiere" className={labelClass}>
              Matière
            </label>
            <select
              id="matiere"
              name="matiere"
              defaultValue={sp.matiere ?? ""}
              required
              className={inputClass}
            >
              <option value="" disabled>
                Choisir…
              </option>
              {matieres.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="trimestre" className={labelClass}>
              Trimestre
            </label>
            <select
              id="trimestre"
              name="trimestre"
              defaultValue={sp.trimestre ?? ""}
              required
              className={inputClass}
            >
              <option value="" disabled>
                Choisir…
              </option>
              <option value="1">Trimestre 1</option>
              <option value="2">Trimestre 2</option>
              <option value="3">Trimestre 3</option>
            </select>
          </div>
          <div>
            <label htmlFor="type" className={labelClass}>
              Type de note
            </label>
            <select
              id="type"
              name="type"
              defaultValue={sp.type ?? "devoir"}
              className={inputClass}
            >
              <option value="devoir">Devoir</option>
              <option value="composition">Composition</option>
            </select>
          </div>
          <div className="sm:col-span-4">
            <button type="submit" className={btnPrimary}>
              Afficher les élèves
            </button>
          </div>
        </form>
      </Card>

      {sp.saved === "1" && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Notes enregistrées avec succès.
        </div>
      )}

      {pretASaisir &&
        (eleves.length === 0 ? (
          <EmptyState
            title="Aucun élève dans cette classe"
            description="Inscrivez des élèves dans la classe sélectionnée avant de saisir des notes."
          />
        ) : (
          <Card className="p-5">
            <SaisieNotesForm
              action={enregistrerNotesAction.bind(
                null,
                classeId!,
                matiereId!,
                trimestre!,
                type
              )}
              eleves={eleves}
              valeurs={valeurs}
              enseignants={enseignants}
              type={type}
            />
          </Card>
        ))}
    </div>
  );
}
