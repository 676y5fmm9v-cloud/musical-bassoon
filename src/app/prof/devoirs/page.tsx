import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { listDevoirsParEnseignant } from "@/lib/repo/devoirs";
import { Badge, Card, EmptyState, PageHeader, btnPrimary } from "@/components/ui";
import { IconPlus } from "@/components/icons";

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("fr-FR");
  } catch {
    return value;
  }
}

export default async function ProfDevoirsPage() {
  const session = await verifySession();
  const devoirs = listDevoirsParEnseignant(session.enseignantId!);

  return (
    <div>
      <PageHeader
        title="Devoirs"
        description={`${devoirs.length} devoir(s) créé(s).`}
        action={
          <Link href="/prof/devoirs/nouveau" className={btnPrimary}>
            <IconPlus className="h-4 w-4" />
            Créer un devoir
          </Link>
        }
      />

      {devoirs.length === 0 ? (
        <EmptyState title="Aucun devoir créé" />
      ) : (
        <div className="space-y-3">
          {devoirs.map((d) => {
            const enRetard = new Date(d.date_limite) < new Date();
            return (
              <Link key={d.id} href={`/prof/devoirs/${d.id}`}>
                <Card className="p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{d.titre}</h3>
                      <p className="text-sm text-slate-500">
                        {d.classe_nom} · {d.matiere_nom} · Limite : {formatDate(d.date_limite)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={enRetard ? "slate" : "amber"}>
                        {enRetard ? "Clôturé" : "En cours"}
                      </Badge>
                      <Badge tone="blue">{d.nb_rendus}/{d.nb_eleves} rendus</Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
