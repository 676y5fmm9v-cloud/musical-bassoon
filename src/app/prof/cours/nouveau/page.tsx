import { verifySession } from "@/lib/auth/dal";
import { listClassesEnseignees } from "@/lib/repo/affectations";
import { listMatieres } from "@/lib/repo/matieres";
import { CoursForm } from "../CoursForm";
import { Card, PageHeader } from "@/components/ui";

export default async function NouveauCoursPage({
  searchParams,
}: {
  searchParams: Promise<{ classe?: string }>;
}) {
  const session = await verifySession();
  const sp = await searchParams;
  const classes = listClassesEnseignees(session.enseignantId!);
  const matieres = listMatieres();

  return (
    <div>
      <PageHeader title="Publier un cours" description="Les élèves de la classe seront notifiés." />
      <Card className="p-6">
        <CoursForm
          classes={classes}
          matieres={matieres}
          classeIdDefaut={sp.classe ? Number(sp.classe) : undefined}
        />
      </Card>
    </div>
  );
}
