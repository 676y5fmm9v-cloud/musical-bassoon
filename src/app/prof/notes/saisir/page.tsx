import { verifySession } from "@/lib/auth/dal";
import { listAffectationsParEnseignant, listClassesEnseignees } from "@/lib/repo/affectations";
import { listMatieres } from "@/lib/repo/matieres";
import { listElevesParClasse } from "@/lib/repo/eleves";
import { getNotesPourSaisie } from "@/lib/repo/notes";
import { enregistrerNotesProfAction } from "../actions";
import { SaisieNotesForm } from "@/components/notes/SaisieNotesForm";
import { Card, EmptyState, PageHeader, btnPrimary, inputClass, labelClass } from "@/components/ui";
import type { TypeNote } from "@/lib/types";

export default async function ProfSaisirNotesPage({
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
  const session = await verifySession();
  const sp = await searchParams;
  const affectations = listAffectationsParEnseignant(session.enseignantId!);
  const classes = listClassesEnseignees(session.enseignantId!);
  const matieresEnseignees = listMatieres().filter((m) =>
    affectations.some((a) => a.matiere_id === m.id)
  );

  const classeId = sp.classe ? Number(sp.classe) : undefined;
  const matiereId = sp.matiere ? Number(sp.matiere) : undefined;
  const trimestre = sp.trimestre ? Number(sp.trimestre) : undefined;
  const type: TypeNote = sp.type === "composition" ? "composition" : "devoir";

  const affectationChoisie = Boolean(classeId && matiereId);
  const affectationValide =
    affectationChoisie &&
    affectations.some((a) => a.classe_id === classeId && a.matiere_id === matiereId);
  const pretASaisir = Boolean(affectationValide && trimestre);

  const eleves = pretASaisir ? listElevesParClasse(classeId!) : [];
  const valeurs = pretASaisir
    ? Object.fromEntries(getNotesPourSaisie(classeId!, matiereId!, trimestre!, type))
    : {};

  return (
    <div>
      <PageHeader
        title="Saisir des notes"
        description="Choisissez une classe, une matière (parmi vos affectations), un trimestre et un type de note."
      />

      <Card className="mb-6 p-5">
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="classe" className={labelClass}>Classe</label>
            <select id="classe" name="classe" defaultValue={sp.classe ?? ""} required className={inputClass}>
              <option value="" disabled>Choisir…</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="matiere" className={labelClass}>Matière</label>
            <select id="matiere" name="matiere" defaultValue={sp.matiere ?? ""} required className={inputClass}>
              <option value="" disabled>Choisir…</option>
              {matieresEnseignees.map((m) => (
                <option key={m.id} value={m.id}>{m.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="trimestre" className={labelClass}>Trimestre</label>
            <select id="trimestre" name="trimestre" defaultValue={sp.trimestre ?? ""} required className={inputClass}>
              <option value="" disabled>Choisir…</option>
              <option value="1">Trimestre 1</option>
              <option value="2">Trimestre 2</option>
              <option value="3">Trimestre 3</option>
            </select>
          </div>
          <div>
            <label htmlFor="type" className={labelClass}>Type de note</label>
            <select id="type" name="type" defaultValue={sp.type ?? "devoir"} className={inputClass}>
              <option value="devoir">Devoir</option>
              <option value="composition">Composition</option>
            </select>
          </div>
          <div className="sm:col-span-4">
            <button type="submit" className={btnPrimary}>Afficher les élèves</button>
          </div>
        </form>
      </Card>

      {sp.saved === "1" && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Notes enregistrées avec succès.
        </div>
      )}

      {affectationChoisie && !affectationValide && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Vous n&apos;enseignez pas cette matière dans cette classe.
        </div>
      )}

      {pretASaisir &&
        (eleves.length === 0 ? (
          <EmptyState title="Aucun élève dans cette classe" />
        ) : (
          <Card className="p-5">
            <SaisieNotesForm
              action={enregistrerNotesProfAction.bind(null, classeId!, matiereId!, trimestre!, type)}
              eleves={eleves}
              valeurs={valeurs}
              enseignantFixe={{ id: session.enseignantId!, nom: session.nom }}
              type={type}
            />
          </Card>
        ))}
    </div>
  );
}
