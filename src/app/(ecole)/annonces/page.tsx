import { listToutesAnnonces } from "@/lib/repo/annonces";
import { listAllClasses } from "@/lib/repo/classes";
import { AnnonceForm } from "./AnnonceForm";
import { deleteAnnonceAction } from "./actions";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";

const CIBLE_LABELS: Record<string, string> = {
  ecole: "Toute l'école",
  parents: "Parents",
  profs: "Professeurs",
  classe: "Classe",
};

function formatDate(value: string): string {
  try {
    return new Date(value + "Z").toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function AnnoncesPage() {
  const annonces = listToutesAnnonces();
  const classes = listAllClasses();

  return (
    <div>
      <PageHeader
        title="Annonces"
        description="Publiez des annonces pour l'école, une classe, les parents ou les professeurs."
      />

      <Card className="mb-6 p-6">
        <AnnonceForm classes={classes} />
      </Card>

      {annonces.length === 0 ? (
        <EmptyState title="Aucune annonce publiée" />
      ) : (
        <div className="space-y-3">
          {annonces.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{a.titre}</h3>
                    <Badge tone="blue">
                      {a.cible === "classe" && a.classe_nom ? a.classe_nom : CIBLE_LABELS[a.cible]}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600">{a.message}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {a.auteur_nom ?? "École"} · {formatDate(a.created_at)}
                  </p>
                </div>
                <DeleteButton
                  action={deleteAnnonceAction}
                  confirmMessage={`Supprimer l'annonce "${a.titre}" ?`}
                  label=""
                >
                  <input type="hidden" name="id" value={a.id} />
                </DeleteButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
