import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { listClassesEnseignees } from "@/lib/repo/affectations";
import { listElevesParClasse } from "@/lib/repo/eleves";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export default async function ProfClassesPage() {
  const session = await verifySession();
  const classes = listClassesEnseignees(session.enseignantId!);

  return (
    <div>
      <PageHeader title="Mes classes" description={`${classes.length} classe(s) affectée(s).`} />
      {classes.length === 0 ? (
        <EmptyState title="Aucune classe affectée" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => {
            const effectif = listElevesParClasse(c.id).length;
            return (
              <Link key={c.id} href={`/prof/classes/${c.id}`}>
                <Card className="p-5 transition-shadow hover:shadow-md">
                  <h3 className="text-lg font-semibold text-slate-900">{c.nom}</h3>
                  <p className="text-sm text-slate-500">{c.niveau}</p>
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    {effectif} élève{effectif > 1 ? "s" : ""}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
