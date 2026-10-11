import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { listClassesEnseignees } from "@/lib/repo/affectations";
import { listDevoirsParEnseignant } from "@/lib/repo/devoirs";
import { listCoursParEnseignant } from "@/lib/repo/cours";
import { Card, PageHeader, EmptyState } from "@/components/ui";

export default async function ProfAccueilPage() {
  const session = await verifySession();
  const enseignantId = session.enseignantId!;

  const classes = listClassesEnseignees(enseignantId);
  const devoirs = listDevoirsParEnseignant(enseignantId);
  const cours = listCoursParEnseignant(enseignantId);

  const devoirsEnCours = devoirs.filter((d) => new Date(d.date_limite) >= new Date());

  return (
    <div>
      <PageHeader
        title={`Bonjour, ${session.nom} 👋`}
        description="Voici un aperçu de vos activités."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Mes classes</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{classes.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Devoirs en cours</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{devoirsEnCours.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Cours publiés</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{cours.length}</p>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Mes classes</h2>
          {classes.length === 0 ? (
            <EmptyState
              title="Aucune classe affectée"
              description="Demandez à l'administration de vous affecter à une classe et une matière."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {classes.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2.5">
                  <Link href={`/prof/classes/${c.id}`} className="font-medium text-slate-800 hover:underline">
                    {c.nom}
                  </Link>
                  <span className="text-sm text-slate-500">{c.niveau}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Actions rapides</h2>
          <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            <Link href="/prof/cours/nouveau" className="hover:text-kalan-green hover:underline">
              📖 Publier un cours
            </Link>
            <Link href="/prof/devoirs/nouveau" className="hover:text-kalan-green hover:underline">
              📝 Créer un devoir
            </Link>
            <Link href="/prof/notes/saisir" className="hover:text-kalan-green hover:underline">
              🅰️ Saisir des notes
            </Link>
            <Link href="/prof/appel" className="hover:text-kalan-green hover:underline">
              ✋ Faire l&apos;appel
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
