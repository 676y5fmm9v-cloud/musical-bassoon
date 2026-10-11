import Link from "next/link";
import { getStatsGenerales, getEffectifsParClasse } from "@/lib/repo/stats";
import { Card, PageHeader } from "@/components/ui";
import {
  IconStudents,
  IconTeachers,
  IconClasses,
  IconSubjects,
} from "@/components/icons";

export default function DashboardPage() {
  const stats = getStatsGenerales();
  const effectifs = getEffectifsParClasse();

  const totalGarcons =
    stats.repartitionGenre.find((g) => g.genre === "M")?.total ?? 0;
  const totalFilles =
    stats.repartitionGenre.find((g) => g.genre === "F")?.total ?? 0;

  const cards = [
    {
      label: "Élèves inscrits",
      value: stats.totalEleves,
      icon: IconStudents,
      href: "/eleves",
      tone: "text-blue-600 bg-blue-50",
    },
    {
      label: "Enseignants",
      value: stats.totalEnseignants,
      icon: IconTeachers,
      href: "/enseignants",
      tone: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Classes",
      value: stats.totalClasses,
      icon: IconClasses,
      href: "/classes",
      tone: "text-amber-600 bg-amber-50",
    },
    {
      label: "Matières",
      value: stats.totalMatieres,
      icon: IconSubjects,
      href: "/matieres",
      tone: "text-purple-600 bg-purple-50",
    },
  ];

  const maxEffectif = Math.max(1, ...effectifs.map((e) => e.effectif));

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de l'école Kalan pour l'année scolaire 2025-2026."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card className="p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {c.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {c.value}
                  </p>
                </div>
                <div className={`rounded-lg p-3 ${c.tone}`}>
                  <c.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">
            Effectif par classe
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Nombre d&apos;élèves actifs inscrits dans chaque classe.
          </p>
          {effectifs.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">
              Aucune classe pour le moment.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {effectifs.map((e) => (
                <div key={e.classeId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <Link
                      href={`/classes/${e.classeId}`}
                      className="font-medium text-slate-800 hover:text-slate-950 hover:underline"
                    >
                      {e.nom}
                    </Link>
                    <span className="text-slate-500">
                      {e.effectif} élève{e.effectif > 1 ? "s" : ""}
                      {e.capacite ? ` / ${e.capacite}` : ""}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{
                        width: `${(e.effectif / maxEffectif) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-slate-900">
            Statistiques générales
          </h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Moyenne générale</dt>
              <dd className="font-semibold text-slate-900">
                {stats.moyenneGenerale !== null
                  ? `${stats.moyenneGenerale}/20`
                  : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Garçons</dt>
              <dd className="font-semibold text-slate-900">
                {totalGarcons}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Filles</dt>
              <dd className="font-semibold text-slate-900">
                {totalFilles}
              </dd>
            </div>
          </dl>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="mb-3 text-sm font-medium text-slate-700">
              Actions rapides
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/eleves/nouveau"
                className="text-sm font-medium text-slate-700 hover:text-slate-950 hover:underline"
              >
                + Inscrire un nouvel élève
              </Link>
              <Link
                href="/notes/saisir"
                className="text-sm font-medium text-slate-700 hover:text-slate-950 hover:underline"
              >
                + Saisir des notes
              </Link>
              <Link
                href="/classes/nouveau"
                className="text-sm font-medium text-slate-700 hover:text-slate-950 hover:underline"
              >
                + Créer une classe
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
