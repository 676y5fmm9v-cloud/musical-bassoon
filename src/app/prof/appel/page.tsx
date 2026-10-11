import { verifySession } from "@/lib/auth/dal";
import { listAffectationsParEnseignant, listClassesEnseignees } from "@/lib/repo/affectations";
import { listMatieres } from "@/lib/repo/matieres";
import { listElevesParClasse } from "@/lib/repo/eleves";
import { getAppelExistant } from "@/lib/repo/absences";
import { enregistrerAppelAction } from "./actions";
import { AppelForm } from "./AppelForm";
import { Card, EmptyState, PageHeader, btnPrimary, inputClass, labelClass } from "@/components/ui";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function AppelPage({
  searchParams,
}: {
  searchParams: Promise<{ classe?: string; matiere?: string; date?: string; saved?: string }>;
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
  const date = sp.date || today();

  const affectationChoisie = Boolean(classeId && matiereId);
  const affectationValide =
    affectationChoisie &&
    affectations.some((a) => a.classe_id === classeId && a.matiere_id === matiereId);

  const eleves = affectationValide ? listElevesParClasse(classeId!) : [];
  const existantMap = affectationValide ? getAppelExistant(classeId!, matiereId!, date) : new Map();
  const existant = Object.fromEntries(existantMap);

  return (
    <div>
      <PageHeader title="Faire l'appel" description="Les parents des élèves absents seront notifiés." />

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
            <label htmlFor="date" className={labelClass}>Date</label>
            <input id="date" name="date" type="date" defaultValue={date} className={inputClass} />
          </div>
          <div className="flex items-end">
            <button type="submit" className={btnPrimary}>Afficher les élèves</button>
          </div>
        </form>
      </Card>

      {sp.saved === "1" && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Appel enregistré avec succès.
        </div>
      )}

      {affectationChoisie && !affectationValide && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Vous n&apos;enseignez pas cette matière dans cette classe.
        </div>
      )}

      {affectationValide &&
        (eleves.length === 0 ? (
          <EmptyState title="Aucun élève dans cette classe" />
        ) : (
          <Card className="p-5">
            <AppelForm
              action={enregistrerAppelAction.bind(null, classeId!, matiereId!, date)}
              eleves={eleves}
              existant={existant}
            />
          </Card>
        ))}
    </div>
  );
}
