import { requireRole } from "@/lib/auth/dal";
import { RoleShell, type NavItem } from "@/components/RoleShell";
import { IconDashboard, IconGrades, IconAttendance, IconMessage } from "@/components/icons";

const ic = "h-5 w-5 shrink-0";

const NAV_ITEMS: NavItem[] = [
  { href: "/parent", label: "Accueil", icon: <IconDashboard className={ic} />, exact: true },
  { href: "/parent/notes", label: "Notes", icon: <IconGrades className={ic} /> },
  { href: "/parent/absences", label: "Absences", icon: <IconAttendance className={ic} /> },
  { href: "/parent/messages", label: "Messages", icon: <IconMessage className={ic} /> },
];

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("parent");

  return (
    <RoleShell brandLabel="👪 ESPACE PARENT" userName={session.nom} accent="red" navItems={NAV_ITEMS}>
      {children}
    </RoleShell>
  );
}
