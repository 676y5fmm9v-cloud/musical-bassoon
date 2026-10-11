import { Messagerie } from "@/components/messagerie/Messagerie";
import { PageHeader } from "@/components/ui";

export default function MessagesParentPage({
  searchParams,
}: {
  searchParams: Promise<{ avec?: string; nouveau?: string }>;
}) {
  return (
    <div>
      <PageHeader title="Messages" description="Communiquez avec les enseignants et la direction." />
      <Messagerie basePath="/parent/messages" searchParams={searchParams} />
    </div>
  );
}
