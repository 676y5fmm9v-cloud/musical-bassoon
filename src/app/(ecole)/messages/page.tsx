import { Messagerie } from "@/components/messagerie/Messagerie";
import { PageHeader } from "@/components/ui";

export default function MessagesEcolePage({
  searchParams,
}: {
  searchParams: Promise<{ avec?: string; nouveau?: string }>;
}) {
  return (
    <div>
      <PageHeader title="Messages" description="Communiquez avec les élèves, parents et enseignants." />
      <Messagerie basePath="/messages" searchParams={searchParams} />
    </div>
  );
}
