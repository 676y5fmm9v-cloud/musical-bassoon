import { verifySession } from "@/lib/auth/dal";
import { listClassesEnseignees } from "@/lib/repo/affectations";
import { listMatieres } from "@/lib/repo/matieres";
import { DevoirForm } from "../DevoirForm";
import { Card, PageHeader } from "@/components/ui";

export default async function NouveauDevoirPage({
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
      <PageHeader title="Créer un devoir" description="Les élèves recevront une notification avant la date limite." />
      <Card className="p-6">
        <DevoirForm
          classes={classes}
          matieres={matieres}
          classeIdDefaut={sp.classe ? Number(sp.classe) : undefined}
        />
      </Card>
    </div>
  );
}
