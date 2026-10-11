import { requireRole } from "@/lib/auth/dal";
import { RoleShell, type NavItem } from "@/components/RoleShell";
import {
  IconDashboard,
  IconClasses,
  IconHomework,
  IconBook,
  IconNotebook,
  IconGrades,
  IconAttendance,
  IconMessage,
} from "@/components/icons";

const ic = "h-5 w-5 shrink-0";

const NAV_ITEMS: NavItem[] = [
  { href: "/prof", label: "Accueil", icon: <IconDashboard className={ic} />, exact: true },
  { href: "/prof/classes", label: "Mes classes", icon: <IconClasses className={ic} /> },
  { href: "/prof/cours", label: "Mes cours", icon: <IconBook className={ic} /> },
  { href: "/prof/devoirs", label: "Devoirs", icon: <IconHomework className={ic} /> },
  { href: "/prof/notes/saisir", label: "Saisir des notes", icon: <IconGrades className={ic} /> },
  { href: "/prof/appel", label: "Faire l'appel", icon: <IconAttendance className={ic} /> },
  { href: "/prof/cahier", label: "Cahier de textes", icon: <IconNotebook className={ic} /> },
  { href: "/prof/messages", label: "Messages", icon: <IconMessage className={ic} /> },
];

export default async function ProfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("prof");

  return (
    <RoleShell
      brandLabel="PROFESSEUR"
      userName={session.nom}
      accent="green"
      navItems={NAV_ITEMS}
    >
      {children}
    </RoleShell>
  );
}
