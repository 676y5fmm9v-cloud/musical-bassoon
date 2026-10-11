import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import { getDevoir, listRendusPourDevoir } from "@/lib/repo/devoirs";
import { deleteDevoirAction, noterRenduAction } from "../actions";
import { Badge, Card, PageHeader, btnSecondary } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { IconArrowLeft } from "@/components/icons";

function formatDateHeure(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value + "Z").toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default async function DevoirDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const devoirId = Number(id);
  const session = await verifySession();

  const devoir = getDevoir(devoirId);
  if (!devoir || devoir.enseignant_id !== session.enseignantId) notFound();

  const rendus = listRendusPourDevoir(devoirId);

  return (
    <div>
      <Link href="/prof/devoirs" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <IconArrowLeft className="h-4 w-4" />
        Retour aux devoirs
      </Link>

      <PageHeader
        title={devoir.titre}
        description={`${devoir.classe_nom} · ${devoir.matiere_nom} · Limite : ${new Date(devoir.date_limite).toLocaleDateString("fr-FR")}`}
        action={
          <DeleteButton action={deleteDevoirAction} confirmMessage={`Supprimer le devoir "${devoir.titre}" ?`}>
            <input type="hidden" name="id" value={devoir.id} />
          </DeleteButton>
        }
      />

      {devoir.consignes && (
        <Card className="mb-6 p-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Consignes</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{devoir.consignes}</p>
        </Card>
      )}

      <Card className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Élève</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Statut</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Rendu le</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rendus.map((r) => (
              <tr key={r.eleve_id}>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  {r.eleve_prenom} {r.eleve_nom}
                </td>
                <td className="px-4 py-2.5">
                  <Badge tone={r.rendu_le ? "green" : "red"}>
                    {r.rendu_le ? "Rendu" : "Non rendu"}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 text-slate-500">{formatDateHeure(r.rendu_le)}</td>
                <td className="px-4 py-2.5">
                  <form action={noterRenduAction} className="flex items-center gap-2">
                    <input type="hidden" name="devoir_id" value={devoirId} />
                    <input type="hidden" name="eleve_id" value={r.eleve_id} />
                    <input
                      type="number"
                      name="note"
                      min={0}
                      max={20}
                      step={0.25}
                      defaultValue={r.note ?? ""}
                      className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                    <button type="submit" className={`${btnSecondary} !px-2.5 !py-1 text-xs`}>
                      OK
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
