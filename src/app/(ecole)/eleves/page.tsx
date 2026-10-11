import Link from "next/link";
import { listEleves } from "@/lib/repo/eleves";
import { listAllClasses } from "@/lib/repo/classes";
import { Badge, Card, EmptyState, PageHeader, btnPrimary, inputClass } from "@/components/ui";
import { IconPlus, IconSearch } from "@/components/icons";

export default async function ElevesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; classe?: string; statut?: string }>;
}) {
  const params = await searchParams;
  const classeId = params.classe ? Number(params.classe) : undefined;
  const statut =
    params.statut === "actif" || params.statut === "inactif"
      ? params.statut
      : undefined;

  const eleves = listEleves({
    recherche: params.q,
    classeId,
    statut,
  });
  const classes = listAllClasses();

  return (
    <div>
      <PageHeader
        title="Élèves"
        description={`${eleves.length} élève${eleves.length > 1 ? "s" : ""} correspondant à votre recherche.`}
        action={
          <Link href="/eleves/nouveau" className={btnPrimary}>
            <IconPlus className="h-4 w-4" />
            Nouvel élève
          </Link>
        }
      />

      <Card className="mb-5 p-4">
        <form className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="relative sm:col-span-2">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="q"
              placeholder="Rechercher par nom, prénom ou matricule…"
              defaultValue={params.q}
              className={`${inputClass} pl-9`}
            />
          </div>
          <select name="classe" defaultValue={params.classe ?? ""} className={inputClass}>
            <option value="">Toutes les classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
          <select name="statut" defaultValue={params.statut ?? ""} className={inputClass}>
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
          <div className="sm:col-span-4">
            <button type="submit" className={btnPrimary}>
              Filtrer
            </button>
          </div>
        </form>
      </Card>

      {eleves.length === 0 ? (
        <EmptyState
          title="Aucun élève trouvé"
          description="Essayez de modifier vos filtres, ou inscrivez un nouvel élève."
          action={
            <Link href="/eleves/nouveau" className={btnPrimary}>
              <IconPlus className="h-4 w-4" />
              Nouvel élève
            </Link>
          }
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Matricule
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Nom et prénom
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Genre
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Classe
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eleves.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/eleves/${e.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {e.matricule}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <Link href={`/eleves/${e.id}`} className="hover:underline">
                      {e.prenom} {e.nom}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {e.genre === "M" ? "Masculin" : "Féminin"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {e.classe_nom ?? (
                      <span className="text-slate-400">Non assignée</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={e.statut === "actif" ? "green" : "red"}>
                      {e.statut === "actif" ? "Actif" : "Inactif"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
