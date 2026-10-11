import Link from "next/link";
import { listClasses } from "@/lib/repo/classes";
import { Card, EmptyState, PageHeader, btnPrimary } from "@/components/ui";
import { IconPlus } from "@/components/icons";

export default function ClassesPage() {
  const classes = listClasses();

  return (
    <div>
      <PageHeader
        title="Classes"
        description={`${classes.length} classe${classes.length > 1 ? "s" : ""} pour l'année scolaire en cours.`}
        action={
          <Link href="/classes/nouveau" className={btnPrimary}>
            <IconPlus className="h-4 w-4" />
            Nouvelle classe
          </Link>
        }
      />

      {classes.length === 0 ? (
        <EmptyState
          title="Aucune classe créée"
          description="Créez une classe pour pouvoir y inscrire des élèves."
          action={
            <Link href="/classes/nouveau" className={btnPrimary}>
              <IconPlus className="h-4 w-4" />
              Nouvelle classe
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <Link key={c.id} href={`/classes/${c.id}`}>
              <Card className="p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {c.nom}
                    </h3>
                    <p className="text-sm text-slate-500">{c.niveau}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {c.annee_scolaire}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {c.enseignant_nom ? (
                      <>Titulaire : {c.enseignant_nom}</>
                    ) : (
                      "Pas de titulaire"
                    )}
                  </span>
                  <span className="font-medium text-slate-800">
                    {c.effectif} élève{c.effectif > 1 ? "s" : ""}
                    {c.capacite ? ` / ${c.capacite}` : ""}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
