import { requireRole } from "@/lib/auth/dal";
import { RoleShell, type NavItem } from "@/components/RoleShell";
import {
  IconDashboard,
  IconGrades,
  IconHomework,
  IconBook,
  IconNotebook,
  IconAttendance,
  IconMessage,
} from "@/components/icons";

const ic = "h-5 w-5 shrink-0";

const NAV_ITEMS: NavItem[] = [
  { href: "/eleve", label: "Accueil", icon: <IconDashboard className={ic} />, exact: true },
  { href: "/eleve/notes", label: "Mes notes", icon: <IconGrades className={ic} /> },
  { href: "/eleve/devoirs", label: "Devoirs", icon: <IconHomework className={ic} /> },
  { href: "/eleve/cours", label: "Cours", icon: <IconBook className={ic} /> },
  { href: "/eleve/cahier", label: "Cahier de textes", icon: <IconNotebook className={ic} /> },
  { href: "/eleve/absences", label: "Absences", icon: <IconAttendance className={ic} /> },
  { href: "/eleve/messages", label: "Messages", icon: <IconMessage className={ic} /> },
];

export default async function EleveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("eleve");

  return (
    <RoleShell brandLabel="ÉLÈVE" userName={session.nom} accent="green" navItems={NAV_ITEMS}>
      {children}
    </RoleShell>
  );
}
