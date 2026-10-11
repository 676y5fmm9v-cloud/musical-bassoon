import { requireRole } from "@/lib/auth/dal";
import { RoleShell, type NavItem } from "@/components/RoleShell";
import {
  IconDashboard,
  IconStudents,
  IconTeachers,
  IconClasses,
  IconSubjects,
  IconGrades,
  IconAnnonce,
  IconMessage,
} from "@/components/icons";

const ic = "h-5 w-5 shrink-0";

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Tableau de bord", icon: <IconDashboard className={ic} />, exact: true },
  { href: "/eleves", label: "Élèves", icon: <IconStudents className={ic} /> },
  { href: "/enseignants", label: "Enseignants", icon: <IconTeachers className={ic} /> },
  { href: "/classes", label: "Classes", icon: <IconClasses className={ic} /> },
  { href: "/matieres", label: "Matières", icon: <IconSubjects className={ic} /> },
  { href: "/notes", label: "Notes", icon: <IconGrades className={ic} /> },
  { href: "/annonces", label: "Annonces", icon: <IconAnnonce className={ic} /> },
  { href: "/messages", label: "Messages", icon: <IconMessage className={ic} /> },
];

const SOUS_ROLE_LABELS: Record<string, string> = {
  directeur: "Directeur",
  secretaire: "Secrétaire",
  comptable: "Comptable",
  superecole: "Fondateur",
};

export default async function EcoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("ecole");

  return (
    <RoleShell
      brandLabel="🏛 ESPACE ÉCOLE"
      userName={session.nom}
      userSubLabel={session.sousRole ? SOUS_ROLE_LABELS[session.sousRole] : "Direction"}
      accent="green"
      navItems={NAV_ITEMS}
    >
      {children}
    </RoleShell>
  );
}
